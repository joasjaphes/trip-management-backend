import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UserService } from './modules/user/user.service';
import { SortByCreatedAtInterceptor } from './interceptors/sort-by-created-at.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Trip Management API')
    .setDescription('The trip management API description')
    .setVersion('1.0')
    .addTag('trips')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.useGlobalInterceptors(new SortByCreatedAtInterceptor());
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use((req, res, next) => {
    console.log('Original URL: ', req.originalUrl);
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
