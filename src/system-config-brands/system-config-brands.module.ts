import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemConfigBrandsService } from './system-config-brands.service';
import { SystemConfigBrandsController } from './system-config-brands.controller';
import { SystemConfigBrand } from './entities/system-config-brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfigBrand]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SystemConfigBrandsController],
  providers: [SystemConfigBrandsService],
  exports: [TypeOrmModule, SystemConfigBrandsService]
})
export class SystemConfigBrandsModule {}
