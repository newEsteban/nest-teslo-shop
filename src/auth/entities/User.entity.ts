import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        select: false,
    })
    password: string;

    @Column({
        type: 'varchar',
        unique: true,
    })
    email: string;

    @Column({
        type: 'varchar',
    })
    fullName: string;

    @Column({
        type: 'text',
        default: ['user'],
        array: true,
    })
    roles: string[];

    @Column({
        type: 'bool',
        default: true,
    })
    isActive: boolean;

    @OneToMany(
        () => Product,
        (product) => product.user
    )
    products: Product[];

    @BeforeInsert()
    async hashPassword() {
        if (!this.password) return;
        this.password = await bcrypt.hashSync(this.password, 10);
    }

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
        this.fullName = this.fullName.trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }


}
