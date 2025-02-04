import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadType } from './types';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { promises } from 'dns';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  private readonly logger = new Logger(ApiKeyStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKey: process.env.JWT_SECRET,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }
  async validate(payload: PayloadType): Promise<any> {
    this.logger.log('Validating JWT payload:', payload);
    console.log('Validating API key:', payload);

    // const userId: number = parseInt(payload.userId, 10);
    const user = await this.userService.findById(parseInt(payload.userId, 10));
    // const user = await this.authService.validateUserByApiKey(`${userId}`);
    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException();
    }
    this.logger.log('Validated user:', user);
    return user;
    // return { userId: payload.userId, email: payload.email };
  }

  // async validate(apiKey: string) {
  //   console.log('Validating API key:', apiKey);
  //   const user = await this.authService.validateUserByApiKey(apiKey);
  //   console.log('User found:', user);
  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   return user;
  // }
}
