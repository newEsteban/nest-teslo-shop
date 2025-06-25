import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador personalizado para obtener los headers "raw" de la petición HTTP.
 * Uso: en un controlador, agrega @RawHeaders() como parámetro para acceder a los headers.
 */
export const RawHeaders = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.rawHeaders;
  },
);
