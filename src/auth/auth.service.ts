import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enable2FAType, PayloadType } from './types';
import * as speakeasy from 'speakeasy';
import { UpdateResult } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async login(loginDTO: LoginDTO): Promise<{ accessToken: string }> {
    try {
      const user = await this.userService.findOne(loginDTO);
      const passwordMatched = await bcrypt.compare(
        loginDTO.password,
        user.password,
      );
      if (!passwordMatched) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // if (passwordMatched) {
      delete user.password;
      const payload: PayloadType = {
        email: user.email,
        userId: user.id.toString(),
      };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1d',
      });
      this.logger.log('Generated JWT Token:', token);
      /* const decoded = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        console.log('Decoded JWT:', decoded); */
      user.apiKey = token;
      await this.userRepository.save(user);
      return { accessToken: token };
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  // async login(loginDTO: LoginDTO): Promise<{ accessToken: string } | { validate2FA: string; message: string }> {
  //   const user = await this.userService.findOne(loginDTO);
  //   const passwordMatched = await bcrypt.compare(loginDTO.password, user.password);
  //   if (passwordMatched) {
  //     delete user.password;
  //     const payload: PayloadType = { email: user.email, userId: user.id };
  //     const artist = await this.artistsService.findArtist(user.id);
  //     if (artist) {
  //       payload.artistId = artist.id;
  //     }
  //     if (user.enable2FA && user.twoFASecret) {
  //       return {
  //         validate2FA: 'http://localhost:3001/auth/validate-2fa',
  //         message: 'Please sends the one time password/ your Google Authenticator App',
  //       };
  //     }
  //     return {
  //       accessToken: this.jwtService.sign(payload),
  //     };
  //   } else {
  //     throw new UnauthorizedException('Password does not match');
  //   }
  // }

  async enable2FA(userId: number): Promise<Enable2FAType> {
    try {
      const user = await this.userService.findById(userId);
      if (user.enable2FA) {
        return { secret: user.twoFASecret };
      }
      const secret = speakeasy.generateSecret();
      user.twoFASecret = secret.base32;
      await this.userService.updateSecretKey(user.id, user.twoFASecret);
      return { secret: user.twoFASecret };
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw new UnauthorizedException('Failed to enable 2FA');
    }
  }

  async validate2FAToken(
    userId: number,
    token: string,
  ): Promise<{ verified: boolean }> {
    try {
      const user = await this.userService.findById(userId);
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        token: token,
        encoding: 'base32',
      });
      if (verified) {
        return { verified: true };
      } else {
        return { verified: false };
      }
    } catch (err) {
      throw new UnauthorizedException('Error verifying token');
    }
  }

  async disable2FA(userId: number): Promise<UpdateResult> {
    return this.userService.disable2FA(userId);
  }
  async validateUserByApiKey(apiKey: string): Promise<User> {
    this.logger.log(`Validating user with API key: ${apiKey}`);
    if (!apiKey || !apiKey.startsWith('Bearer ')) {
      this.logger.error('Invalid or missing API key');
      throw new UnauthorizedException('Invalid or missing API key');
    }
    const token = apiKey.split(' ')[1].trim();
    /* if (apiKey.startsWith('Bearer ')) {
        apiKey = apiKey.split(' ')[1].trim();
      }

      this.logger.log('Extracted API key:', apiKey);
 */
    let decoded: PayloadType;
    try {
      decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid JWT Token');
    }
    this.logger.log(`Decoded JWT: ${JSON.stringify(decoded)}`);

    const userId = parseInt(decoded.userId, 10);
      //this.logger.log('UserId from decoded JWT:', userId); */

    const user = await this.userService.findById(parseInt(decoded.userId, 10));
    if (!user) {
      this.logger.error('User not found for  API key');
      throw new UnauthorizedException('User not found');
    }
    this.logger.log(`Validated User: ${JSON.stringify(user)}`);
    return user;
  }
  getEnvVariable() {
    return this.configService.get<number>('port');
  }
}
