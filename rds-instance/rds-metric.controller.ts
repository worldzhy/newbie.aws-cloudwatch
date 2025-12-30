import {Controller, Get, Query} from '@nestjs/common';
import {GetWatchedRDSInstancesMetricDto} from './rds-instance.dto';
import {RdsMetricService} from './rds-metric.service';

@Controller('rds-metric')
export class RdsMetricController {
  constructor(private readonly rdsMetricService: RdsMetricService) {}

  @Get()
  async getWatchedRDSInstancesMetric(@Query() query: GetWatchedRDSInstancesMetricDto) {
    return await this.rdsMetricService.getWatchedInstancesMetric(query);
  }
}
