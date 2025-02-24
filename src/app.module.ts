import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
      isGlobal: true,
      envFilePath: ['.env.development', '.env.development.production'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || process.env.POSTGRES_HOST,
      port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT, 10),
      username: process.env.USERNAME || process.env.POSTGRES_USER,
      password: process.env.PASSWORD || process.env.POSTGRES_PASSWORD,
      database: process.env.DB_NAME || process.env.POSTGRES_DB,
      synchronize: true, // Adjust as needed
      logging: false, // Adjust as needed
    }),      
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
