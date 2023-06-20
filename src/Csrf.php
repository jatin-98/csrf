<?php

namespace Jatin;

class Csrf
{
    public const CSRF_TOKEN_KEY = 'csrf_token';

    public static function csrf(string $fieldName = 'csrf_token'): string
    {
        $token = self::getCsrfToken();

        return "<input type='hidden' name='$fieldName' value='$token'>";
    }

    public static function validateCsrfToken(string $token): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (isset($_SESSION[self::CSRF_TOKEN_KEY]) && hash_equals($_SESSION[self::CSRF_TOKEN_KEY], $token)) {
            self::clearCsrfToken();
            return true;
        }

        return false;
    }

    private static function getCsrfToken(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION[self::CSRF_TOKEN_KEY])) {
            $_SESSION[self::CSRF_TOKEN_KEY] = bin2hex(random_bytes(32));
        }

        return $_SESSION[self::CSRF_TOKEN_KEY];
    }

    public static function clearCsrfToken(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        unset($_SESSION[self::CSRF_TOKEN_KEY]);
    }
}
