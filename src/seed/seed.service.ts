import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed.data';

@Injectable()
export class SeedService {
    constructor(private readonly productService: ProductsService) {}

    public async runSeed() {
        await this.insertNewProducts();
        return {
            ok: true,
            message: 'Seed executed',
            data: null,
        };
    }

    private async insertNewProducts() {
        await this.productService.deleteAllProducts();

        const products = initialData.products;
        const insertPromises: Promise<any>[] = [];
        products.forEach((product) => {
            insertPromises.push(this.productService.create(product));
        });

        await Promise.all(insertPromises);

        return true;
    }
}
