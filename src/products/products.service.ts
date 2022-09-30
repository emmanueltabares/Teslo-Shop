/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger()
  
  constructor(

    // Inyectamos el repositorio
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product);

      return product;
    } catch (error: any) { this.handleDBExceptions(error) }

  }

  findAll(paginationDto?: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {

    let product: Product;

    if(isUUID(term)) product = await this.productRepository.findOneBy({ id: term })
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();

      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne()
    }

    if (!product) throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    })

    if(!product) throw new NotFoundException(`Product with id ${id} Not Found`);

    try {
      await this.productRepository.save(product)
      return product;
    } catch (error: any) { this.handleDBExceptions(error) }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    try {
      
      await this.productRepository.remove(product);
    } catch (error: any) { this.handleDBExceptions(error) }
  }

  // Manejo de errores
  private handleDBExceptions(error: any) {
    if(error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }

  private handelExceptions = (error: any) => {

    if(error.code === '23055') throw new BadRequestException(error.detail)
      
      this.logger.error(error)
      throw new InternalServerErrorException('Error!, check server logs')
  }
}
