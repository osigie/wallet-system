import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const swaggerDocs = (app: any) => {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Wallet System')
    .setDescription('The Wallet System API description')
    .setVersion('1.0')
    .addTag('Wallet System')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
};
