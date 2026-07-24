import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /user/:username - debe obtener información de perfil de GitHub exitosamente', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/octocat')
      .expect(200);

    expect(response.body).toHaveProperty('username', 'octocat');
    expect(response.body).toHaveProperty('avatarUrl');
    expect(response.body).toHaveProperty('profileUrl');
    expect(typeof response.body.publicRepos).toBe('number');
  });

  it('GET /user/:username - debe retornar 404 para usuario no existente', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/usuario-super-inexistente-123456789-nacer')
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body.message).toContain('no existe');
  });
});
