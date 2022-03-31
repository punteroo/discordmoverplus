import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as config from '../config.json';
import { ApiModule } from './modules/api.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoDb, { dbName: 'discord-mover' }),
    ApiModule,
  ],
})
export class AppModule {}
