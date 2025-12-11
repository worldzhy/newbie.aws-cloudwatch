import {Controller, Get, Query} from '@nestjs/common';
import {RDSInstanceService} from './rds-instance.service';
import {ListRDSInstancesDto} from './rds-instance.dto';

@Controller('rdsInstances')
export class RDSInstanceController {
  constructor(private readonly rdsInstanceService: RDSInstanceService) {}

  @Get()
  async listRDSInstances(@Query() req: ListRDSInstancesDto) {
    return await this.rdsInstanceService.listRDSInstances(req);
  }
}
