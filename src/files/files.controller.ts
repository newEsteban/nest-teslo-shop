import { Response } from 'express';
// Importación de decoradores y clases necesarias desde @nestjs/common
import {
    Controller, // Para definir un controlador
    Post, // Decorador para manejar peticiones HTTP POST
    Get, // Decorador para manejar peticiones HTTP GET
    Param, // Decorador para extraer parámetros de la URL               // Decorador para extraer el cuerpo de la petición
    UploadedFile, // Decorador que extrae el archivo cargado en la petición
    UseInterceptors, // Decorador para aplicar interceptores (como multer)
    BadRequestException,
    Res, // Excepción que se lanza cuando no se proporciona un archivo
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Importa el servicio de archivos personalizado (donde posiblemente se maneja la lógica de guardado o validación adicional)
import { FilesService } from './files.service';

// Importa el interceptor específico de multer para manejar archivos en NestJS
import { FileInterceptor } from '@nestjs/platform-express';

// Importa un filtro personalizado para validar archivos según sus características (tipo, tamaño, etc.)
import { fileFilter, fileNamer } from './helpers';

// Importa configuración de almacenamiento desde multer (para guardar el archivo en disco)
import { diskStorage } from 'multer';
import { ApiTags } from '@nestjs/swagger';

// Define un controlador para manejar rutas relacionadas con archivos
@ApiTags('Files-TesloShop')
@Controller('files')
export class FilesController {
    // Inyección del servicio FilesService a través del constructor
    constructor(
        private readonly filesService: FilesService,
        private readonly configService: ConfigService,
    ) {}

    // Ruta POST que responderá a /files/product
    @Post('product')

    // Aplica un interceptor para manejar la subida de archivos
    @UseInterceptors(
        FileInterceptor('file', {
            // Filtro personalizado que define qué archivos son aceptados
            fileFilter: fileFilter,

            // Configuración del almacenamiento en disco local
            storage: diskStorage({
                // Directorio donde se guardarán los archivos
                destination: './storage/products',

                // Función que define el nombre del archivo que se guardará
                filename: fileNamer,
            }),
        }),
    )

    // Método que maneja la subida del archivo
    uploadFileProduct(
        @UploadedFile() file: Express.Multer.File, // Extrae el archivo de la petición
    ) {
        // Si no se proporciona archivo, se lanza una excepción 400
        if (!file) throw new BadRequestException('No file provided');

        const host_api = this.configService.get('HOST_API');

        const secureUrl = host_api + '/files/product/' + file.filename;
        // Si todo va bien, se retorna la información del archivo (path, filename, etc.)
        return {
            secureUrl,
        };
    }

    @Get('product/:imageName')
    getProductImage(
        @Res() res: Response, // Respuesta de Express para enviar el archivo
        @Param('imageName') imageName: string,
    ) {
        const { path } = this.filesService.getStaticProductImage(imageName);

        // res.status(403).json({
        //     ok: false,
        //     message: 'Toma tun imagen',
        //     path,
        // });

        res.sendFile(path);
    }
}
