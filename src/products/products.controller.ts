import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '../auth/entities/User.entity';
import { ValidRole } from 'src/auth/interfaces/valid-roles';
import { Product } from './entities';

@ApiTags('Products-TesloShop')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Auth()
    @ApiResponse({
        status: 201,
        description: 'Product created successfully',
        type: Product,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden. You do not have permission to perform this action.',
    })
    create(
        @Body() createProductDto: CreateProductDto,
        @GetUser() user: User,
    ) {
        return this.productsService.create(createProductDto, user);
    }


    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productsService.findAll(paginationDto);
    }

    @Auth()
    @Get(':request')
    findOne(@Param('request') request: string) {
        return this.productsService.findOnePlain(request);
    }

    @Auth(ValidRole.admin)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto,
        @GetUser() user: User,
    ) {
        return this.productsService.update(id, updateProductDto, user);
    }

    @Auth(ValidRole.admin)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }
}
