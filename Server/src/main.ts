import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // 全局前缀
  app.setGlobalPrefix('api');
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  });
    // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 如果请求中包含 DTO 类中没有定义的属性，自动删除这些属性
      forbidNonWhitelisted: true, // 如果请求中包含 DTO 类中没有定义的属性，抛出错误
      transform: true, // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT!);
   console.log(`Application is running on: http://localhost:${process.env.PORT}`);
}
bootstrap();
