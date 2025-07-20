import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.interface';
import { User } from '@prisma/client';
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
        const limitNumber = limit ? Number(limit) : 10;

        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
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

        if (!user || !(await this.hashingService.comparePassword(oldPassword, user.password))) {
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


    async followUser(followerId: string, followingId: string): Promise<void> {
        if (followerId === followingId) {
            throw new Error("You cannot follow yourself.");
        }

        const existingFollow = await this.prisma.follower.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            throw new Error("You already follow this user.");
        }

        await this.prisma.follower.create({
            data: {
                followerId,
                followingId,
            },
        });
    }

    async unfollowUser(followerId: string, followingId: string): Promise<void> {
        await this.prisma.follower.deleteMany({
            where: {
                followerId,
                followingId,
            },
        });
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const follow = await this.prisma.follower.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        return !!follow;
    }

    async getUserById(id: string): Promise<{ id: string } | null> {
        return await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
    }

    async getFollowers(userId: string, page = 1, limit = 10): Promise<User[]| null> {
        const skip = (page - 1) * limit;

        return await this.prisma.follower.findMany({
            where: { followingId: userId },
            skip,
            take: limit,
            select: {
                follower: {
                    select: { id: true, username: true, email: true },
                },
            },
        });
    }


    async getFollowing(userId: string, page = 1, limit = 10): Promise<User[] | null> {
        const skip = (page - 1) * limit;

        return await this.prisma.follower.findMany({
            where: { followerId: userId },
            skip,
            take: limit,
            select: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

}
