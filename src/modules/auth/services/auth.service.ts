/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
    BadRequestException,
    HttpException,
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from '../repositories';
import HashingService from '../../../utils/hashing.service';
import {
    CreateUserDto,
    JwtSignInDTO,
    UpdateUserDto
} from '../dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisFacade } from 'src/infrastructure/redis.service';
import { access } from 'fs';
import { ApiResponse } from 'src/utils';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly hashingService: HashingService,
        private readonly redisService: RedisFacade,
        private readonly jwtService: JwtService,

    ) { }

    async createUser(userData: CreateUserDto): Promise<any> {
        console.log('Received user data:', userData);

        const { email, phoneNumber, username, password, } = userData;

        // Check if user already exists
        const existingEmail = await this.authRepository.findUserByEmail(email);
        if (existingEmail) {
            throw new BadRequestException('User with this email already exists.');
        }

        const existingPhoneNumber =
            await this.authRepository.findUserByPhoneNumber(phoneNumber);
        if (existingPhoneNumber) {
            throw new BadRequestException(
                'User with this phone number already exists.',
            );
        }

        const existingUsername =
            await this.authRepository.findByEmailOrUsername(username);
        if (existingUsername) {
            throw new BadRequestException('User with this username already exists.');
        }

        // Hash the password
        const hashedPassword = await this.hashingService.hashPassword(password);

        // Create new user
        const newUser = await this.authRepository.createUser({
            ...userData,
            // Ensure password is hashed before saving
            password: hashedPassword,
        });

        console.log('User successfully created:', newUser);

        // Sign Token
        const accessToken = this.jwtService.sign(
            { id: newUser.id },
            {
                secret: process.env.JWT_SECRET,
                expiresIn: '1w',
            },
        );

        // Cache token in Redis for later validation
        const cacheToken = await this.redisService.set(
            `user-id:${newUser.id}`,
            newUser,
            3600,
        );


        // Emit event to send the verification email
        // pubSub.emit(
        //     AuthEvents.EMAIL_LINK_GENERATE,
        //     newUser.email,
        //     newUser.username,
        //     verificationLink,
        // );


        return ApiResponse.success('User created successfully',{ newUser, accessToken });
    }


    async decodeAccessToken(token: string): Promise<{ userId: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });

            return { userId: payload.sub };
        } catch (err) {
            throw new UnauthorizedException('Token verification failed');
        }
    }

    async login(payload: JwtSignInDTO) {
        if (!payload.email && !payload.username && !payload.phoneNumber) {
            throw new HttpException('Email or phone number must be provided', 400);
        }

        const whereCondition = payload.email
            ? { email: payload.email }
            : { username: payload.username };
        const foundUser = await this.authRepository.findUser(whereCondition);

        if (!foundUser) throw new HttpException('User not found', 404);

        const passwordIsValid = await this.hashingService.comparePassword(
            payload.password,
            foundUser.password,
        );
        if (!passwordIsValid) throw new HttpException('Invalid Password', 400);

        const loginData = {
            id: foundUser.id,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            email: foundUser.email,
            username: foundUser.username,
            phoneNumber: foundUser.phoneNumber,
        };

        const accessToken = this.jwtService.sign(loginData);
        console.log(`payload ${accessToken}`);

        // Cache the JWT in Redis for later validation
        await this.redisService.set(`JWT:${foundUser.id}`, accessToken, 1800); // Cache JWT in Redis

        return ApiResponse.success('Login successful', { accessToken, user: loginData });
    }

}