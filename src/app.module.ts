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
import { DevConfigModule } from './config/devConfig.module';
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
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
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
  console.log("NODE_ENV:", process.env.NODE_ENV);
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
