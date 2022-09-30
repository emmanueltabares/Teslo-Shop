/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
  ) {}

  async runSeed() {
    await this.insertProducts();

    return "SEED EXECUTED";
  }

  private async insertProducts() {
    await this.productsService.deleteAllProducts()

    const seedProducts = initialData.products;

    const insertPromises = []

    seedProducts.forEach( seedProduct => {
      insertPromises.push(this.productsService.create(seedProduct));
    })

    await Promise.all(insertPromises);

    return true;
  }
}
