import {Prisma} from '@prisma/client';
import {generateHash} from '@framework/utilities/common.util';

export async function userPrismaMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model === Prisma.ModelName.AwsAccount) {
    switch (params.action) {
      case 'create':
      case 'update':
        if (params.args['data']['secretAccessKey']) {
          // Generate hash of the password.
          const hash = await generateHash(params.args['data']['secretAccessKey']);
          params.args['data']['secretAccessKey'] = hash;
        }
        return next(params);

      default:
        return next(params);
    }
  }

  return next(params);
}
