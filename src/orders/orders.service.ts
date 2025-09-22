import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private repo: OrdersRepository) {}

  async getAllOrders() {
    return this.repo.getAllOrders();
  }

  async getOrderById(id: string) {
    const order = await this.repo.getOrderById(id);
    if (!order) {
      throw new NotFoundException('order not found');
    }
    return order;
  }

  // still going to create this endpoint
  /*
  remove(id: number) {
    return `This action removes a #${id} order`;
  }
    */
}
