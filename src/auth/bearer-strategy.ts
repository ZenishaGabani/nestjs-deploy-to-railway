import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: string) {
    console.log('Validating token:', token);
    const user = await this.authService.validateUserByApiKey(token);
    console.log('User found:', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
