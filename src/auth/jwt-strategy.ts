import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadType } from './types';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }
  async validate(payload: PayloadType) {
    this.logger.log(`Decoded JWT payload: ${JSON.stringify(payload)}`);
    // const userId = parseInt(payload.userId, 10);
    const user = await this.usersService.findById(parseInt(payload.userId, 10));
    if (!user) {
      throw new UnauthorizedException();
    }
    this.logger.log(`User found: ${JSON.stringify(user)}`);
    return user;
    //return { userId: payload.userId, email: payload.email };
  }
}
