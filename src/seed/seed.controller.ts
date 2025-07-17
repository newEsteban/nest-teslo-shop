import {
    Controller,
    Get,
} from '@nestjs/common';
import { Auth } from '../auth/decorators';
import { ValidRole } from '../auth/interfaces/valid-roles';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {}

    @Get()
    @Auth( ValidRole.admin ) 
    excecuteSeed() {
        return this.seedService.runSeed();
    }
}
