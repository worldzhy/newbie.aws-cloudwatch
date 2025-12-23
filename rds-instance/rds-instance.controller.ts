import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {RDSInstanceService} from './rds-instance.service';
import {FetchRDSInstancesDto, ListRDSInstancesDto, SyncRDSInstancesWatchDto} from './rds-instance.dto';

@Controller('rdsInstances')
export class RDSInstanceController {
  constructor(private readonly rdsInstanceService: RDSInstanceService) {}

  @Get()
  async listRDSInstances(@Query() req: ListRDSInstancesDto) {
    return await this.rdsInstanceService.listRDSInstances(req);
  }

  @Get('fetch')
  async fetchRDSInstances(@Query() query: FetchRDSInstancesDto) {
    return await this.rdsInstanceService.fetchRDSInstances(query);
  }

  @Patch('syncWatch')
  async syncRDSInstancesWatch(@Body() body: SyncRDSInstancesWatchDto) {
    return await this.rdsInstanceService.syncRDSInstancesWatch(body);
  }

  @Patch('watch/:rdsInstanceId')
  async watchRDSInstance(@Param('rdsInstanceId') rdsInstanceId: string) {
    return await this.rdsInstanceService.watchRDSInstance(rdsInstanceId);
  }

  @Patch('watch/:rdsInstanceId')
  async unwatchRDSInstance(@Param('rdsInstanceId') rdsInstanceId: string) {
    return await this.rdsInstanceService.unwatchRDSInstance(rdsInstanceId);
  }
}
