import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
declare const module: any;
// import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersService } from './users/users.service';
import path from 'path';


//dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); 
  console.log('Database Host:', configService.get<string>('DB_HOST'));
  console.log('Database Port:', configService.get<number>('DB_PORT'));
  console.log('Environment JWT Secret:', configService.get<string>('JWT_SECRET'));
  app.useGlobalPipes(new ValidationPipe());

  // const config = new DocumentBuilder()
  const documentBuilder = new DocumentBuilder()  
  .setTitle('Spotify Clone')
    .setDescription('The Spotify Clone Api documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document); 

  const usersService = app.get(UsersService);
  await app.listen(configService.get<number>('port'));
  console.log(configService.get<string>('NODE_ENV')); 
  await usersService.printAllUsers();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();