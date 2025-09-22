import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
//import { FundWalletDto } from './dto/fund-wallet.dto';

@Injectable()
export class WalletRepository {
  constructor(private prisma: PrismaService) {}

  async PostWallet(dto: CreateWalletDto, userId: string) {
    console.log('creating wallet with', dto, userId);
    if (!dto.assetId) {
      throw new Error('Asset ID is required');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        user: { connect: { id: userId } },
        asset: { connect: { id: dto.assetId } },
        balance: dto.balance ?? 0,
      },
    });
    return wallet;
  }
  catch(error: unknown) {
    console.error('wallet creation error', error);
    throw new Error("wallet can't be created");
  }

  async findAll() {
    return await this.prisma.wallet.findMany();
  }

  async findOne(id: string, userId: string) {
    return await this.prisma.wallet.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });
  }

  async updateWallet(dto: UpdateWalletDto) {
    try {
      const updatedwallet = await this.prisma.wallet.update({
        where: {
          userId_assetId: {
            userId: dto.userId,
            assetId: dto.assetId,
          },
        },
        data: {
          balance: { increment: dto.amount },
        },
      });
      return updatedwallet;
    } catch (error) {
      console.error('unable to update', error);
    }
  }

  async getPortfolio(userId: string) {
    console.log('fetching portfolio with', userId);
    const portfolio = await this.prisma.wallet.findMany({
      where: { userId: userId },
      include: { asset: true },
    });
    console.log('Repo found wallets:', portfolio);
    return portfolio;
  }
  async fundWallet(walletId: string, balance: number, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + balance;
    const newAvailable = wallet.available + balance;

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: newBalance,
        available: newAvailable,
      },
    });
  }

  async lockFunds(walletId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.available < amount)
      throw new Error('Insufficient available balance');

    const newAvailable = wallet.available - amount;
    const newLocked = wallet.locked + amount;

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        available: newAvailable,
        locked: newLocked,
        // balance remains the same
      },
    });
  }

  async unlockFunds(walletId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.locked < amount) throw new Error('Insufficient locked balance');

    const newLocked = wallet.locked - amount;
    const newAvailable = wallet.available + amount;

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        locked: newLocked,
        available: newAvailable,
        // balance remains the same
      },
    });
  }
}
