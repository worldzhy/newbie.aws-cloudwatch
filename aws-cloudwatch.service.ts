import {Injectable} from '@nestjs/common';
import {CloudWatchClient, GetMetricDataCommand, GetMetricDataCommandOutput} from '@aws-sdk/client-cloudwatch';
import {GetEC2InstancesCPUMetricParams, GetRDSInstancesMetricParams, MetricData} from './aws-cloudwatch.interface';

@Injectable()
export class AwsCloudwatchService {
  constructor() {}

  private initCloudwatchClient(args: {accessKeyId?: string; secretAccessKey?: string; region: string}) {
    const {accessKeyId, secretAccessKey, region} = args;
    let client: CloudWatchClient;
    if (accessKeyId && secretAccessKey) {
      client = new CloudWatchClient({region, credentials: {accessKeyId, secretAccessKey}});
    } else {
      client = new CloudWatchClient({region});
    }
    return client;
  }

  async getEC2InstancesCPUMetric(params: GetEC2InstancesCPUMetricParams) {
    const {ec2InstanceRemoteIds, accessKeyId, secretAccessKey, region, startTime, endTime, period, statistics} = params;
    const cloudwatchClient = this.initCloudwatchClient({accessKeyId, secretAccessKey, region});
    if (ec2InstanceRemoteIds.length === 0) {
      return [];
    }

    const command = new GetMetricDataCommand({
      StartTime: startTime,
      EndTime: endTime,
      MetricDataQueries: ec2InstanceRemoteIds.map((id, idx) => ({
        Id: `cpu${idx}`,
        MetricStat: {
          Metric: {
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [{Name: 'InstanceId', Value: id}],
          },
          Period: period,
          Stat: statistics,
        },
        ReturnData: true,
      })),
    });

    const metricData = await cloudwatchClient.send(command);
    return this.parseGetMetricDataCommandOutput(metricData);
  }

  async getRDSInstancesMetric(params: GetRDSInstancesMetricParams) {
    const {
      rdsInstanceRemoteIds,
      accessKeyId,
      secretAccessKey,
      region,
      metricName,
      startTime,
      endTime,
      period,
      statistics,
    } = params;
    const cloudwatchClient = this.initCloudwatchClient({accessKeyId, secretAccessKey, region});
    if (rdsInstanceRemoteIds.length === 0) {
      return [];
    }

    const command = new GetMetricDataCommand({
      StartTime: startTime,
      EndTime: endTime,
      MetricDataQueries: rdsInstanceRemoteIds.map((id, index) => ({
        Id: `q${index}`,
        MetricStat: {
          Metric: {
            Namespace: 'AWS/RDS',
            MetricName: metricName,
            Dimensions: [{Name: 'DBInstanceIdentifier', Value: id}],
          },
          Period: period,
          Stat: statistics,
        },
      })),
    });

    const metricData = await cloudwatchClient.send(command);
    return this.parseGetMetricDataCommandOutput(metricData);
  }

  private parseGetMetricDataCommandOutput(output: GetMetricDataCommandOutput) {
    // const results: (MetricDataResult | {DataPoints: {timestamp: Date; value: number}[]})[] = [];
    const results: MetricData[] = [];

    if (output.MetricDataResults) {
      for (const result of output.MetricDataResults) {
        const dataPoints: {timestamp: Date; value: number}[] = [];
        if (result.Timestamps && result.Values) {
          dataPoints.push(
            ...result.Timestamps.map((t, i) => ({
              timestamp: new Date(t),
              value: result.Values![i],
            }))
          );
          dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }

        results.push({...result, DataPoints: dataPoints});
      }
    }

    return results;
  }
}
