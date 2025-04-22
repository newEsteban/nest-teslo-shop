import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('ProductsService');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async create(createProductDto: CreateProductDto) {
        try {
            const product = this.productRepository.create(createProductDto);
            await this.productRepository.save(product);

            return product;
        } catch (error) {
            console.log
            this.handlerDBExceptions(error);
        }
    }
    /**
     * Obtiene una lista paginada de productos.
        let { limit = 10, offset = 0 } = paginationDto;

        limit = Math.max(1, Math.min(limit, 100)); // Asegura que el límite esté entre 1 y 100
        offset = Math.max(0, offset); // Asegura que el desplazamiento no sea negativo
    * @returns Una promesa que resuelve en un arreglo de productos.
    */
    findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        return this.productRepository.find({
            take: limit,
            skip: offset
        });
    }

    async findOne(uuid: string) {
        try {
            return await this.productRepository.findOneOrFail({
                where: {id: uuid},
            });
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.preload({
            id,
            ...updateProductDto,
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        try {
            return await this.productRepository.save(product);
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }

    async remove(id: string) {
        try {
            const product = await this.findOne(id);
            if (!product) {
                throw new BadRequestException(`Product with ID ${id} not found`);
            }
            await this.productRepository.remove(product);
            return { message: `Product with ID ${id} was succesfully deleted` };
        } catch (error) {
            this.handlerDBExceptions(error);   
        }
    }

    private handlerDBExceptions( error: any){
        if (error.code === '23505') throw new BadRequestException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException('Unexpected error, check server log');
    }
}
