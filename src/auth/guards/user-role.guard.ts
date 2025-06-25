import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../entities/User.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
// Guard para verificar los roles del usuario
export class UserRoleGuard implements CanActivate {
  // Inyecta el reflector para acceder a los metadatos de los decoradores
  constructor(private readonly reflector: Reflector) {}

  // Método principal que determina si la petición puede continuar
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    // Obtiene los roles requeridos desde los metadatos del handler
    const roles = this.reflector.get<string[]>(META_ROLES, context.getHandler());

    // Si no hay roles definidos, permite el acceso
    if (!roles || roles.length === 0) {
      return true;
    }

    // Obtiene el request y el usuario de la petición
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    // Si no hay usuario en la petición, lanza una excepción
    if (!user) {
      throw new BadRequestException('User no se encuentra en la solicitud');
    }
    
    // Verifica si el usuario tiene al menos uno de los roles requeridos
    for (const role of roles) {
      if (user.roles.includes(role)) {
        return true;
      }
    }

    // Si el usuario no tiene los roles requeridos, lanza una excepción
    throw new BadRequestException(`User does not have the required role [${roles}]`);
  }
}
