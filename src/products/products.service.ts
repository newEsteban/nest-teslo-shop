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
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('ProductsService');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,

        private readonly dataSource: DataSource,
    ) {}

    async create(createProductDto: CreateProductDto) {
        try {
            const { images = [], ...productsDetails } = createProductDto;

            const product = this.productRepository.create({
                ...productsDetails,
                images: images.map((image) =>
                    this.productImageRepository.create({ url: image }),
                ),
            });

            await this.productRepository.save(product);

            return { ...product, images };
        } catch (error) {
            console.log;
            this.handlerDBExceptions(error);
        }
    }
    /**
     * description: Este metodo buscar los productos en la base de datos.
     * @param paginationDto
     * @param paginationDto.limit Limite de productos a devolver
     * @param paginationDto.offset Desplazamiento para la paginación
     * @return Una promesa que resuelve en un arreglo de productos.
     *
     */
    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        const products = await this.productRepository.find({
            take: limit,
            skip: offset,
            relations: {
                images: true,
            },
        });

        return products.map((product) => {
            return {
                ...product,
                images: (product.images ?? []).map((image) => image.url),
            };
        });
    }

    /**
     * Busca un producto por UUID, título o slug.
     * Si se proporciona un UUID válido, se realiza la búsqueda directamente por ID.
     * En caso contrario, se realiza una búsqueda usando 'title' o 'slug'.
     * Lanza una excepción si no se encuentra ningún producto.
     *
     * @param request - UUID, título o slug del producto
     * @returns El producto encontrado
     * @throws NotFoundException si no se encuentra el producto
     */
    async findOne(request: string) {
        try {
            let product: Product | null;
            if (isUUID(request)) {
                product = await this.productRepository.findOneBy({
                    id: request,
                });
            } else {
                const query = this.productRepository.createQueryBuilder();
                product = await query
                    .where('LOWER(title) =:title OR slug =:slug', {
                        title: request.toLowerCase(),
                        slug: request,
                    })
                    .leftJoinAndSelect('product.images', 'images')
                    .getOne();
            }

            if (!product) {
                throw new NotFoundException(
                    `Product with ${request} not found`,
                );
            }
            return product;
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }

    /**
     * Actualiza un producto existente en la base de datos.
     *
     * Este método recibe el identificador del producto y un DTO con los datos a actualizar.
     * Si se incluyen imágenes en el DTO, elimina las imágenes antiguas asociadas al producto
     * y crea nuevas instancias de imágenes con las URLs proporcionadas.
     *
     * Utiliza un `QueryRunner` para asegurar que las operaciones de actualización y manejo de imágenes
     * se realicen dentro de una transacción, garantizando la integridad de los datos.
     *
     * @param id - Identificador único del producto a actualizar.
     * @param updateProductDto - Objeto con los campos a actualizar del producto, incluyendo opcionalmente un arreglo de URLs de imágenes.
     * @returns Un objeto con los datos actualizados del producto, incluyendo un arreglo de URLs de las imágenes asociadas.
     * @throws NotFoundException Si no se encuentra un producto con el ID proporcionado.
     * @throws Error Si ocurre algún error durante la transacción, se revierte la operación y se maneja la excepción.
     */
    async update(id: string, updateProductDto: UpdateProductDto) {
        const { images, ...toUpdate } = updateProductDto;
        const product = await this.productRepository.preload({
            id,
            ...toUpdate,
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        //Create query runner
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (images) {
                //Delete old images
                // Elimina todas las imágenes asociadas al producto con el id dado usando el queryRunner.
                // Esto asegura que las imágenes antiguas se borren antes de agregar las nuevas.
                await queryRunner.manager.delete(ProductImage, {
                    product: { id },
                });

                // Asigna al producto una nueva lista de imágenes, creando instancias de ProductImage para cada URL proporcionada.
                // Esto prepara las nuevas imágenes para ser guardadas en la base de datos.
                product.images = images.map((image) =>
                    this.productImageRepository.create({ url: image }),
                );
            }

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();

            // return await this.productRepository.save(product);
            return {
                ...product,
                images: (product.images ?? []).map((image) => image.url),
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.handlerDBExceptions(error);
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: string) {
        try {
            const product = await this.findOne(id);
            if (!product) {
                throw new BadRequestException(
                    `Product with ID ${id} not found`,
                );
            }
            await this.productRepository.remove(product);
            return { message: `Product with ID ${id} was succesfully deleted` };
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }

    private handlerDBExceptions(error: any) {
        if (error.code === '23505') throw new BadRequestException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(
            'Unexpected error, check server log',
        );
    }

    async findOnePlain(request: string) {
        try {
            const product = await this.findOne(request);
            if (!product) {
                throw new BadRequestException(
                    `Product with ${request} not found`,
                );
            }
            const { images = [], ...rest } = product;

            return {
                ...rest,
                images: images.map((image) => image.url),
            };
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }

    public async deleteAllProducts() {
        const query = this.productRepository.createQueryBuilder('product');
        try {
            await query.delete().where({}).execute();
            return { message: 'All products deleted' };
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }
}
