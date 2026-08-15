import { Request, Response, NextFunction } from 'express';
import { Csrf } from './Csrf';
import { InvalidTokenError } from './InvalidTokenError';

export interface CsrfOptions {
    /** The session key to store the token in. Default is 'csrf_token' */
    sessionKey?: string;
    /** The request body key to check for the token. Default is 'csrf_token' */
    bodyKey?: string;
    /** The request header key to check for the token. Default is 'x-csrf-token' */
    headerKey?: string;
    /** The error handler function to use when validation fails. */
    errorHandler?: (err: InvalidTokenError, req: Request, res: Response, next: NextFunction) => void;
}

const defaultErrorHandler = (err: InvalidTokenError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>419 Page Expired</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f8f8f8; color: #333; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                h1 { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>419 | Page Expired</h1>                
            </div>
        </body>
        </html>
    `);
};

export const csrfProtection = (options: CsrfOptions = {}) => {
    const sessionKey = options.sessionKey || Csrf.CSRF_TOKEN_KEY;
    const bodyKey = options.bodyKey || Csrf.CSRF_TOKEN_KEY;
    const headerKey = options.headerKey || 'x-csrf-token';
    const errorHandler = options.errorHandler || defaultErrorHandler;

    return (req: Request, res: Response, next: NextFunction) => {
        if (!(req as any).session) {
            return next(new Error('csrfProtection requires express-session'));
        }

        const session = (req as any).session;

        // Ensure token exists in session
        if (!session[sessionKey]) {
            session[sessionKey] = Csrf.generateToken();
        }

        // Attach token to res.locals for easy access in views
        res.locals.csrfToken = session[sessionKey];
        // Helper function for templates
        res.locals.csrf = (fieldName = bodyKey) => Csrf.generateHtml(session[sessionKey], fieldName);

        // Check if request requires validation (e.g., POST, PUT, DELETE, PATCH)
        const method = req.method.toUpperCase();
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return next();
        }

        // Validate token
        const providedToken = (req.body && req.body[bodyKey]) 
            || req.headers[headerKey.toLowerCase()] 
            || (req.query && req.query[bodyKey]);

        if (!Csrf.validateToken(session[sessionKey], providedToken as string)) {
            return errorHandler(new InvalidTokenError(), req, res, next);
        }

        next();
    };
};
