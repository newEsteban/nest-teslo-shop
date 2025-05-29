import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    @BeforeInsert()
    async hashPassword() {
        if (!this.password) return;
        this.password = await bcrypt.hashSync(this.password, 10);
    }
}
