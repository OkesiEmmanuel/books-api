import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [AuthModule, UserModule, BooksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
