/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: 'CASCADE' } // Si se elimina un producto, tambien se eliman sus imagenes relacionadas
    )
    product: Product
}