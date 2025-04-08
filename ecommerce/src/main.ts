import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import helmet from 'helmet';
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';
import * as express from 'express'; // Importa express

async function bootstrap() {
  let httpsOptions: { key: Buffer; cert: Buffer } | undefined = undefined;

  const keyPath = './certs/key.pem';
  const certPath = './certs/cert.pem';
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } else {
    console.warn('⚠️ Certificados HTTPS no encontrados. El servidor se ejecutará sin HTTPS.');
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());
  app.use(helmet());
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: !!httpsOptions,
        sameSite: 'strict',
      },
    }),
  );

  // Sirve archivos estáticos desde la carpeta "public/images"
  app.use('/images', express.static(path.join(__dirname, '../public/images')));

  app.use((req, res, next) => {
    try {
      const csrfToken = req.csrfToken();
      res.cookie('XSRF-TOKEN', csrfToken);
      res.setHeader('X-CSRF-TOKEN', csrfToken);
      console.log('Generated CSRF Token:', csrfToken);
    } catch (error) {
      console.error('Error generating CSRF token:', error.message);
    }
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline';",
    );
    next();
  });

  await app.listen(port);
  console.log(`🚀 Servidor corriendo en ${httpsOptions ? 'https' : 'http'}://localhost:${port}`);
  return app;
}
bootstrap();