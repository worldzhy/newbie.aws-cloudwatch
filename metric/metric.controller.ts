import {Controller, Get, Query} from '@nestjs/common';
import {MetricService} from './metric.service';
import {GetWatchedEC2InstancesCPUMetricDto, GetWatchedRDSInstancesMetricDto} from './metric.dto';

@Controller('metric')
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  @Get('getWatchedEC2InstancesCPUMetric')
  async getWatchedEC2InstancesCPUMetric(@Query() query: GetWatchedEC2InstancesCPUMetricDto) {
    return await this.metricService.getWatchedEC2InstancesCPUMetric(query);
  }

  @Get('getWatchedRDSInstancesMetric')
  async getWatchedRDSInstancesMetric(@Query() query: GetWatchedRDSInstancesMetricDto) {
    return await this.metricService.getWatchedRDSInstancesMetric(query);
  }
}
