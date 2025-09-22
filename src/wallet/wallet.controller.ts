import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { User } from 'src/user/user.decorator';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @Body() dto: CreateWalletDto,
    @User('id') userId: string, // or userId if your decorator returns just the ID
  ) {
    console.log('creating wallet with', dto, userId);
    return this.walletService.create(dto, userId); // pass user ID explicitly
  }

  @Get()
  findAll() {
    return this.walletService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('portfolio')
  getPortfolio(@User('id') userId: string) {
    console.log('Portfolio endpoint hit');
    console.log('UserId:', userId);
    return this.walletService.getPortfolio(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('id') userId: string) {
    return this.walletService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(id, updateWalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(id);
  }

  @Post(':walletId/fund')
  fundWallet(
    @Param('walletId') walletId: string,
    @Body() dto: FundWalletDto,
    @User('id') userId: string,
  ) {
    console.log('User ID:', userId);
    return this.walletService.fundWallet(dto, walletId, userId);
  }
}
