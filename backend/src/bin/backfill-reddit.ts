import { DateTime } from 'luxon';
import { Metric } from 'src/interfaces/metrics.interface';
import { InfluxMetricsPushProvider } from 'src/repositories/influx-metrics-provider.repository';
import { MetricsPushRepository } from 'src/repositories/metrics-push.repository';

interface RedditDataPoint {
  timestamp: DateTime;
  subscribers: number;
}

// Historical data points we know about
const KNOWN_DATA_POINTS: RedditDataPoint[] = [
  { timestamp: DateTime.fromSeconds(1649635200), subscribers: 2 },
  { timestamp: DateTime.fromSeconds(1660262400), subscribers: 21 },
  { timestamp: DateTime.fromSeconds(1661040000), subscribers: 26 },
  { timestamp: DateTime.fromSeconds(1661126400), subscribers: 27 },
  { timestamp: DateTime.fromSeconds(1662076800), subscribers: 38 },
  { timestamp: DateTime.fromSeconds(1665360000), subscribers: 59 },
  { timestamp: DateTime.fromSeconds(1667952000), subscribers: 87 },
  { timestamp: DateTime.fromSeconds(1669680000), subscribers: 111 },
  { timestamp: DateTime.fromSeconds(1671321600), subscribers: 124 },
  { timestamp: DateTime.fromSeconds(1672358400), subscribers: 137 },
  { timestamp: DateTime.fromSeconds(1673308800), subscribers: 160 },
  { timestamp: DateTime.fromSeconds(1674259200), subscribers: 180 },
  { timestamp: DateTime.fromSeconds(1676332800), subscribers: 210 },
  { timestamp: DateTime.fromSeconds(1677801600), subscribers: 236 },
  { timestamp: DateTime.fromSeconds(1678579200), subscribers: 246 },
  { timestamp: DateTime.fromSeconds(1679270400), subscribers: 254 },
  { timestamp: DateTime.fromSeconds(1680307200), subscribers: 281 },
  { timestamp: DateTime.fromSeconds(1680652800), subscribers: 299 },
  { timestamp: DateTime.fromSeconds(1681084800), subscribers: 319 },
  { timestamp: DateTime.fromSeconds(1681603200), subscribers: 335 },
  { timestamp: DateTime.fromSeconds(1682035200), subscribers: 354 },
  { timestamp: DateTime.fromSeconds(1682380800), subscribers: 368 },
  { timestamp: DateTime.fromSeconds(1682985600), subscribers: 389 },
  { timestamp: DateTime.fromSeconds(1683590400), subscribers: 410 },
  { timestamp: DateTime.fromSeconds(1684022400), subscribers: 424 },
  { timestamp: DateTime.fromSeconds(1684454400), subscribers: 444 },
  { timestamp: DateTime.fromSeconds(1684800000), subscribers: 474 },
  { timestamp: DateTime.fromSeconds(1685318400), subscribers: 500 },
  { timestamp: DateTime.fromSeconds(1685750400), subscribers: 539 },
  { timestamp: DateTime.fromSeconds(1686096000), subscribers: 567 },
  { timestamp: DateTime.fromSeconds(1686441600), subscribers: 585 },
  { timestamp: DateTime.fromSeconds(1687046400), subscribers: 590 },
  { timestamp: DateTime.fromSeconds(1687478400), subscribers: 615 },
  { timestamp: DateTime.fromSeconds(1687824000), subscribers: 643 },
  { timestamp: DateTime.fromSeconds(1688256000), subscribers: 670 },
  { timestamp: DateTime.fromSeconds(1688601600), subscribers: 695 },
  { timestamp: DateTime.fromSeconds(1688947200), subscribers: 722 },
  { timestamp: DateTime.fromSeconds(1689292800), subscribers: 748 },
  { timestamp: DateTime.fromSeconds(1689811200), subscribers: 782 },
  { timestamp: DateTime.fromSeconds(1690502400), subscribers: 836 },
  { timestamp: DateTime.fromSeconds(1690761600), subscribers: 871 },
  { timestamp: DateTime.fromSeconds(1691280000), subscribers: 908 },
  { timestamp: DateTime.fromSeconds(1691625600), subscribers: 927 },
  { timestamp: DateTime.fromSeconds(1692403200), subscribers: 978 },
  { timestamp: DateTime.fromSeconds(1692662400), subscribers: 1013 },
  { timestamp: DateTime.fromSeconds(1693267200), subscribers: 1056 },
  { timestamp: DateTime.fromSeconds(1693699200), subscribers: 1095 },
  { timestamp: DateTime.fromSeconds(1693958400), subscribers: 1118 },
  { timestamp: DateTime.fromSeconds(1694304000), subscribers: 1133 },
  { timestamp: DateTime.fromSeconds(1694649600), subscribers: 1153 },
  { timestamp: DateTime.fromSeconds(1694995200), subscribers: 1174 },
  { timestamp: DateTime.fromSeconds(1695340800), subscribers: 1217 },
  { timestamp: DateTime.fromSeconds(1695600000), subscribers: 1243 },
  { timestamp: DateTime.fromSeconds(1695945600), subscribers: 1281 },
  { timestamp: DateTime.fromSeconds(1696204800), subscribers: 1302 },
  { timestamp: DateTime.fromSeconds(1696550400), subscribers: 1355 },
  { timestamp: DateTime.fromSeconds(1696809600), subscribers: 1401 },
  { timestamp: DateTime.fromSeconds(1697241600), subscribers: 1453 },
  { timestamp: DateTime.fromSeconds(1697500800), subscribers: 1483 },
  { timestamp: DateTime.fromSeconds(1697760000), subscribers: 1503 },
  { timestamp: DateTime.fromSeconds(1698019200), subscribers: 1545 },
  { timestamp: DateTime.fromSeconds(1698451200), subscribers: 1597 },
  { timestamp: DateTime.fromSeconds(1698710400), subscribers: 1641 },
  { timestamp: DateTime.fromSeconds(1698969600), subscribers: 1697 },
  { timestamp: DateTime.fromSeconds(1699315200), subscribers: 1752 },
  { timestamp: DateTime.fromSeconds(1699660800), subscribers: 1788 },
  { timestamp: DateTime.fromSeconds(1699833600), subscribers: 1812 },
  { timestamp: DateTime.fromSeconds(1700092800), subscribers: 1875 },
  { timestamp: DateTime.fromSeconds(1700438400), subscribers: 1949 },
  { timestamp: DateTime.fromSeconds(1700784000), subscribers: 2016 },
  { timestamp: DateTime.fromSeconds(1701129600), subscribers: 2068 },
  { timestamp: DateTime.fromSeconds(1701475200), subscribers: 2136 },
  { timestamp: DateTime.fromSeconds(1701820800), subscribers: 2192 },
  { timestamp: DateTime.fromSeconds(1702166400), subscribers: 2251 },
  { timestamp: DateTime.fromSeconds(1702512000), subscribers: 2310 },
  { timestamp: DateTime.fromSeconds(1702684800), subscribers: 2353 },
  { timestamp: DateTime.fromSeconds(1703548800), subscribers: 2542 },
  { timestamp: DateTime.fromSeconds(1704575992), subscribers: 2826 },
  // Gap in historical data
  { timestamp: DateTime.fromSeconds(1709528400), subscribers: 4000 },
  { timestamp: DateTime.fromSeconds(1712203200), subscribers: 5000 },
  { timestamp: DateTime.fromSeconds(1724403398), subscribers: 9476 },
  { timestamp: DateTime.fromSeconds(1727411726), subscribers: 10884 },
  { timestamp: DateTime.fromSeconds(1733279612), subscribers: 14362 },
  { timestamp: DateTime.fromSeconds(1734757200), subscribers: 16000 },
  { timestamp: DateTime.fromSeconds(1734878583), subscribers: 16167 },
  { timestamp: DateTime.fromSeconds(1735490966), subscribers: 17012 },
  { timestamp: DateTime.fromSeconds(1738040400), subscribers: 20000 },
  { timestamp: DateTime.fromSeconds(1739125889), subscribers: 20767 },
  { timestamp: DateTime.fromSeconds(1741468187), subscribers: 22532 },
  { timestamp: DateTime.fromSeconds(1741474683), subscribers: 22604 },
  { timestamp: DateTime.fromSeconds(1741826945), subscribers: 22829 },
  { timestamp: DateTime.fromSeconds(1743096105), subscribers: 23771 },
  { timestamp: DateTime.fromSeconds(1743900139), subscribers: 24353 },
  { timestamp: DateTime.fromSeconds(1745763306), subscribers: 25611 },
  { timestamp: DateTime.fromSeconds(1747627200), subscribers: 27000 },
  { timestamp: DateTime.fromSeconds(1748727093), subscribers: 27901 },
  { timestamp: DateTime.fromSeconds(1749960000), subscribers: 28756 },
  { timestamp: DateTime.fromSeconds(1752379200), subscribers: 30378 },
  { timestamp: DateTime.fromSeconds(1752653774), subscribers: 30480 },
  { timestamp: DateTime.fromSeconds(1753142400), subscribers: 30799 },
  { timestamp: DateTime.fromSeconds(1753574400), subscribers: 31199 },
  { timestamp: DateTime.fromSeconds(1753920000), subscribers: 31469 },
  { timestamp: DateTime.fromSeconds(1754352000), subscribers: 31776 },
  { timestamp: DateTime.fromSeconds(1754625600), subscribers: 32000 },
  { timestamp: DateTime.fromSeconds(1755216000), subscribers: 32547 },
  { timestamp: DateTime.fromSeconds(1755475200), subscribers: 32775 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 19)), subscribers: 32825 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 20)), subscribers: 32947 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 21)), subscribers: 33042 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 22)), subscribers: 33108 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 23)), subscribers: 33219 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 24)), subscribers: 33321 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 25)), subscribers: 33390 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 26)), subscribers: 33495 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 27)), subscribers: 33597 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 28)), subscribers: 33665 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 29)), subscribers: 33729 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 30)), subscribers: 33813 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 7, 31)), subscribers: 33889 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 1)), subscribers: 33977 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 2)), subscribers: 34105 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 3)), subscribers: 34204 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 4)), subscribers: 34289 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 5)), subscribers: 34369 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 6)), subscribers: 34426 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 7)), subscribers: 34482 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 8)), subscribers: 34554 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 9)), subscribers: 34648 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 10)), subscribers: 34712 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 11)), subscribers: 34792 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 12)), subscribers: 34870 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 13)), subscribers: 34954 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 14)), subscribers: 35061 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 15)), subscribers: 35182 },
  { timestamp: DateTime.fromJSDate(new Date(2025, 8, 16)), subscribers: 35326 },
];

class RedditBackfillService {
  constructor(
    private metricsRepository: MetricsPushRepository,
    private influxProvider: InfluxMetricsPushProvider,
    private env: string,
  ) {}

  async backfillReddit(subreddit: string = 'immich') {
    console.log(`Starting Reddit backfill for r/${subreddit}`);

    // Delete existing time series
    await this.deleteTimeSeries('immich_data_repository_reddit_subscriber_.*', this.env);

    const sortedData = KNOWN_DATA_POINTS.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
    console.log(`Processing ${sortedData.length} hardcoded data points`);

    // Push metrics to InfluxDB
    let count = 0;
    for (const dataPoint of sortedData) {
      count++;
      const metric = new Metric('reddit_subscriber')
        .setTimestamp(dataPoint.timestamp.toJSDate())
        .intField('total', dataPoint.subscribers)
        .addTag('environment', this.env);

      this.metricsRepository.push(metric);

      // Flush every 100 metrics
      if (count % 100 === 0) {
        await this.influxProvider.flush();
        console.log(`Flushed ${count} metrics...`);
      }
    }

    await this.influxProvider.flush();
    console.log(`Reddit backfill complete. Total metrics pushed: ${count}`);
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

  const service = new RedditBackfillService(metricsRepository, influxProvider, env);
  await service.backfillReddit('immich');
};

main()
  .then(() => console.log('Reddit backfill complete'))
  .catch(console.error);
