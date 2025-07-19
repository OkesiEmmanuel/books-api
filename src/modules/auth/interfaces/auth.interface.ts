
import { CreateUserDto, JwtSignInDTO, UpdateUserDto } from '../dto';
import { User } from '@prisma/client';
export interface IAuthRepository {
    createUser(data: CreateUserDto): Promise<User>;
    signIn(data: JwtSignInDTO): Promise<Partial<User | null>>;
    findUserById(id: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findByEmailOrUsername(identifier: string): Promise<User | null>;
}