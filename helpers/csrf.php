<?php

use Jatin\Csrf;
use Jatin\InvalidTokenException;

if (!function_exists('csrf')) {
    function csrf()
    {
        echo Csrf::csrf();
    }
}

if (!function_exists('enableCsrfProtection')) {
    function enableCsrfProtection()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')) {
            if (!isset($_POST[Csrf::CSRF_TOKEN_KEY]) || !Csrf::validateCsrfToken($_POST[Csrf::CSRF_TOKEN_KEY])) {
                $e = new InvalidTokenException;
                echo $e->html();
                exit;
            }
        }
    }
}
