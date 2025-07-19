import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { User } from '@prisma/client';
import {
    CreateUserDto,
    JwtSignInDTO,
    UpdateUserDto,
} from '../dto';

import { IAuthRepository } from '../interfaces';
import { HashingService } from 'src/utils';

@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly hashingService: HashingService,
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const {
            username,
            firstName,
            lastName,
            email,
            phoneNumber,
            password,

        } = createUserDto;

        // Check if user with the same email or phone number exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { phoneNumber }, { username }],
            },
        });

        if (existingUser) {
            throw new BadRequestException(
                `User with this email or username or phone number already exists`,
            );
        }

        return await this.prisma.user.create({
            data: {
                username,
                firstName,
                lastName,
                email,
                phoneNumber,
                password,

            },
        });
    }

    async updateUser(
        email: string,
        updateData: UpdateUserDto,
    ): Promise<User | null> {
        return this.prisma.user.update({
            where: { email },
            data: updateData,
        });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email },
        });
    }

    async findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { phoneNumber },
        });
    }

    async findByEmailOrUsername(identifier: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { email: identifier }],
            },
        });
    }


    async signIn(jwtSignInDto: JwtSignInDTO): Promise<Partial<User>> {
        const { email, phoneNumber, password, username } = jwtSignInDto;

        if (!email && !phoneNumber) {
            throw new BadRequestException('Email or phone number must be provided');
        }

        const whereCondition = email ? { email } : { phoneNumber };

        const foundUser = await this.prisma.user.findFirst({
            where: whereCondition,
            select: {
                id: true,
                email: true,
                username: true,
                phoneNumber: true,
                password: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!foundUser) {
            throw new BadRequestException('User not found');
        }

        const passwordIsValid = await this.hashingService.comparePassword(
            password,
            foundUser.password,
        );
        if (!passwordIsValid) {
            throw new BadRequestException('Invalid credentials');
        }

        const { password: _, ...safeUser } = foundUser; // Exclude password from returned user
        return safeUser;
    }

    async findUser(whereCondition: any): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: whereCondition,
        });
    }
    async findUserById(id: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id },
        });
    }

    async save(user: Partial<User>): Promise<User> {
        return this.prisma.user.update({
            where: { id: user.id },
            data: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                password: user.password,
            },
        });
    }

}