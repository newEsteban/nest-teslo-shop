import {
    IsArray,
    IsIn,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Camisa Teslo', description: 'Nombre del producto' })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiPropertyOptional({ example: 100, description: 'Precio del producto' })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiPropertyOptional({ example: 'Una camisa de algodón', description: 'Descripción del producto' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'camisa-teslo', description: 'Slug para el producto' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ example: 10, description: 'Cantidad en stock' })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({ example: ['S', 'M', 'L'], description: 'Tallas disponibles', isArray: true })
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty({ example: 'men', description: 'Género', enum: ['men', 'women', 'kid', 'unisex'] })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiPropertyOptional({ example: ['camisa', 'algodon'], description: 'Etiquetas del producto', isArray: true })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ example: ['https://image.jpg'], description: 'Imágenes del producto', isArray: true })
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    images?: string[];
}
