import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class HashingService {
    private readonly saltRounds = 10;

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async comparePin(pin: string, hash: string): Promise<boolean> {
        return bcrypt.compare(pin, hash);
    }
}