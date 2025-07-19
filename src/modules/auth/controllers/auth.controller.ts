import {
    Controller, Post, Body, Param, Query, BadRequestException, HttpException, NotFoundException,
    HttpStatus,
    InternalServerErrorException,
    UseGuards,
    Get,
    Res
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { JwtSignInDTO,  UpdateUserDto,  CreateUserDto,} from '../dto';
// import { AuthGuard } from '@nestjs/passport';
import { AuthGuard } from 'src/infrastructure/security/auth.guard';


@ApiTags('Authentication') // Group in Swagger UI
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiBody({
        type: CreateUserDto,
        required: true,
    })
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({
        status: 400,
        description: 'User already exists or invalid data',
    })
    async register(@Body() userData: CreateUserDto) {
        return await this.authService.createUser(userData);
    }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 400, description: 'Invalid credentials' })
    async login(
        @Body() payload: JwtSignInDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const response = await this.authService.login(payload);

        if (!response?.data?.user?.id || !response?.data?.accessToken) {
            throw new BadRequestException('Login failed: No user ID returned');
        }

        // // ✅ Set userId cookie
        // res.cookie('userId', response?.id, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'none',
        //     domain: '.domain.com', 
        //     path: '/',
        //     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        // });

        return {
            message: 'Login successful',
            statusCode: 200,
            data: response.data,
            token: response.data.accessToken,
        }
    }

}