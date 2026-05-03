import { SetMetadata } from '@nestjs/common';

export const LocalAuth = (...args: string[]) => SetMetadata('local-auth', args);
