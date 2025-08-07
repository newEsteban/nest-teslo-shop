import {
    Controller,
    Get,
} from '@nestjs/common';
import { Auth } from '../auth/decorators';
import { ValidRole } from '../auth/interfaces/valid-roles';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Seed-TesloShop')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {}

    @Get()
    @Auth( ValidRole.admin ) 
    excecuteSeed() {
        return this.seedService.runSeed();
    }
}
