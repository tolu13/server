import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthRequest } from './type';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
//import { CreateOrderDto } from './dto/create-order.dto';
//import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

   @UseGuards(JwtGuard)
  @Get('user')
  getUserOrders(@Req() req: AuthRequest) {
    console.log('OrdersController hit!', req.user); // 🔹 This must log
    return { message: 'success', user: req.user };
  }
}
