import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './songs/songs.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { PlaylistModule } from './playlists/playlists.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { ArtistsModule } from './artists/artists.module';
import { SeedModule } from './seed/seed.module';
import { typeOrmAsyncConfig } from 'db/data-source';
import configuration from './config/configuration';
import { DevConfigModule } from './config/devConfig.module';
import { validate } from 'env.validation';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: ['.env.development', '.env.development.production'],
      envFilePath: [`.env.development.${process.env.NODE_ENV}`, '.env.development'],
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    SongsModule,
    PlaylistModule,
    AuthModule,
    UserModule,
    ArtistsModule,
    DevConfigModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'CONFIG',
      useValue: { port: '3001' },
    },
  ],
})
/* export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
} */
export class AppModule {}
