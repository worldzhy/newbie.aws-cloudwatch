import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {EC2InstanceService} from './ec2-instance.service';
import {FetchEC2InstancesDto, ListEC2InstancesDto, SyncEC2InstancesWatchDto} from './ec2-instance.dto';

@Controller('ec2Instances')
export class EC2InstanceController {
  constructor(private readonly ec2InstanceService: EC2InstanceService) {}

  @Get()
  async listEC2Instances(@Query() query: ListEC2InstancesDto) {
    return await this.ec2InstanceService.listEC2Instances(query);
  }

  @Get('fetch')
  async fetchEC2Instances(@Query() query: FetchEC2InstancesDto) {
    return await this.ec2InstanceService.fetchEC2Instances(query);
  }

  @Patch('syncWatch')
  async syncEC2InstancesWatch(@Body() body: SyncEC2InstancesWatchDto) {
    return await this.ec2InstanceService.syncEC2InstancesWatch(body);
  }

  @Patch('watch/:ec2InstanceId')
  async watchEC2Instance(@Param('ec2InstanceId') ec2InstanceId: string) {
    return await this.ec2InstanceService.watchEC2Instance(ec2InstanceId);
  }

  @Patch('watch/:ec2InstanceId')
  async unwatchEC2Instance(@Param('ec2InstanceId') ec2InstanceId: string) {
    return await this.ec2InstanceService.unwatchEC2Instance(ec2InstanceId);
  }
}
