import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetsRepository } from './assets.repository';

@Injectable()
export class AssetsService {
  constructor(private repo: AssetsRepository) {}

  async create(CreateAssetDto: CreateAssetDto) {
    return this.repo.postAsset(CreateAssetDto);
  }

  async findAll() {
    return await this.repo.findAll();
  }

  async findOne(id: string) {
    const asset = await this.repo.getAssetById(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }
}
