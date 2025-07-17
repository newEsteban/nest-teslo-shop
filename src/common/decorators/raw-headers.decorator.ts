import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

/**
 * Custom parameter decorator for NestJS controllers that injects the raw HTTP headers
 * from the incoming request into the decorated route handler parameter.
 *
 * @param data - Optional data passed to the decorator (not used in this implementation).
 * @param ctx - The execution context of the current request.
 * @returns An array containing the raw HTTP headers as received by the server.
 *
 * @example
 * ```typescript
 * @Get()
 * someHandler(@RawHeaders() rawHeaders: string[]) {
 *   console.log(rawHeaders);
 * }
 * ```
 *
 * This decorator is useful when you need access to the original, unparsed HTTP headers
 * for advanced use cases such as debugging, logging, or custom header processing.
 */
export const RawHeaders = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;
    }
);
