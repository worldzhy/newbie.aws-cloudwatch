import {Global, Module} from '@nestjs/common';
import {CloudwatchService} from '@microservices/cloudwatch/cloudwatch.service';
import {EC2InstanceController} from './ec2-instance/ec2-instance.controller';
import {EC2InstanceService} from './ec2-instance/ec2-instance.service';
import {RDSInstanceController} from './rds-instance/rds-instance.controller';
import {RDSInstanceService} from './rds-instance/rds-instance.service';

@Global()
@Module({
  controllers: [EC2InstanceController, RDSInstanceController],
  providers: [CloudwatchService, EC2InstanceService, RDSInstanceService],
  exports: [CloudwatchService, EC2InstanceService, RDSInstanceService],
})
export class AwsCloudwatchModule {}
