# Autenticación con JWT en NestJS

1. Registro y login de usuarios.
2. Generación y validación de tokens JWT.
3. Protección de rutas con autenticación.

---

## 🔧 Requisitos Previos

Asegúrate de tener instalado:

```bash
npm install @nestjs/common @nestjs/core @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
```

---

## 1. 🏗️ Estructura del Proyecto

Usaremos esta estructura:

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       └── login.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── user.entity.ts
└── main.ts
```

---

## 2. 📦 Módulo de Usuarios (Simulado en memoria)

### `users/user.entity.ts`

```ts
export class User {
  id: number;
  username: string;
  password: string; // Hasheada
}
```

### `users/users.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async create(username: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), username, password: hashed };
    this.users.push(user);
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }
}
```

### `users/users.module.ts`

```ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 3. 🔐 Módulo de Autenticación

### `auth/dto/login.dto.ts`

```ts
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
```

### `auth/jwt.strategy.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRET_KEY', // 🔐 Usa .env para esto
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

### `auth/auth.service.ts`

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string) {
    const user = await this.usersService.create(username, password);
    return this.login(user);
  }
}
```

### `auth/auth.controller.ts`

```ts
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() loginDto: LoginDto) {
    return this.authService.register(loginDto.username, loginDto.password);
  }
}
```

### `auth/auth.module.ts`

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // ⚠️ Usa variables de entorno
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

---

## 4. 🔐 Proteger Rutas con Guard

### `auth/jwt-auth.guard.ts`

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## 5. 🧪 Uso en un controlador protegido

```ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Request() req) {
    return req.user; // Devuelve el payload del JWT
  }
}
```

---

## ✅ Resultado

* POST `/auth/register` con `username` y `password`: Crea usuario y devuelve token.
* POST `/auth/login`: Valida usuario y devuelve token.
* GET `/profile`: Protegido, requiere token Bearer en encabezado.

---

## 🛡️ Consejos de Seguridad

* Usa `@nestjs/config` para variables de entorno (`JWT_SECRET`, etc).
* Usa HTTPS en producción.
* Implementa refresh tokens para sesiones más robustas.

---

¿Te gustaría que te agregue refresh tokens, roles, o almacenamiento en base de datos como TypeORM/Prisma?
