import {Injectable} from '@nestjs/common';
import {CloudWatchClient, GetMetricDataCommand} from '@aws-sdk/client-cloudwatch';
import {ConfigService} from '@nestjs/config';
import {GetEC2InstancesCPUMetricParams, GetRDSInstancesMetricParams} from './aws-cloudwatch.interface';

const CryptoJS = require('crypto-js');

@Injectable()
export class AwsCloudwatchService {
  constructor(private readonly configService: ConfigService) {}

  private initCloudwatchClient(args: {accessKeyId?: string; secretAccessKey?: string; region: string}) {
    const {accessKeyId, secretAccessKey, region} = args;
    let client: CloudWatchClient;
    if (accessKeyId && secretAccessKey) {
      client = new CloudWatchClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      client = new CloudWatchClient({
        region,
      });
    }
    return client;
  }

  async getEC2InstancesCPUMetric(params: GetEC2InstancesCPUMetricParams) {
    const {ec2InstanceRemoteIds, accessKeyId, secretAccessKey, region, startTime, endTime, period, statistics} = params;
    const cloudwatchClient = this.initCloudwatchClient({
      accessKeyId,
      secretAccessKey,
      region,
    });
    if (ec2InstanceRemoteIds.length) {
      const queries = ec2InstanceRemoteIds.map((id, idx) => ({
        Id: `cpu${idx}`,
        MetricStat: {
          Metric: {
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [
              {
                Name: 'InstanceId',
                Value: id,
              },
            ],
          },
          Period: period,
          Stat: statistics,
        },
        ReturnData: true,
      }));
      const command = new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        MetricDataQueries: queries,
      });
      return await cloudwatchClient.send(command);
    }
    return null;
  }

  async getRDSInstancesMetric(params: GetRDSInstancesMetricParams) {
    const {
      rdsInstanceRemoteIds,
      accessKeyId,
      secretAccessKey,
      metricName,
      region,
      startTime,
      endTime,
      period,
      statistics,
    } = params;
    const cloudwatchClient = this.initCloudwatchClient({
      accessKeyId,
      secretAccessKey,
      region,
    });
    if (rdsInstanceRemoteIds.length) {
      const queries = rdsInstanceRemoteIds.map((id, index) => ({
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
      }));
      const command = new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        MetricDataQueries: queries,
      });
      return await cloudwatchClient.send(command);
    }
    return null;
  }

  encryptSecretAccessKey(secretAccessKey: string) {
    const encryptKey = this.configService.get('microservices.cloudwatch.encryptKey') as string;
    return CryptoJS.AES.encrypt(secretAccessKey, encryptKey).toString();
  }

  decryptSecretAccessKey(encryptedSecretAccessKey: string) {
    const encryptKey = this.configService.get('microservices.cloudwatch.encryptKey') as string;
    const bytes = CryptoJS.AES.decrypt(encryptedSecretAccessKey, encryptKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
