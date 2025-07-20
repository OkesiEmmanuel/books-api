import { Injectable } from '@nestjs/common';

import { IBookRepository } from '../interfaces/book.interface';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class BookRepository implements IBookRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(page: number, limit: number): Promise<{ books: Book[]; total: number }> {
        const books = await this.prisma.book.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });
        const total = await this.prisma.book.count();
        return { books, total };
    }

    async findById(id: string): Promise<Book | null> {
        return this.prisma.book.findUnique({ where: { id } });
    }

    async create(data: Partial<Book>): Promise<Book> {
        return this.prisma.book.create({ data });
    }

    async update(id: string, data: Partial<Book>): Promise<Book> {
        return this.prisma.book.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.book.delete({ where: { id } });
    }
}
