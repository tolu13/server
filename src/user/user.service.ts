import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  async getUserOrders(userId: string) {
    const orders = await this.repo.getUserOrders(userId);

    if (!orders || orders.length === 0) {
      throw new NotFoundException('No orders found ');
    }
    return orders;
  }
}
