export class ApiResponse {
    static success<T>(message: string, data?: T) {
        return {
            status: 'success',
            message,
            data: data ?? null,
        };
    }

    static error(message: string, error?: any) {
        return {
            status: 'error',
            message,
            error: error ?? null,
        };
    }

    static paginated<T>(message: string, data: T[], meta: { page: number; limit: number; total: number }) {
        return {
            status: 'success',
            message,
            data,
            meta,
        };
    }
}
