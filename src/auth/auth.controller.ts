import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginUserDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/User.entity';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from 'src/common/decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRole } from './interfaces/valid-roles';

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

    @Get('private')
    @UseGuards(AuthGuard())
    testingPrivateRoute(
        @Req() request: Express.Request,
        @GetUser() user: User,
        @GetUser('email') userEmail: string,
        @RawHeaders() rawHeaders: string[],
    ) {

        return {
            ok: true,
            message: 'Hola mundo privado',
        };
    }

    // @SetMetadata('roles', ['admin'])
    @Get('private2')
    @RoleProtected(ValidRole.admin, ValidRole.superUser)
    @UseGuards(AuthGuard(), UserRoleGuard)
    testingPrivateRoute2(
        @GetUser() user: User
    ) {
        return {
            ok: true,
            message: 'Hola mundo privado 2',
            user,
        };
    }

}
