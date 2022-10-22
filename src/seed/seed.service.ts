/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User> 
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers()
    await this.insertProducts(adminUser);

    return "SEED EXECUTED";
  }

  private async deleteTables() {
    
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() {

    const seedUsers = initialData.users;
    
    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) )
    });

    const dbUsers = await this.userRepository.save( seedUsers )

    return dbUsers[0];
  }

  private async insertProducts(user: User) {
    await this.productsService.deleteAllProducts()

    const seedProducts = initialData.products;

    const insertPromises = []

    seedProducts.forEach( seedProduct => {
      insertPromises.push(this.productsService.create(seedProduct, user));
    })

    await Promise.all(insertPromises);

    return true;
  }
}
