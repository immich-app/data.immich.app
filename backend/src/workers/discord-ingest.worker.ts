import { IMetricsPushRepository, Metric } from 'src/interfaces/metrics.interface';
import { DiscordRepository } from 'src/repositories/discord.repository';

export class DiscordIngestWorker {
  private discordRepository = new DiscordRepository();

  constructor(
    private metricsRepository: IMetricsPushRepository,
    private envTag: string,
  ) {}

  async fetchAndStoreCurrentMetrics(inviteCode: string = 'immich') {
    try {
      const data = await this.discordRepository.getGuildStats(inviteCode);

      const metrics = [
        new Metric('discord_member')
          .intField('total', data.approximate_member_count)
          .addTag('environment', this.envTag),
        new Metric('discord_online')
          .intField('total', data.approximate_presence_count)
          .addTag('environment', this.envTag),
        new Metric('discord_nitro')
          .intField('total', data.guild.premium_subscription_count)
          .addTag('environment', this.envTag),
        new Metric('discord_server_tier')
          .intField('level', data.guild.premium_tier)
          .addTag('environment', this.envTag),
      ];

      metrics.forEach((metric) => this.metricsRepository.push(metric));

      return {
        members: data.approximate_member_count,
        online: data.approximate_presence_count,
        nitro: data.guild.premium_subscription_count,
        tier: data.guild.premium_tier,
      };
    } catch (error) {
      console.error(`Failed to fetch Discord data for invite ${inviteCode}:`, error);
      throw error;
    }
  }
}