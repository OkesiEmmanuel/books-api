import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User, } from '@prisma/client';
import { UpdateUserDto } from 'src/modules/auth/dto';
import { HashingService } from 'src/utils';
import { AuthRepository } from 'src/modules/auth/repositories';
import { RedisFacade } from 'src/infrastructure/redis.service';
import { ApiResponse } from 'src/utils';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashingService: HashingService,
        private readonly authRepo: AuthRepository,
        private readonly redis: RedisFacade,
    ) { }

    async getAllUsers(page?: number, limit?: number): Promise<ApiResponse> {
        if (page && isNaN(page)) {
            throw new BadRequestException('Page must be a valid number');
        }
        if (limit && isNaN(limit)) {
            throw new BadRequestException('Limit must be a valid number');
        }
        if (page && page < 1) {
            throw new BadRequestException('Page must be a positive number');
        }
        if (limit && limit < 1) {
            throw new BadRequestException('Limit must be a positive number');
        }
        // Fetch all users from cache first
        const cachedUsers = await this.redis.get(`users:${page}:${limit}`);
        if (cachedUsers) {
            return JSON.parse(cachedUsers);
        }
        // If not found in cache, fetch from database
        const users = await this.userRepository.getAllUsers(page, limit);
        if (!users) {
            throw new NotFoundException('No users found');
        }
        // Store the fetched users in cache
        await this.redis.set(`users:${page}:${limit}`, JSON.stringify(users), 3600); // Cache for 1 hour
        return ApiResponse.paginated('Users fetched successfully', users, {
            page: page ?? 1, limit: limit ?? 10, total: users.length
        });
    }

    async getUserProfile(userId: string): Promise<User | null> {
        const foundUser = await this.userRepository.getUserProfile(userId);
        if (!foundUser) throw new NotFoundException('User not found');
        return ApiResponse.success('User profile fetched successfully', foundUser);
    }

    async updateUserProfile(
        userId: string,
        data: User,
    ): Promise<User> {
        //check if user data is available in redis
        const cachedUser = await this.redis.get(`user:${userId}`);
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            // Update the user data in cache
            Object.assign(user, data);
            await this.redis.set(`user:${userId}`, JSON.stringify(user), 3600);
            return user;
        }
        // If not found in cache, update in database
        const user = await this.userRepository.getUserProfile(userId);
        if (!user) throw new NotFoundException('User not found');
        // Update user profile in the database
        if (!data.email && !data.phoneNumber && !data.username) {
            throw new BadRequestException('At least one field must be provided for update');
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new BadRequestException('Invalid email format');
        }
        if (data.phoneNumber && !/^\+?[1-9]\d{12,14}$/.test(data.phoneNumber)) {
            throw new BadRequestException('Invalid phone number format');
        }
        if (data.username && data.username.length < 3) {
            throw new BadRequestException('Username must be at least 3 characters long');
        }
        const updatedUser = await this.userRepository.updateUserProfile(userId, data);
        if (!updatedUser) {
            throw new ConflictException('Failed to update user profile');
        }
        // Update the user data in cache
        await this.redis.set(`user:${userId}`, JSON.stringify(updatedUser), 3600); // Cache for 1 hour
        return ApiResponse.success('User profile updated successfully', updatedUser);
    }

    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string,
    ): Promise<User | null> {
        //check if user data is available in redis
        const cachedUser = await this.redis.get(`user:${userId}`);
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            // Check if old password matches
            const isMatch = await this.hashingService.comparePassword(
                oldPassword,
                user.password,
            );
            if (!isMatch) {
                throw new BadRequestException('Incorrect old password');
            }

            // Hash the new password
            const hashedPassword = await this.hashingService.hashPassword(newPassword);
            // Update the password in cache
            user.password = hashedPassword;
            await this.redis.set(`user:${userId}`, JSON.stringify(user), 3600);

        }
        // If not found in cache, update in database
        const user = await this.userRepository.changePassword(userId, oldPassword, newPassword);
        if (!user) {
            throw new NotFoundException('User not found or password change failed');
        }
        // Update the user data in cache
        await this.redis.set(`user:${userId}`, JSON.stringify(user), 3600);
        return ApiResponse.success('Password changed successfully', user);
    }

    async resetPassword(
        email: string,
        newPassword: string,
    ): Promise<{ message: string }> {
        // Fetch user by email
        const user = await this.authRepo.findUserByEmail(email);
        if (!user) throw new NotFoundException('User not found');

        // Hash the new password
        const hashedPassword = await this.hashingService.hashPassword(newPassword);

        // Update user password
        await this.userRepository.updatePassword(user.id, hashedPassword);

        return { message: 'Password reset successful' };
    }

    async save(user: User): Promise<User> {
        return this.authRepo.save(user);
    }

    async deleteUser(userId: string): Promise<void> {
        //check if user data is available in redis
        let cachedUser = await this.redis.get(`user:${userId}`);
        if (cachedUser) {
            cachedUser = JSON.parse(cachedUser);
            // Delete user data from cache
            await this.redis.del(`user:${userId}`);
        }
        // If not found in cache, delete from database
        if (!cachedUser) {
            const user = await this.userRepository.getUserProfile(userId);
            if (!user) throw new NotFoundException('User not found');
        }
        // Delete user from the database
        await this.userRepository.deleteUser(userId);
        return;
    }
}