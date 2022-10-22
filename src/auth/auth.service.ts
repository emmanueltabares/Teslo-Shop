/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {

  private readonly logger = new Logger();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error: any) { this.handleDBErrors(error) }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;

      const user = await this.userRepository.findOne({ 
        where: { email },
        select: { email: true, password: true, id: true }
      });

      if(!user) throw new UnauthorizedException('Credentials are not valid')

      if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid')

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error) { this.handleDBErrors(error)}
  }

  async checkAuthStatus(user: User) {

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {

    return this.jwtService.sign(payload)
  }

  private handleDBErrors(error: any): never {
    if(error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error)

    throw new InternalServerErrorException('check server logs')
  }
}
