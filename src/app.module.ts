import { Module } from '@nestjs/common';

import { BooksModule } from './modules/books/books.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/user.module';

@Module({
  imports: [AuthModule, UsersModule, BooksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
