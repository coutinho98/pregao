import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export class Env {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '12h';

  @Matches(/^[0-9a-f]{64}$/i, { message: 'AUDIT_PRIVATE_KEY must be 32 bytes in hex (64 chars)' })
  AUDIT_PRIVATE_KEY: string;

  @IsEmail()
  AIC_CONTACT_EMAIL: string;

  @IsString()
  @MinLength(32)
  PSEUDONYM_SECRET: string;

  /** Login and sign-up attempts allowed per IP per minute (brute-force protection). */
  @IsInt()
  @Min(1)
  AUTH_ATTEMPTS_PER_MINUTE: number = 10;

  /** How often the settlement worker looks for ended lots; 0 turns the worker off. */
  @IsInt()
  @Min(0)
  SETTLEMENT_INTERVAL_MS: number = 5_000;

  /** Folder with artworks.json + images: when set, the catalog works offline from it. */
  @IsOptional()
  @IsString()
  CATALOG_FIXTURES_DIR?: string;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw, { enableImplicitConversion: true });
  const errors = validateSync(env);
  if (errors.length > 0) {
    const problems = errors.flatMap((error) => Object.values(error.constraints ?? {}));
    throw new Error(`Invalid environment variables:\n- ${problems.join('\n- ')}`);
  }
  return env;
}
