import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginUserDTO } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    create(@Body() createUserDto: CreateUserDTO) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    login(@Body() loginUserDTO: LoginUserDTO) {
        return this.authService.login(loginUserDTO);
    }
}
