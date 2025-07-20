import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookRepository } from '../repositories';
import {Book} from '@prisma/client';
import { RedisFacade } from 'src/infrastructure/redis.service';
import { ApiResponse } from 'src/utils';
import { CreateCommentDto } from '../dto/create-comment.dto';


@Injectable()
export class BookService {
    constructor(
        private readonly bookRepo: BookRepository,
        private readonly redis: RedisFacade, //  RedisService is injected for caching
    ) { }

    async findAll(page: number, limit: number) {
        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            throw new NotFoundException('Page and limit must be positive integers.');
        }
        //check redis cache if exists
        let cachedBooks = await this.redis.get(`books:${page}:${limit}`);
        if (cachedBooks) {
            return JSON.parse(cachedBooks);
        }
        // If not cached, fetch from repository
        const { books, total } = await this.bookRepo.findAll(page, limit);
        // Cache the result in Redis
        await this.redis.set(`books:${page}:${limit}`, JSON.stringify({ books, total })); // Cache for 1 hour
        // Return the books and total count

        return ApiResponse.success('Books fetched successfully', { books, total });
    }

    async findById(id: string) {
        // Validate ID
        if (!id) {
            throw new NotFoundException('Book ID must be provided.');
        }
        // Check Redis cache first
        const cachedBook = await this.redis.get(`book:${id}`);
        if (cachedBook) {
            return JSON.parse(cachedBook);
        }
        // If not cached, fetch from repository
        const book = await this.bookRepo.findById(id);
        if (!book) throw new NotFoundException('Book not found.');
        return ApiResponse.success('Book fetched successfully', book);
    }

    async create(data: Partial<Book>) {
        // Validate data
        if (!data || Object.keys(data).length === 0) {
            throw new NotFoundException('Book data must be provided.');
        }
        // Create book in repository
        const createdBook = await this.bookRepo.create(data);
        // Cache the newly created book
        await this.redis.set(`book:${createdBook.id}`, createdBook);
        return ApiResponse.success('Book created successfully', createdBook);
    }

    async update(id: string, data: Partial<Book>) {
        // Validate ID and data
        if (!id || !data || Object.keys(data).length === 0) {
            throw new NotFoundException('Book ID and data must be provided.');
        }
        // Check if book exists before updating
        await this.findById(id); // ensure exists
        // Update book in repository
        const updatedBook = await this.bookRepo.update(id, data);
        // Update the cache with the new book data
        await this.redis.set(`book:${updatedBook.id}`, updatedBook);
        // Return the updated book
        return ApiResponse.success('Book updated successfully', updatedBook);

    }

    async delete(id: string) {
        // Validate ID
        if (!id) {
            throw new NotFoundException('Book ID must be provided.');
        }
        // Check if book exists before deleting
        await this.findById(id); // ensure exists
        // Delete book in repository
        await this.redis.del(`book:${id}`); // Remove from cache
        // Delete the book from the repository
        await this.bookRepo.delete(id);
        // Return success response
        return ApiResponse.success('Book deleted successfully');

    }

    async createComment(bookId: string, dto: CreateCommentDto) {
        if (!dto.userId || !dto.content) {
            throw new BadRequestException('User ID and content must be provided.');
        }

        const book = await this.bookRepo.findById(bookId);
        if (!book) {
            throw new NotFoundException('Book not found.');
        }

        const comment = await this.bookRepo.addComment(bookId, dto.userId, dto.content);

        // Invalidate cached comments for this book
        await this.redis.del(`book:${bookId}:comments`);

        return ApiResponse.success('Comment added successfully', comment);
    }

    async getComments(bookId: string, page = 1, limit = 10) {
        const book = await this.bookRepo.findById(bookId);
        if (!book) {
            throw new NotFoundException('Book not found.');
        }

        const cacheKey = `book:${bookId}:comments:${page}:${limit}`;
        const cachedComments = await this.redis.get(cacheKey);
        if (cachedComments) {
            return JSON.parse(cachedComments);
        }

        const { comments, total } = await this.bookRepo.getComments(bookId, page, limit);

        await this.redis.set(cacheKey, JSON.stringify({
            comments,
            total,
        }), 3600);

        return ApiResponse.paginated('Comments retrieved successfully', comments, {
            page,
            limit,
            total,
        });
    }
}
