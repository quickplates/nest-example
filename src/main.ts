import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Config } from "./app/config/config";
import { ConfigService } from "./app/config/service";
import { DetailedBadRequestException } from "./app/exceptions";
import { AppModule } from "./app/module";

async function run() {
  const adapter = new FastifyAdapter({
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  const configService = app.get(ConfigService<Config, true>);

  const validationPipe = new ValidationPipe({
    exceptionFactory: (errors) =>
      new DetailedBadRequestException(
        errors.reduce((acc, error) => {
          for (const child of error.children ?? []) {
            if (child.constraints) {
              if (!(child.property in acc)) {
                acc[child.property] = [];
              }

              acc[child.property].push(...Object.values(child.constraints));
            }
          }

          return acc;
        }, {} as Record<string, string[]>)
      ),
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    whitelist: true,
  });
  app.useGlobalPipes(validationPipe);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("nest-example")
    .setDescription("nest-example api")
    .build();
  const swaggerOptions = {
    operationIdFactory: (_: string, methodKey: string) => methodKey,
  };
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerOptions
  );
  SwaggerModule.setup("schema", app, swaggerDocument);

  const host = configService.get("host", { infer: true });
  const port = configService.get("port", { infer: true });
  await app.listen(port, host);
}

run();
