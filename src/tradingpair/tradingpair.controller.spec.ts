import { Test, TestingModule } from '@nestjs/testing';
import { TradingpairController } from './tradingpair.controller';
import { TradingpairService } from './tradingpair.service';

describe('TradingpairController', () => {
  let controller: TradingpairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradingpairController],
      providers: [TradingpairService],
    }).compile();

    controller = module.get<TradingpairController>(TradingpairController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
