import { Injectable, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10,
            message: 'Too many requests, please try again later.',
        })(req, res, next);
    }
}