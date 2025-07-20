import { Book } from '@prisma/client';

export interface IBookRepository {
    findAll(page: number, limit: number): Promise<{ books: Book[]; total: number }>;
    findById(id: string): Promise<Book | null>;
    create(data: Partial<Book>): Promise<Book>;
    update(id: string, data: Partial<Book>): Promise<Book>;
    delete(id: string): Promise<void>;
}
