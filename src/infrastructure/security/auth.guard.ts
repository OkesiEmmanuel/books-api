import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private configService: ConfigService, // Ensure JWT secret is fetched correctly
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('Authorization header is missing or malformed');
            throw new UnauthorizedException('Authentication token is required');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.warn('Token is missing in the Authorization header');
            throw new UnauthorizedException('Invalid authentication token format');
        }

        try {
            const secret = this.configService.get<string>('JWT_SECRET'); // Ensure correct secret
            const payload = this.jwtService.verify(token, { secret });

            console.log('Decoded JWT Payload:', payload);


            request.user = payload;

            return true;

        } catch (error) {
            console.error('Error verifying token:', error.message);

            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Authentication token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid authentication token');
            }

            throw new UnauthorizedException('Authentication failed');
        }
    }
}
