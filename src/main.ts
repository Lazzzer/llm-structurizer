import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ApiKeyAuthGuard } from './auth/guard/apiKey-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.useGlobalGuards(new ApiKeyAuthGuard());
  app.enableCors();
  app.use(helmet());

  // URI Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // OpenAPI (Swagger) configuration
  const config = new DocumentBuilder()
    .setTitle('LLM-Structurizer API')
    .setDescription(
      'LLM-Structurizer is an API that allows you to structure your data in a way that is easy to use and understand with the power of Large Language Models.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
      },
      'apiKey',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
