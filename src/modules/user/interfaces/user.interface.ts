import { User } from "@prisma/client";
import { UpdateUserDto } from "src/modules/auth/dto";

export interface IUserRepository {
    // User management
    getAllUsers(page: number, limit: number): Promise<User[] | null>;
    getUserProfile(userId: string): Promise<User | null>;
    updateUserProfile(userId: string, data: UpdateUserDto): Promise<User | null>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<User | null>;
    resetPassword(userId: string, password: string): Promise<User | null>;
    deleteUser(userId: string): Promise<void>;

    // Follow system
    followUser(followerId: string, followingId: string): Promise<void>;
    unfollowUser(followerId: string, followingId: string): Promise<void>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getUserById(id: string): Promise<{ id: string } | null>;
    getFollowers(userId: string): Promise<User[] | null>;
    getFollowing(userId: string): Promise<User[] | null>;
}
