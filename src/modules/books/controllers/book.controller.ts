import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationQueryDto, CreateBookDto, UpdateBookDto } from '../dto';
import { BookService } from '../services';
import { AuthGuard } from 'src/infrastructure/security/auth.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Books')
@Controller('books')
export class BooksController {
    constructor(private readonly bookService: BookService) { }

    @ApiOperation({ summary: 'Get all books with pagination' })
    @ApiResponse({ status: 200, description: 'List of books' })
    @Get()
    async findAll(@Query() query: PaginationQueryDto) {
        const { books, total } = await this.bookService.findAll(query?.page ?? 1, query?.limit ?? 10);
        return {
            message: 'Books fetched successfully.',
            data: books,
            meta: {
                page: query?.page ?? 1,
                limit: query?.limit ?? 10,
                total,
            },
        };
    }

    @ApiOperation({ summary: 'Get a book by ID' })
    @ApiResponse({ status: 200, description: 'Book details' })
    @Get(':id')
    async findById(@Param('id') id: string) {
        const book = await this.bookService.findById(id);
        return { message: 'Book found.', data: book };
    }

    @ApiOperation({ summary: 'Create a new book' })
    @ApiResponse({ status: 201, description: 'Book created' })
    @Post()
    async create(@Body() createBookDto: CreateBookDto) {
        const book = await this.bookService.create(createBookDto);
        return { message: 'Book created.', data: book };
    }

    @ApiOperation({ summary: 'Update a book by ID' })
    @ApiResponse({ status: 200, description: 'Book updated' })
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        const book = await this.bookService.update(id, updateBookDto);
        return { message: 'Book updated.', data: book };
    }

    @ApiOperation({ summary: 'Delete a book by ID' })
    @ApiResponse({ status: 200, description: 'Book deleted' })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.bookService.delete(id);
        return { message: 'Book deleted.' };
    }
}
