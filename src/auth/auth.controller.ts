import { Controller, Post, Body, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';
import { META_ROLES, RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRolesGuard } from './guards/user-roles.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() LoginUserDto: LoginUserDto) {
    return this.authService.login(LoginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]) {

    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
    };
  }
  
  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRolesGuard )
  testingPrivateRoute2(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user,
    }
  }
  
  @Get('private3')
  @Auth(ValidRoles.admin)
  testingPrivateRoute3(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user,
    }
  }
}
