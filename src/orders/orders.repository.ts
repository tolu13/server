import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async getAllOrders() {
    return await this.prisma.order.findMany();
  }

  async getOrderById(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
    });
  }

  async findByUser(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId },
      include: { pair: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
