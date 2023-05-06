import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common/enums';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // OpenAPI (Swagger) configuration
  const config = new DocumentBuilder()
    .setTitle('LLM-Structurizer API')
    .setDescription(
      'LLM-Structurizer is an API that allows you to structure your data in a way that is easy to use and understand with the power of Large Language Models.',
    )
    .setVersion('1.0')
    .addTag('llm-structurizer')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // URI Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(3000);
}
bootstrap();
