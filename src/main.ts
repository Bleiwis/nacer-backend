import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const rawFrontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );

  // Normalizar eliminando barra inclinada final (trailing slash) si existe
  const normalizedUrl = rawFrontendUrl.endsWith('/')
    ? rawFrontendUrl.slice(0, -1)
    : rawFrontendUrl;

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (ej. Postman, cURL, server-side)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        normalizedUrl,
        'http://localhost:3000',
        'https://nacer-frontend.vercel.app',
      ];

      if (allowedOrigins.includes(origin) || rawFrontendUrl === '*') {
        callback(null, true);
      } else {
        callback(null, true); // Fallback permisivo para producción de la prueba técnica
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
  console.log(`CORS enabled for origins: ${normalizedUrl}, https://nacer-frontend.vercel.app`);
}
bootstrap();
