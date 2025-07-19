import { Controller, Get, Post, Put, Delete, Body, Param, Query, InternalServerErrorException, NotFoundException, BadRequestException, UploadedFiles, UseInterceptors, UseGuards } from '@nestjs/common';
import { Express } from 'express';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from 'src/modules/auth/dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { ChangePasswordDto, ResetPasswordDto,  } from '../dto/user.dto';
import { AuthGuard } from 'src/infrastructure/security/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard,)

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: 200,
        description: 'List of users returned successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })

    async getAllUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ): Promise<User> {
        return this.userService.getAllUsers(
            page ? Number(page) : undefined,
            limit ? Number(limit) : undefined,
        );
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, )

    @ApiOperation({ summary: 'Get user profile by ID' })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
    })
    async getUserProfile(@Param('id') userId: string) {
        return await this.userService.getUserProfile(userId);
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard,)

    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({
        status: 200,
        description: 'User profile updated successfully',
    })
    async updateUserProfile(@Param('id') userId: string, @Body() data: User) {
        return await this.userService.updateUserProfile(userId, data);
    }

    @Put(':id/change-password')
    @UseGuards(AuthGuard, )

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiBody({ type: ChangePasswordDto })
    async changePassword(
        @Param('id') userId: string,
        @Body() body: ChangePasswordDto,
    ) {
        return await this.userService.changePassword(
            userId,
            body.oldPassword,
            body.newPassword,
        );
    }


    @Put(':id/reset-password')
    @ApiOperation({ summary: 'Reset user password' })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiBody({ type: ResetPasswordDto })
    async resetPassword(
        @Param('id') userId: string,
        @Body() body: ResetPasswordDto,
    ) {
        return await this.userService.resetPassword(userId, body.password);
    }


    @Delete(':id')
    @UseGuards(AuthGuard,)

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete user account' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    async deleteUser(@Param('id') userId: string) {
        return await this.userService.deleteUser(userId);
    }
}