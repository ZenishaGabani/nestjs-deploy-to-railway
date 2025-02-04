import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './api-key-strategy';
import { BearerStrategy } from './bearer-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    UserModule,
    /* ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }), */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UsersService, JwtStrategy, ApiKeyStrategy, BearerStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
