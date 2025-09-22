import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletRepository } from './wallet.repository';
import { FundWalletDto } from './dto/fund-wallet.dto';

@Injectable()
export class WalletService {
  constructor(private repo: WalletRepository) {}
  async create(createWalletDto: CreateWalletDto, userId: string) {
    return await this.repo.PostWallet(createWalletDto, userId);
  }

  async findAll() {
    return await this.repo.findAll();
  }

  async findOne(id: string, userId: string) {
    return await this.repo.findOne(id, userId);
  }

  async update(id: string, updateWalletDto: UpdateWalletDto) {
    return await this.repo.updateWallet(updateWalletDto);
  }

  remove(id: string) {
    return `This action removes a #${id} wallet`;
  }

  async getPortfolio(userId: string) {
    console.log('Service received userId:', userId);
    return this.repo.getPortfolio(userId);
  }

  async fundWallet(dto: FundWalletDto, walletId: string, userId: string) {
    // You could add authorization check here if needed
    return this.repo.fundWallet(walletId, dto.balance, userId);
  }
}
