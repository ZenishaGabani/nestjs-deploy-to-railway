import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Enable2FAType } from './types';
import { ValidateTokenDTO } from './dto/validate-token.dto';
import { UpdateResult } from 'typeorm';
import { JwtAuthGuard } from './jwt-guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}
  @Post('signup')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'It will return the user in the response',
  })
  signup(
    @Body()
    userDTO: CreateUserDTO,
  ): Promise<User> {
    return this.userService.create(userDTO);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'It will give you the access_token in the response',
  })
  login(
    @Body()
    loginDTO: LoginDTO,
  ) {
    return this.authService.login(loginDTO);
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  enable2FA(
    @Request()
    req,
  ): Promise<Enable2FAType> {
    console.log(req.user);
    return this.authService.enable2FA(req.user.userId);
  }

  @Post('validate-2fa')
  @UseGuards(JwtAuthGuard)
  validate2FA(
    @Request()
    req,
    @Body()
    ValidateTokenDTO: ValidateTokenDTO,
  ): Promise<{ verified: boolean }> {
    return this.authService.validate2FAToken(
      req.user.userId,
      ValidateTokenDTO.token,
    );
  }

  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  disable2FA(
    @Request()
    req,
  ): Promise<UpdateResult> {
    return this.authService.disable2FA(req.user.userId);
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    this.logger.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`Request User: ${JSON.stringify(req.user)}`);
    delete req.user.password;
    return { msg: 'authenticated with api key', user: req.user };
  }
  

  @Get('test')
  testEnvVeriable() {
    return this.authService.getEnvVariable();
  }
}
