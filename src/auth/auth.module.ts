import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtStrategy, PassportModule, TypeOrmModule, JwtModule],
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (
                configService: ConfigService,
            ) => {
                // console.log('JWT_SECRET:', configService.get('JWT_SECRET'));
                // console.log('JWT_SECRET:', process.env.JWT_SECRET);
                return {
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }, // Adjust the expiration time as needed
                }
            }
        }),
        ConfigModule,
    ], // Add your entities here
})
export class AuthModule {}

