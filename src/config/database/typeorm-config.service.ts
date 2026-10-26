import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import SnakeNamingStrategy from 'typeorm-naming-strategy';
import { DATABASE_CONFIG } from './database.config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig =
      this.configService.getOrThrow<TypeOrmModuleOptions>(DATABASE_CONFIG);

    const isDev = this.configService.get<string>('NODE_ENV') === 'development';

    return {
      ...dbConfig,
      autoLoadEntities: true,
      synchronize: false,
      logging: isDev ? ['query', 'error', 'warn'] : ['error'],
      migrationsRun: false,
      retryAttempts: 5,
      retryDelay: 3000,
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
