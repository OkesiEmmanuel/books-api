import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.interface';
import { User, } from '@prisma/client';

import { UpdateUserDto } from 'src/modules/auth/dto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { HashingService } from 'src/utils';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly hashingService: HashingService,

    ) { }


    async getAllUsers(page?: number, limit?: number): Promise<User[] | null> {
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 10; // Default limit to 10 records

        if (
            isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1
        ) {
            throw new Error('Page and limit must be valid positive numbers.');
        }

        return await this.prisma.user.findMany({
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
        });
    }

    async getUserProfile(userId: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id: userId },
        });
    }

    async updatePassword(userId: string, hashedPassword: string) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string,
    ): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (
            !user ||
            !(await this.hashingService.comparePassword(oldPassword, user.password))
        ) {
            return null;
        }

        const hashedPassword = await this.hashingService.hashPassword(newPassword);
        return await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    async resetPassword(userId: string, password: string): Promise<User | null> {
        const hashedPassword = await this.hashingService.hashPassword(password);
        return await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    async updateUserProfile(userId: string, data: UpdateUserDto): Promise<User | null> {
        return await this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async deleteUser(userId: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id: userId },
        });
    }
}