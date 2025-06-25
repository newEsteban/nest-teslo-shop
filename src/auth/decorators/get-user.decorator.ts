import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

/**
 * Decorador personalizado para obtener el usuario autenticado desde la solicitud HTTP.
 *
 * @param data - (Opcional) El nombre de la propiedad específica del usuario que se desea obtener.
 * @param context - El contexto de ejecución de la solicitud actual.
 * @returns El usuario completo si no se especifica `data`, o la propiedad específica del usuario si se proporciona.
 *
 * 1. Obtiene el objeto `request` desde el contexto HTTP.
 * 2. Extrae el usuario (`user`) del objeto `request`.
 * 3. Si no existe el usuario en la solicitud, lanza una excepción de error interno del servidor.
 * 4. Si no se proporciona `data`, retorna el objeto `user` completo.
 * 5. Si se proporciona `data`, retorna la propiedad específica del usuario.
 */
export const GetUser = createParamDecorator(
    (data:string , context:ExecutionContext ) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new InternalServerErrorException('User not found in request');
        }

        return !data ? user : user[data];
    }
);