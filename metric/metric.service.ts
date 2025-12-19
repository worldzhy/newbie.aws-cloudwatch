import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {CloudwatchService} from '@microservices/cloudwatch/cloudwatch.service';
import {GetWatchedEC2InstancesCPUMetricDto, GetWatchedRDSInstancesMetricDto} from './metric.dto'; // import dayjs from 'dayjs';
import {ConfigService} from '@nestjs/config';
import {MetricDataResult} from '@aws-sdk/client-cloudwatch';

const dayjs = require('dayjs');

@Injectable()
export class MetricService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cloudwatchService: CloudwatchService
  ) {}

  async getWatchedEC2InstancesCPUMetric(data: GetWatchedEC2InstancesCPUMetricDto) {
    const {awsAccountId, startTime, endTime, period, statistics} = data;
    const awsAccount = await this.prisma.awsAccount.findUnique({
      where: {
        id: awsAccountId,
      },
      include: {
        ec2Instances: {
          where: {
            isWatching: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    if (!awsAccount) {
      throw new HttpException('AWS Account not found', HttpStatus.BAD_REQUEST);
    }
    const {ec2Instances} = awsAccount;
    if (!ec2Instances.length) {
      return [];
    }

    // Check that the period is greater than 60 and divisible by 60.
    const periodNum = parseInt(period, 10);
    if (periodNum < 60) throw new HttpException('Period must be no less than 60', HttpStatus.BAD_REQUEST);
    if (periodNum % 60 !== 0) {
      throw new HttpException('The period must be a multiple of 60', HttpStatus.BAD_REQUEST);
    }
    // Check if start time and end time are valid.
    if (!dayjs(startTime).isValid()) {
      throw new HttpException('Invalid start time', HttpStatus.BAD_REQUEST);
    }
    if (!dayjs(endTime).isValid()) {
      throw new HttpException('Invalid end time', HttpStatus.BAD_REQUEST);
    }

    // Just for test.
    const accessKeyId = this.configService.get<string>('microservices.aws-ses.accessKeyId');
    const secretAccessKey = this.configService.get<string>('microservices.aws-ses.secretAccessKey');

    const results: (
      | MetricDataResult
      | {
          Id: string | undefined;
          Label: string | undefined;
          DataPoints: {
            timestamp: Date;
            value: number;
          }[];
        }
    )[] = [];

    for (const region of awsAccount.regions) {
      // Get metric.
      const params: any = {
        ec2InstanceRemoteIds: ec2Instances.filter(item => item.region === region).map(item => item.remoteId),
        region: region.replaceAll('_', '-'),
        startTime: dayjs(startTime).toDate(),
        endTime: dayjs(endTime).toDate(),
        period: periodNum,
        statistics,
        accessKeyId,
        secretAccessKey,
        // accessKeyId: awsAccount.accessKeyId,
        // secretAccessKey: awsAccount.secretAccessKey,
      };
      console.log(params);
      const metric = await this.cloudwatchService.getEC2InstancesCPUMetric(params);
      if (metric) {
        metric.MetricDataResults?.forEach(result => {
          if (!result.Timestamps || !result.Values) {
            results.push(result);
            return;
          }

          const points = result.Timestamps.map((t, i) => ({
            timestamp: new Date(t),
            value: result.Values![i],
          }));

          points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          results.push({
            Id: result.Id,
            Label: result.Label,
            DataPoints: points,
          });
        });
      }
    }

    return results;
  }

  async getWatchedRDSInstancesMetric(data: GetWatchedRDSInstancesMetricDto) {
    const {awsAccountId, startTime, endTime, period, metricName, statistics} = data;
    const awsAccount = await this.prisma.awsAccount.findUnique({
      where: {
        id: awsAccountId,
      },
      include: {
        rdsInstances: {
          where: {
            isWatching: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    if (!awsAccount) {
      throw new HttpException('AWS Account not found', HttpStatus.BAD_REQUEST);
    }
    const {rdsInstances} = awsAccount;
    if (!rdsInstances.length) {
      return [];
    }

    // Check that the period is greater than 60 and divisible by 60.
    const periodNum = parseInt(period, 10);
    if (periodNum < 60) throw new HttpException('Period must be no less than 60', HttpStatus.BAD_REQUEST);
    if (periodNum % 60 !== 0) {
      throw new HttpException('The period must be a multiple of 60', HttpStatus.BAD_REQUEST);
    }
    // Check if start time and end time are valid.
    if (!dayjs(startTime).isValid()) {
      throw new HttpException('Invalid start time', HttpStatus.BAD_REQUEST);
    }
    if (!dayjs(endTime).isValid()) {
      throw new HttpException('Invalid end time', HttpStatus.BAD_REQUEST);
    }

    // Just for test.
    const accessKeyId = this.configService.get<string>('microservices.aws-ses.accessKeyId');
    const secretAccessKey = this.configService.get<string>('microservices.aws-ses.secretAccessKey');

    const results: (
      | MetricDataResult
      | {
          Id: string | undefined;
          Label: string | undefined;
          DataPoints: {
            timestamp: Date;
            value: number;
          }[];
        }
    )[] = [];

    for (const region of awsAccount.regions) {
      // Get metric.
      const params: any = {
        rdsInstanceRemoteIds: rdsInstances.filter(item => item.region === region).map(item => item.remoteId),
        region: region.replaceAll('_', '-'),
        startTime: dayjs(startTime).toDate(),
        endTime: dayjs(endTime).toDate(),
        period: periodNum,
        metricName,
        statistics,
        accessKeyId,
        secretAccessKey,
        // accessKeyId: awsAccount.accessKeyId,
        // secretAccessKey: awsAccount.secretAccessKey,
      };
      const metric = await this.cloudwatchService.getRDSInstancesMetric(params);
      if (metric) {
        metric.MetricDataResults?.forEach(result => {
          if (!result.Timestamps || !result.Values) {
            results.push(result);
            return;
          }

          const points = result.Timestamps.map((t, i) => ({
            timestamp: new Date(t),
            value: result.Values![i],
          }));

          points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          results.push({
            Id: result.Id,
            Label: result.Label,
            DataPoints: points,
          });
        });
      }
    }

    return results;
  }
}
