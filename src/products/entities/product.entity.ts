import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/User.entity';

@Entity({
    name: 'products',
})
export class Product {
    @ApiProperty({ example: 'a3f1c2d4-5678-1234-9abc-1234567890ab', description: 'UUID del producto' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'Camiseta Nike', description: 'Título del producto', uniqueItems: true })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({ example: 99.99, description: 'Precio del producto', default: 0 })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({ example: 'Camiseta deportiva de alta calidad', description: 'Descripción del producto', required: false })
    @Column({
        type: 'text',
        nullable: true,
    })
    descripcion: string;

    @ApiProperty({ example: 'camiseta_nike', description: 'Slug único para el producto', uniqueItems: true })
    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;

    @ApiProperty({ example: 10, description: 'Cantidad en stock', default: 0 })
    @Column({
        type: 'int',
        default: 0,
    })
    stock: number;

    @ApiProperty({ example: ['S', 'M', 'L'], description: 'Tallas disponibles', isArray: true })
    @Column('text', {
        array: true,
    })
    sizes: string[];

    @ApiProperty({ example: 'men', description: 'Género del producto' })
    @Column('text')
    gender: string;

    @ApiProperty({ example: ['deporte', 'verano'], description: 'Etiquetas del producto', isArray: true, default: [] })
    @Column({
        type: 'text',
        array: true,
        default: [],
    })
    tags: string[];

    @ApiProperty({ type: () => [ProductImage], description: 'Imágenes del producto', required: false })
    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        eager: true,
    })
    images?: ProductImage[];

    @ApiProperty({ type: () => User, description: 'Usuario que creó el producto', required: false })
    @ManyToOne(() => User, (user) => user.products, {
        nullable: true,
        eager: true,
    })
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title ?? '';
        }

        this.slug = this.slug
            .toLowerCase()
            .trim()
            .replace(/[\s\-]+/g, '_') // Replace spaces and hyphens with underscores
            .replace(/[^\w_]+/g, ''); // Remove non-word characters except underscores
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll('-', '_');
    }
}
