import { User } from "@prisma/client";
import { UpdateUserDto } from "src/modules/auth/dto";

export interface IUserRepository {
    getAllUsers(page: number, limit: number): Promise<User[] | null>;
    getUserProfile(userId: string): Promise<User | null>;
    updateUserProfile(userId: string, data: UpdateUserDto): Promise<User | null>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<User | null>;
    resetPassword(userId: string, password: string): Promise<User | null>;
    deleteUser(userId: string): Promise<void>;
}