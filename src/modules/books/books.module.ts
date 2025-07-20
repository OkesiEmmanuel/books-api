import { Module } from '@nestjs/common';
import { BookRepository } from './repositories';
import { BooksController } from './controllers';
import { BookService } from './services';


@Module({
    controllers: [BooksController],
    providers: [
        BookService,
        {
            provide: 'IBookRepository',
            useClass: BookRepository,
        },
    ],
})
export class BooksModule { }
