import {Controller, Get, Query} from '@nestjs/common';
import {Ec2MetricService} from './ec2-metric.service';
import {GetWatchedEC2InstancesCPUMetricDto} from './ec2-metric.dto';

@Controller('ec2-metric')
export class Ec2MetricController {
  constructor(private readonly ec2MetricService: Ec2MetricService) {}

  @Get()
  async getWatchedEC2InstancesCPUMetric(@Query() query: GetWatchedEC2InstancesCPUMetricDto) {
    return await this.ec2MetricService.getWatchedInstancesCPUMetric(query);
  }
}
