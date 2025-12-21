import {Global, Module} from '@nestjs/common';
import {AwsCloudwatchService} from '@microservices/aws-cloudwatch/aws-cloudwatch.service';
import {AWSAccountController} from '@microservices/aws-cloudwatch/aws-account/aws-account.controller';
import {MetricController} from '@microservices/aws-cloudwatch/metric/metric.controller';
import {MetricService} from '@microservices/aws-cloudwatch/metric/metric.service';
import {EC2InstanceController} from './ec2-instance/ec2-instance.controller';
import {EC2InstanceService} from './ec2-instance/ec2-instance.service';
import {RDSInstanceController} from './rds-instance/rds-instance.controller';
import {RDSInstanceService} from './rds-instance/rds-instance.service';

@Global()
@Module({
  controllers: [AWSAccountController, MetricController, EC2InstanceController, RDSInstanceController],
  providers: [AwsCloudwatchService, MetricService, EC2InstanceService, RDSInstanceService],
  exports: [AwsCloudwatchService, MetricService, EC2InstanceService, RDSInstanceService],
})
export class AwsCloudwatchModule {}
