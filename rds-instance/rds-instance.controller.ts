import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {RdsInstanceService} from './rds-instance.service';
import {FetchRDSInstancesDto, ListRDSInstancesDto, SyncRDSInstancesWatchDto} from './rds-instance.dto';

@Controller('rds-instances')
export class RdsInstanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rdsInstanceService: RdsInstanceService
  ) {}

  @Get()
  async listRDSInstances(@Query() query: ListRDSInstancesDto) {
    const {awsAccountId, status, isWatching} = query;
    return await this.prisma.rdsInstance.findMany({
      where: {awsAccountId, status, isWatching},
      orderBy: {name: 'asc'},
    });
  }

  @Get('fetch')
  async fetchRDSInstances(@Query() query: FetchRDSInstancesDto) {
    return await this.rdsInstanceService.fetchRDSInstances(query.awsAccountId);
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
