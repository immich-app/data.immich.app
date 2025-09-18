import { DateTime } from 'luxon';
import { Metric } from 'src/interfaces/metrics.interface';
import { DiscordRepository } from 'src/repositories/discord.repository';
import { InfluxMetricsPushProvider } from 'src/repositories/influx-metrics-provider.repository';
import { MetricsPushRepository } from 'src/repositories/metrics-push.repository';

class DiscordBackfillService {
  private discordRepository = new DiscordRepository();

  constructor(
    private metricsRepository: MetricsPushRepository,
    private influxProvider: InfluxMetricsPushProvider,
    private env: string,
  ) {}

  async backfillDiscord(guildId: string, botToken?: string) {
    console.log('Starting Discord backfill...');
    console.log(`Guild ID: ${guildId}`);
    console.log(`Bot Token provided: ${!!botToken}`);

    // Delete existing time series
    await this.deleteTimeSeries('immich_data_repository_discord_.*', this.env);

    if (!botToken) {
      console.log('No bot token provided, can only fetch current stats from public API');
      return;
    }

    // Verify bot access and fetch member data
    console.log('Verifying bot access to guild...');
    try {
      const guildInfo = await this.discordRepository.getGuildInfo(guildId, botToken);
      console.log(`Successfully connected to guild: ${guildInfo.name}`);
      console.log(`Approximate member count: ${guildInfo.approximate_member_count}`);

      // Fetch all members and push historical metrics
      const membersByDate = await this.fetchMembersAndBuildTimeline(guildId, botToken);
      await this.pushHistoricalMetrics(membersByDate);
    } catch (error) {
      console.error('Failed to access guild with bot token:', error);
    }

    console.log('Discord backfill complete');
  }

  private async fetchMembersAndBuildTimeline(guildId: string, botToken: string): Promise<Map<DateTime, number>> {
    console.log('Fetching all guild members from Discord...');

    const membersByDate = new Map<DateTime, number>();
    let after: string | undefined;
    let totalMembers = 0;

    while (true) {
      try {
        const members = await this.discordRepository.getGuildMembers(guildId, botToken, 1000, after);

        if (members.length === 0) {
          break;
        }

        // Process each member's join date
        for (const member of members) {
          if (!member.user || !member.joined_at) {
            continue;
          }

          const joinDate = DateTime.fromISO(member.joined_at).startOf('day');
          membersByDate.set(joinDate, (membersByDate.get(joinDate) || 0) + 1);
        }

        totalMembers += members.length;
        console.log(`Fetched ${totalMembers} members so far...`);

        // Get the last member's ID for pagination
        const lastMember = members[members.length - 1];
        after = lastMember.user?.id;

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error: any) {
        // Handle rate limiting
        if (error.message?.includes('429')) {
          const retryAfter = this.extractRetryAfter(error.message);
          console.log(`Rate limited. Waiting ${retryAfter}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          continue;
        }
        throw error;
      }
    }

    console.log(`Found ${totalMembers} total members in guild`);
    return membersByDate;
  }

  private async pushHistoricalMetrics(membersByDate: Map<DateTime, number>) {
    console.log('Pushing historical metrics to InfluxDB...');

    // Sort dates and build cumulative count
    const sortedDates = Array.from(membersByDate.keys()).sort((a, b) => a.toMillis() - b.toMillis());

    let cumulativeCount = 0;
    let metricsCount = 0;

    for (const date of sortedDates) {
      cumulativeCount += membersByDate.get(date) || 0;

      const metric = new Metric('discord_member')
        .setTimestamp(date.toJSDate())
        .intField('total', cumulativeCount)
        .addTag('environment', this.env);

      this.metricsRepository.push(metric);
      metricsCount++;

      // Flush every 100 metrics
      if (metricsCount % 100 === 0) {
        await this.influxProvider.flush();
        console.log(`Flushed ${metricsCount} metrics...`);
      }
    }

    await this.influxProvider.flush();
    console.log(`Total historical metrics pushed: ${metricsCount}`);
  }

  private extractRetryAfter(errorMessage: string): number {
    try {
      const match = errorMessage.match(/"retry_after":\s*([\d.]+)/);
      if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000) + 100;
      }
    } catch {
      // Ignore parsing errors
    }
    return 1000; // Default to 1 second
  }

  private async deleteTimeSeries(namePattern: string, environment: string) {
    const url = new URL(`${process.env.VMETRICS_DATA_API_URL}/api/v1/admin/tsdb/delete_series`);
    const match = `{__name__=~'${namePattern}',environment='${environment}'}`;
    url.search = new URLSearchParams({ ['match[]']: match }).toString();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VMETRICS_DATA_ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Deleting time series ${match}`);
    if (response.status !== 204) {
      console.log(response.status);
      throw new Error(`Failed to delete time series ${match}`);
    }
  }
}

// Main execution
const main = async () => {
  if (
    !process.env.VMETRICS_DATA_WRITE_TOKEN ||
    !process.env.VMETRICS_DATA_API_URL ||
    !process.env.VMETRICS_DATA_ADMIN_TOKEN
  ) {
    throw new Error('Missing VMetrics API credentials');
  }

  if (!process.env.ENVIRONMENT) {
    throw new Error('Missing environment');
  }

  const env = `${process.env.ENVIRONMENT}${process.env.TF_VAR_stage ? `_${process.env.TF_VAR_stage}` : ''}`;
  const influxProvider = new InfluxMetricsPushProvider(
    process.env.VMETRICS_DATA_API_URL,
    process.env.VMETRICS_DATA_WRITE_TOKEN,
  );
  const metricsRepository = new MetricsPushRepository('immich_data_repository', {}, [influxProvider]);

  const service = new DiscordBackfillService(metricsRepository, influxProvider, env);

  // Discord configuration
  const guildId = process.env.DISCORD_GUILD_ID || '979116623879368755'; // Immich Discord server ID
  const botToken = process.env.DISCORD_BOT_TOKEN;

  await service.backfillDiscord(guildId, botToken);
};

main()
  .then(() => console.log('Discord backfill complete'))
  .catch(console.error);
