import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TradingpairService } from './tradingpair.service';
import { CreateTradingpairDto } from './dto/create-tradingpair.dto';

@Controller('tradingpair')
export class TradingpairController {
  constructor(private readonly tradingpairService: TradingpairService) {}

  @Post()
  create(@Body() createTradingpairDto: CreateTradingpairDto) {
    return this.tradingpairService.create(createTradingpairDto);
  }

  @Get()
  findAll() {
    return this.tradingpairService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradingpairService.findOne(id);
  }
}
