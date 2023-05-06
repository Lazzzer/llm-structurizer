import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
}
bootstrap();
