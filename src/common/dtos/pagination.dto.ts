import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';


export class PaginationDto {

    @ApiProperty({
        example: 10,
        description: 'Numero de elementos a retornar',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        example: 0,
        description: 'Numero de elementos a omitir',
        required: false,
        type: Number,
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}
