import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';
import { LoginUserDTO, CreateUserDTO } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    public async login(loginUserDTO: LoginUserDTO) {
        const { email, password } = loginUserDTO;
        const user = await this.userRepository.findOne({
            where: { email },
            select: {
                email: true,
                password: true,
                isActive: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User is inactive');
        }

        if( bcrypt.compareSync(password, user.password) ) {
            const { password, ...userData } = user; // Remove password from the response
            return userData;
        }

    }

    async create(createUserDto: CreateUserDTO) {
        try {
            const user = this.userRepository.create(createUserDto);
            await this.userRepository.save(user);
            const { password, ...userData } = user; // Remove password from the response
            return userData;

            // todo: return JWT token
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        if (error.code === '23505') {
            throw new Error('User already exists');
        }
        if (error.code === '23503') {
            throw new Error('Foreign key constraint failed');
        }
        if (error.code === '23502') {
            throw new Error('Not null constraint failed');
        }
        if (error.code === '22001') {
            throw new Error('Value too long for column');
        }
        console.error('Database error:', error);
        throw new InternalServerErrorException('Please check server logs');
    }
  
}
