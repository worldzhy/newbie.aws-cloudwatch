import {Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {DescribeInstancesCommand, EC2Client} from '@aws-sdk/client-ec2';
import {Prisma} from '@prisma/client';

@Injectable()
export class EC2InstanceService {
  constructor(private readonly prisma: PrismaService) {}

  async fetch(awsAccountId: string) {
    const awsAccount = await this.prisma.awsAccount.findUniqueOrThrow({where: {id: awsAccountId}});
    const {accessKeyId, secretAccessKey, regions} = awsAccount;

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i].replace('_', '-');
      const client = new EC2Client({
        region,
        credentials: {accessKeyId, secretAccessKey},
      });

      const response = await client.send(new DescribeInstancesCommand({MaxResults: 1000}));
      if (response.Reservations) {
        const ec2InstanceCreateManyInputs: Prisma.Ec2InstanceCreateManyInput[] = [];
        for (const reservation of response.Reservations) {
          if (reservation.Instances) {
            for (const inst of reservation.Instances) {
              const id = inst.InstanceId!;
              const nameTag = inst.Tags?.find(t => t.Key === 'Name');
              ec2InstanceCreateManyInputs.push({id, name: nameTag?.Value ?? id, region: regions[i], awsAccountId});
            }
          }
        }

        await this.prisma.ec2Instance.createMany({data: ec2InstanceCreateManyInputs, skipDuplicates: true});
      }
    }
  }

  async watch(id: string) {
    return await this.prisma.ec2Instance.update({where: {id}, data: {isWatching: true}});
  }

  async unwatch(id: string) {
    return await this.prisma.ec2Instance.update({where: {id}, data: {isWatching: false}});
  }

  async getWatchingInstances(awsAccountId: string) {
    return await this.prisma.ec2Instance.findMany({where: {awsAccountId, isWatching: true}});
  }

  async getWatchingInstanceIds(awsAccountId: string) {
    const instances = await this.prisma.ec2Instance.findMany({where: {awsAccountId, isWatching: true}});
    return instances.map(instances => instances.id);
  }
}
