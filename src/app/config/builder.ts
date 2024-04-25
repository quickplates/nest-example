import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Config } from "./config";
import { ConfigParseError } from "./errors";

/** Builds the config. */
export class ConfigBuilder {
  public static build(): Config {
    const config = {
      server: {
        host: process.env.NEST_EXAMPLE__SERVER__HOST || "0.0.0.0",
        port:
          process.env.NEST_EXAMPLE__SERVER__PORT === undefined
            ? 3000
            : parseInt(process.env.NEST_EXAMPLE__SERVER__PORT, 10),
      },
    };

    const validatedConfig = plainToInstance(Config, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new ConfigParseError();
    }

    return validatedConfig;
  }
}
