import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {Ec2MetricService} from './ec2-metric.service';
import {GetWatchedEC2InstancesMetricDto} from './ec2-metric.dto';

@Controller('ec2-metric')
export class Ec2MetricController {
  constructor(private readonly ec2MetricService: Ec2MetricService) {
  }

  @Get()
  async getWatchedEC2InstancesMetric(@Query() query: GetWatchedEC2InstancesMetricDto) {
    return await this.ec2MetricService.getWatchedInstancesMetric(query);
  }
}
