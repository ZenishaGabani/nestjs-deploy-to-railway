import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authService: AuthService;
  let accessToken: string;
  let expiredToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    const user = await authService.validateUserByApiKey('YOUR_API_KEY');
    accessToken = jwtService.sign({ userId: user.id, email: user.email });
    expiredToken = jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '1ms' }); // Expired token
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /profile with valid token', () => {
    return request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('email');
      });
  });
  
  it('GET /profile with expired token', () => {
    return request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
  

  it('GET /profile without token', () => {
    return request(app.getHttpServer())
      .get('/profile')
      .expect(401);
  });
  
});
