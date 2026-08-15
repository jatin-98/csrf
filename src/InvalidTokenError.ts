export class InvalidTokenError extends Error {
    public status: number;

    constructor(message: string = 'Invalid CSRF token') {
        super(message);
        this.name = 'InvalidTokenError';
        this.status = 419;
        
        // Fix prototype chain when extending built-ins in TypeScript
        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
}
