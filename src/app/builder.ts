import {
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { App } from "./app";
import { DetailedBadRequestException } from "./exceptions";
import { AppModule } from "./module";

/** Builds the app. */
export class AppBuilder {
  public async build(): Promise<App> {
    const app = await this.buildNestApp();

    this.configurePipes(app);
    this.configureSwagger(app);

    return new App(app);
  }

  private buildAdapter(): FastifyAdapter {
    return new FastifyAdapter({
      ignoreDuplicateSlashes: true,
      ignoreTrailingSlash: true,
    });
  }

  private async buildNestApp(): Promise<NestFastifyApplication> {
    const adapter = this.buildAdapter();

    return await NestFactory.create<NestFastifyApplication>(AppModule, adapter);
  }

  private buildValidationPipe(): ValidationPipe {
    const mapErrors = (errors: ValidationError[]) => {
      return errors.reduce<{ [key: string]: string[] }>((acc, error) => {
        for (const child of error.children ?? []) {
          if (child.constraints) {
            if (!(child.property in acc)) {
              acc[child.property] = [];
            }

            acc[child.property].push(...Object.values(child.constraints));
          }
        }

        return acc;
      }, {});
    };

    const options: ValidationPipeOptions = {
      exceptionFactory: (errors) => {
        return new DetailedBadRequestException(mapErrors(errors));
      },
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    };

    return new ValidationPipe(options);
  }

  private configurePipes(app: NestFastifyApplication): void {
    const validationPipe = this.buildValidationPipe();

    app.useGlobalPipes(validationPipe);
  }

  private configureSwagger(app: NestFastifyApplication): void {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("nest-example")
      .setDescription("NestJS service example 🐈")
      .build();

    const swaggerOptions = {
      operationIdFactory: (_: string, methodKey: string) => methodKey,
    };

    const swaggerDocument = SwaggerModule.createDocument(
      app,
      swaggerConfig,
      swaggerOptions,
    );

    SwaggerModule.setup("schema", app, swaggerDocument);
  }
}
