import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerDocs } from './swagger-docs';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { timeoutInterceptor } from './interceptors/timeout.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('bootstrap');

  app.use(helmet());

  app.enableVersioning({ type: VersioningType.URI });

  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new timeoutInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  const PORT = parseInt(process.env.PORT) || 5000;

  swaggerDocs(app);

  await app.listen(PORT, () => {
    logger.log(
      `${process.env.APP_NAME} Rest API listening on port ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
}
bootstrap();
