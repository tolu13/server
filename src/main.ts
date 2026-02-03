/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import * as cors from 'cors';

async function bootstrap() {
  // ❌ Disable Nest built-in CORS — use express one manually
  const app = await NestFactory.create(AppModule, { cors: false });

  const allowedOrigins = [
    'https://nexatrade-weld.vercel.app',
    'http://localhost:5173',
  ];

  // ✅ Use express cors middleware before everything else
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          console.warn('❌ Blocked by CORS:', origin);
          return callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 204,
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
  console.log('✅ Allowed CORS origins:', allowedOrigins);
}
bootstrap();
