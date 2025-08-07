import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';
import { LoginUserDTO, CreateUserDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

// El decorador @Injectable() indica que esta clase puede ser inyectada como dependencia.
@Injectable()
export class AuthService {
    constructor(
        // Inyecta el repositorio de usuarios para interactuar con la base de datos.
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        // Inyecta el servicio de JWT para generación y verificación de tokens.
        private readonly jwtService: JwtService, 
    ) {}

    /**
     * Realiza el proceso de login de un usuario.
     * 1. Busca el usuario por email.
     * 2. Verifica si existe y si está activo.
     * 3. Compara la contraseña proporcionada con la almacenada (encriptada).
     * 4. Si todo es correcto, retorna los datos del usuario (sin la contraseña) y un JWT.
     * @param loginUserDTO Objeto con email y contraseña.
     */
    public async login(loginUserDTO: LoginUserDTO) {
        const { email, password } = loginUserDTO;
        const user = await this.userRepository.findOne({
            where: { email },
            select: {
                email: true,
                id: true,
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

        // Compara la contraseña proporcionada con la almacenada usando bcrypt.
        if( bcrypt.compareSync(password, user.password) ) {
            const { password, ...userData } = user; // Elimina la contraseña del objeto de respuesta.
            return {
                ...userData,
                token: this.getJwtToken({ id: userData.id }), // Genera un JWT para el usuario.
            };
        }
    }

    /**
     * Genera un JWT (JSON Web Token) usando el payload proporcionado.
     * Este token puede ser utilizado para autenticar peticiones futuras del usuario.
     * @param payload Información que se incluirá dentro del token (por ejemplo, id y email del usuario).
     * @returns Un string que representa el JWT firmado.
     *
     * Internamente, la siguiente línea utiliza el servicio de JWT (JwtService) de NestJS para generar (firmar)
     * un token JWT a partir del objeto payload proporcionado. El método sign toma el payload (que suele contener
     * información como el id y email del usuario) y lo codifica en un token seguro usando una clave secreta definida
     * en la configuración de la aplicación. El resultado es un string que representa el JWT, el cual puede ser enviado
     * al cliente para autenticación en futuras peticiones.
     * Las configuraciones que usa jwtService provienen del módulo JwtModule de NestJS,
     * que normalmente se importa y configura en algún módulo de tu aplicación 
     * (por ejemplo, en auth.module.ts). Al registrar el JwtModule, se le pasan opciones como la clave secreta (secret)
     *  y la expiración del token (signOptions).
     */
    private getJwtToken(payload: JwtPayload) {
        const token = this.jwtService.sign(payload);
        return token;
    }

    async checkAuthStatus(user: User) {
        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        }
    }

    /**
     * Crea un nuevo usuario en la base de datos.
     * 1. Genera una instancia de usuario a partir del DTO recibido.
     * 2. Guarda el usuario en la base de datos.
     * 3. Retorna los datos del usuario (sin la contraseña).
     * @param createUserDto Objeto con los datos del usuario a crear.
     */
    async create(createUserDto: CreateUserDTO) {
        try {
            // Crea una nueva instancia de usuario a partir del DTO recibido.
            const user = this.userRepository.create(createUserDto);
            // Guarda el usuario en la base de datos.
            await this.userRepository.save(user);
            // Elimina la contraseña del objeto de respuesta.
            const { password, ...userData } = user;

            return {
                ...userData,
                token: this.getJwtToken({ id: userData.id }), // Genera un JWT para el usuario.
            };

        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Maneja errores comunes de la base de datos y lanza excepciones específicas.
     * Permite identificar rápidamente errores como duplicidad, claves foráneas, valores nulos, etc.
     * @param error Objeto de error recibido de la base de datos.
     */
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
        // Si el error no es reconocido, lanza una excepción genérica de servidor.
        console.error('Database error:', error);
        throw new InternalServerErrorException('Please check server logs');
    }
  
}
