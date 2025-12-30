import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Ec2InstanceService} from './ec2-instance.service';
import {FetchEC2InstancesDto, ListEC2InstancesDto, SyncEC2InstancesWatchDto} from './ec2-instance.dto';

@Controller('ec2-instances')
export class Ec2InstanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ec2InstanceService: Ec2InstanceService
  ) {}

  @Get()
  async listEC2Instances(@Query() query: ListEC2InstancesDto) {
    const {awsAccountId, status, isWatching} = query;
    return await this.prisma.ec2Instance.findMany({
      where: {awsAccountId, status, isWatching},
      orderBy: {name: 'asc'},
    });
  }

  @Get('fetch')
  async fetchEC2Instances(@Query() query: FetchEC2InstancesDto) {
    return await this.ec2InstanceService.fetchEC2Instances(query.awsAccountId);
  }

  @Patch('syncWatch')
  async syncEC2InstancesWatch(@Body() body: SyncEC2InstancesWatchDto) {
    return await this.ec2InstanceService.syncEC2InstancesWatch(body);
  }

  @Patch('watch/:id')
  async watchEC2Instance(@Param('id') id: string) {
    return await this.ec2InstanceService.watchEC2Instance(id);
  }

  @Patch('watch/:id')
  async unwatchEC2Instance(@Param('id') id: string) {
    return await this.ec2InstanceService.unwatchEC2Instance(id);
  }
}
