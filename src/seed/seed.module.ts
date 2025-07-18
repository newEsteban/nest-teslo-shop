import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from '../products/products.module';
import { Auth } from 'src/auth/decorators';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [SeedController],
    providers: [SeedService],
    imports: [ProductsModule, AuthModule],
})
export class SeedModule {}
