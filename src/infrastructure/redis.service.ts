import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisFacade implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;
    private retryCount = 0; // Counter for retry attempts
    private maxRetries = 4; // Maximum number of retries

    async onModuleInit() {
        await this.connect();
    }

    async connect() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://3.88.182.63:6379',
            socket: {
                reconnectStrategy: (retries: any, cause: any) => {
                    this.retryCount = retries;

                    // If retries exceed maxRetries, stop reconnecting
                    if (this.retryCount >= this.maxRetries) {
                        console.warn(`❌ Max retries reached. Unable to connect to Redis.`);
                        return false; // Return false to stop retries
                    }
                    console.log(
                        `Attempting reconnect ${retries} due to: ${cause.message}`,
                    );
                    return Math.min(retries * 100, 3000); // Retry strategy
                },
            },
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err.message);
            if (err.message.includes('READONLY')) {
                console.warn(
                    '⚠️ Redis is in read-only mode. Ensure you are connected to the master.',
                );
            }
        });

        this.client.on('connect', () => {
            console.log('Redis connected successfully');
        });

        try {
            await this.client.connect();
        } catch (error) {
            console.error(`❌ Redis connection failed: ${error.message}`);
            // If connection failed and max retries are reached, continue server start
            if (this.retryCount < this.maxRetries) {
                console.log('Retrying to connect...');
            }
        }
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        try {
            if (!this.client) await this.connect();
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, value);
            } else {
                await this.client.set(key, value);
            }
        } catch (err) {
            console.error(`❌ Redis SET error: ${err.message}`);
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            if (!this.client) await this.connect();
            return await this.client.get(key);
        } catch (err) {
            console.error(`❌ Redis GET error: ${err.message}`);
            return null;
        }
    }

    async del(key: string) {
        try {
            if (!this.client) await this.connect();
            await this.client.del(key);
        } catch (err) {
            console.error(`❌ Redis DEL error: ${err.message}`);
        }
    }

    async multi() {
        if (!this.client) await this.connect();
        return this.client.multi();
    }

    async onModuleDestroy() {
        if (this.client) {
            console.log('🔌 Closing Redis connection...');
            await this.client.quit();
        }
    }
}
