import {Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {EC2InstanceService} from './ec2-instance.service';
import {FetchEC2InstancesRequestDto, ListEC2InstancesRequestDto} from './ec2-instance.dto';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Prisma} from '@prisma/client';

@Controller('ec2Instances')
export class EC2InstanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ec2InstanceService: EC2InstanceService
  ) {}

  @Get()
  async listEC2Instances(@Query() query: ListEC2InstancesRequestDto) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.Ec2Instance,
      findManyArgs: {awsAccountId: query.awsAccountId},
    });
  }

  // ! Todo: 补充增量fetch的逻辑，并对原有的instances进行更新
  @Get('fetch')
  async fetchEC2Instances(@Query() query: FetchEC2InstancesRequestDto) {
    return await this.ec2InstanceService.fetch(query.awsAccountId);
  }

  @Patch('watch:id')
  async watchEC2Instance(@Param('id') id: string) {
    return await this.ec2InstanceService.watch(id);
  }

  @Patch('unwatch:id')
  async unwatchEC2Instance(@Param('id') id: string) {
    return await this.ec2InstanceService.unwatch(id);
  }
}
