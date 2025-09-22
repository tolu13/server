import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
    });
    return orders;
  }
}
