import crypto from 'crypto';

export class Csrf {
    public static readonly CSRF_TOKEN_KEY = 'csrf_token';

    /**
     * Generates an HTML hidden input field with the CSRF token.
     * @param token The CSRF token.
     * @param fieldName The name of the input field. Default is 'csrf_token'.
     */
    public static generateHtml(token: string, fieldName: string = Csrf.CSRF_TOKEN_KEY): string {
        return `<input type="hidden" name="${fieldName}" value="${token}">`;
    }

    /**
     * Validates a given token against the session token.
     */
    public static validateToken(sessionToken: string | undefined, providedToken: string | undefined): boolean {
        if (!sessionToken || !providedToken) {
            return false;
        }

        if (sessionToken.length !== providedToken.length) {
            return false;
        }

        return crypto.timingSafeEqual(Buffer.from(sessionToken), Buffer.from(providedToken));
    }

    /**
     * Generates a new random CSRF token.
     */
    public static generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}
