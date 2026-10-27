import { Injectable } from '@nestjs/common';
import type { Role } from '@pregao/shared';
import type { User } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export interface NewUser {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createWithWallet(user: NewUser): Promise<User> {
    return this.prisma.user.create({ data: { ...user, wallet: { create: {} } } });
  }
}
