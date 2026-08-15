# CSRF Token

A robust, framework-agnostic CSRF (Cross-Site Request Forgery) protection middleware for Express.js applications. 

## Features
- 🔒 Secure token generation using Node's native `crypto` module (timing-safe comparisons).
- 🧩 Seamless integration with `express-session`.
- 🛠️ Built-in helper functions for injecting tokens into HTML templates (EJS, Pug, etc.).
- 🛡️ Automatically protects unsafe HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`).
- 🎨 Default 419 error page with the ability to override with a custom error handler.
- 📦 Fully typed with TypeScript.

---

## Installation

This package is designed to be used locally and is not published to the public NPM registry.

First, ensure you have `express-session` installed in your host project, as this package relies on it:

```bash
npm install express-session
```

Then, install this package via a local file path relative to your host project:

```bash
# Assuming your host project is next to the `csrf` directory
npm install ../csrf
```

---

## Quick Start

Here is a complete example of how to use the CSRF middleware in an Express application.

### 1. Setup Middleware

The `csrfProtection` middleware must be placed **after** `express-session` and any body parsers.

```typescript
import express from 'express';
import session from 'express-session';
import { csrfProtection } from 'csrf';

const app = express();

// 1. Parse request bodies (needed for CSRF to read the token from forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Initialize sessions
app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: true
}));

// 3. Apply CSRF Protection to all routes below this line
app.use(csrfProtection());

// ... routes
```

### 2. Rendering Forms (GET requests)

Safe methods like `GET`, `HEAD`, and `OPTIONS` are ignored by the CSRF validator. However, the middleware injects a `csrf()` helper into `res.locals`, which you can use in your template engines (like EJS) to generate the hidden input field.

```typescript
app.get('/form', (req, res) => {
    // res.locals.csrf() is automatically available
    res.send(`
        <form method="POST" action="/submit">
            ${res.locals.csrf()} <!-- Injects: <input type="hidden" name="csrf_token" value="..."> -->
            <input type="text" name="username" />
            <button type="submit">Submit</button>
        </form>
    `);
});
```

### 3. Handling Submissions (POST requests)

When a `POST` request is received, the middleware automatically validates the token. If it matches, the request proceeds. If it fails, a 419 error is returned.

```typescript
app.post('/submit', (req, res) => {
    // If the code reaches here, the CSRF token was valid!
    res.send('Form submitted successfully: ' + req.body.username);
});
```

---

## Configuration Options

You can customize the middleware by passing an options object to `csrfProtection()`.

```typescript
app.use(csrfProtection({
    sessionKey: 'csrf_token', // The key used to store the token in req.session
    bodyKey: 'csrf_token',    // The key expected in req.body or req.query
    headerKey: 'x-csrf-token', // The HTTP header checked for AJAX requests
    errorHandler: customErrorHandler // Custom function for validation failures
}));
```

### Custom Error Handling

By default, an invalid token will render a simple HTML page with a `419 Page Expired` message. You can override this by providing a custom `errorHandler`:

```typescript
import { InvalidTokenError } from 'csrf';

app.use(csrfProtection({
    errorHandler: (err, req, res, next) => {
        // err is an instance of InvalidTokenError
        res.status(err.status).json({
            success: false,
            message: 'Invalid CSRF token. Please refresh the page and try again.'
        });
    }
}));
```

---

## AJAX / Fetch API Usage

If you are building a Single Page Application (SPA) or making AJAX requests, you can pass the token via HTTP headers instead of a form body.

The token is available on the server at `res.locals.csrfToken` or `req.session.csrf_token`. You can expose this to your frontend (e.g., via a meta tag) and include it in your fetch requests:

```javascript
// On the frontend
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

fetch('/api/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken // Must match the headerKey option
    },
    body: JSON.stringify({ data: 'hello' })
});
```

---

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on GitHub.
