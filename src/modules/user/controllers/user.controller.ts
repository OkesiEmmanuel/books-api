import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse as ApiDocResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import { UpdateUserDto } from 'src/modules/auth/dto/auth.dto';
import { User } from '@prisma/client';
import { ChangePasswordDto, ResetPasswordDto } from '../dto/user.dto';
import { AuthGuard } from 'src/infrastructure/security/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get all users' })
    @ApiDocResponse({ status: 200, description: 'List of users returned successfully' })
    @ApiDocResponse({ status: 401, description: 'Unauthorized' })
    async getAllUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.userService.getAllUsers(
            page ? Number(page) : undefined,
            limit ? Number(limit) : undefined,
        );
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get user profile by ID' })
    @ApiDocResponse({ status: 200, description: 'User profile retrieved successfully' })
    async getUserProfile(@Param('id') userId: string) {
        return await this.userService.getUserProfile(userId);
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update user profile' })
    @ApiDocResponse({ status: 200, description: 'User profile updated successfully' })
    async updateUserProfile(@Param('id') userId: string, @Body() data: User) {
        return await this.userService.updateUserProfile(userId, data);
    }

    @Put(':id/change-password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Change user password' })
    @ApiDocResponse({ status: 200, description: 'Password changed successfully' })
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
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Reset user password' })
    @ApiDocResponse({ status: 200, description: 'Password reset successfully' })
    @ApiBody({ type: ResetPasswordDto })
    async resetPassword(
        @Param('id') userId: string,
        @Body() body: ResetPasswordDto,
    ) {
        return await this.userService.resetPassword(userId, body.password);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete user account' })
    @ApiDocResponse({ status: 200, description: 'User deleted successfully' })
    async deleteUser(@Param('id') userId: string) {
        return await this.userService.deleteUser(userId);
    }


    @Post(':id/follow')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Follow a user' })
    @ApiDocResponse({ status: 200, description: 'User followed successfully' })
    async followUser(
        @Param('id') followingId: string,
        @Query('followerId') followerId: string,
    ) {
        return await this.userService.followUser(followerId, followingId);
    }


    @Delete(':id/follow')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Unfollow a user' })
    @ApiDocResponse({ status: 200, description: 'User unfollowed successfully' })
    async unfollowUser(
        @Param('id') followingId: string,
        @Query('followerId') followerId: string,
    ) {
        return await this.userService.unfollowUser(followerId, followingId);
    }

    @Get(':id/followers')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get followers of a user' })
    @ApiDocResponse({ status: 200, description: 'List of followers retrieved successfully' })
    async getFollowers(
        @Param('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return await this.userService.getFollowers(
            userId,
            page ? Number(page) : 1,
            limit ? Number(limit) : 10,
        );
    }


    @Get(':id/following')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get users that a user is following' })
    @ApiDocResponse({ status: 200, description: 'List of following retrieved successfully' })
    async getFollowing(
        @Param('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return await this.userService.getFollowing(
            userId,
            page ? Number(page) : 1,
            limit ? Number(limit) : 10,
        );
    }
}
