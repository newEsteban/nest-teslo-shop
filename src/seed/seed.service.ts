import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed.data';
import { User } from '../auth/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
    constructor(
        private readonly productService: ProductsService,

        @InjectRepository( User )
        private readonly userRepository: Repository<User>,
    ) {}

    public async runSeed() {
        await this.deleteTables();
        let user = await this.insertUsers();

        await this.insertNewProducts(user);
        return {
            ok: true,
            message: 'Seed executed',
            data: null,
        };
    }

    private async deleteTables(){
        await this.productService.deleteAllProducts();
        //Eliminar usuarios
        await this.userRepository.createQueryBuilder().delete().execute();

        return true;
    }

    private async insertUsers() {
        const seedUsers = initialData.users;
        const users: User[] = [];

        seedUsers.forEach((user) => {
            const newUser = this.userRepository.create(user);
            users.push(newUser);
        });

        const dbUser = await this.userRepository.save(users);

        return dbUser[0];
    }

    private async insertNewProducts( user: User ) {
        await this.productService.deleteAllProducts();

        const products = initialData.products;
        const insertPromises: Promise<any>[] = [];
        products.forEach((product) => {
            insertPromises.push(this.productService.create(product, user));
        });

        await Promise.all(insertPromises);

        return true;
    }
}
