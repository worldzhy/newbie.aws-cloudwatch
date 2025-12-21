import {Global, Module} from '@nestjs/common';
import {CloudwatchService} from '@microservices/cloudwatch/cloudwatch.service';
import {EC2InstanceController} from './ec2-instance/ec2-instance.controller';
import {EC2InstanceService} from './ec2-instance/ec2-instance.service';
import {RDSInstanceController} from './rds-instance/rds-instance.controller';
import {RDSInstanceService} from './rds-instance/rds-instance.service';
import {AWSAccountController} from '@microservices/cloudwatch/aws-account/aws-account.controller';
import {MetricController} from '@microservices/cloudwatch/metric/metric.controller';
import {MetricService} from '@microservices/cloudwatch/metric/metric.service';

@Global()
@Module({
  controllers: [EC2InstanceController, RDSInstanceController, AWSAccountController, MetricController],
  providers: [EC2InstanceService, RDSInstanceService, MetricService, CloudwatchService],
})
export class AwsCloudwatchModule {}
