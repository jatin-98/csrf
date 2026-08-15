import { Request, Response, NextFunction } from 'express';
import { Csrf, csrfProtection, InvalidTokenError } from '../src';

describe('Csrf', () => {
    it('should generate a token of length 64 (32 bytes hex)', () => {
        const token = Csrf.generateToken();
        expect(token.length).toBe(64);
    });

    it('should validate matching tokens', () => {
        const token = Csrf.generateToken();
        expect(Csrf.validateToken(token, token)).toBe(true);
    });

    it('should reject non-matching tokens', () => {
        const token1 = Csrf.generateToken();
        const token2 = Csrf.generateToken();
        expect(Csrf.validateToken(token1, token2)).toBe(false);
    });

    it('should generate html input', () => {
        const token = 'my-token';
        const html = Csrf.generateHtml(token, 'csrf_token');
        expect(html).toBe('<input type="hidden" name="csrf_token" value="my-token">');
    });
});

describe('csrfProtection Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            method: 'GET',
            session: {} as any,
            body: {},
            headers: {},
            query: {}
        };
        res = {
            locals: {},
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    it('should error if no session exists', () => {
        req.session = undefined;
        const middleware = csrfProtection();
        middleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('csrfProtection requires express-session');
    });

    it('should attach a token to the session and res.locals', () => {
        const middleware = csrfProtection();
        middleware(req as Request, res as Response, next);
        
        expect((req.session as any).csrf_token).toBeDefined();
        expect(res.locals?.csrfToken).toBeDefined();
        expect(typeof res.locals?.csrf).toBe('function');
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should skip validation for GET requests', () => {
        const middleware = csrfProtection();
        middleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should validate POST request with token in body', () => {
        const middleware = csrfProtection();
        
        // First request to set token
        middleware(req as Request, res as Response, next);
        const token = (req.session as any).csrf_token;
        expect(token).toBeDefined();
        
        next.mockClear();

        // Second request (POST) with token
        req.method = 'POST';
        req.body = { csrf_token: token };
        
        middleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should reject POST request with invalid token', () => {
        const middleware = csrfProtection();
        
        // First request to set token
        middleware(req as Request, res as Response, next);
        
        next.mockClear();

        // Second request (POST) with invalid token
        req.method = 'POST';
        req.body = { csrf_token: 'invalid' };
        
        middleware(req as Request, res as Response, next);
        
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(419);
        expect(res.send).toHaveBeenCalled();
    });
});
