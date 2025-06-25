import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/User.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository( User ) private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in configuration');
        }
        super({
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {

        const {id} = payload;
        const user = await this.userRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new UnauthorizedException('Token not valid');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User is inactive');
        }

        return user;

    }
    
}