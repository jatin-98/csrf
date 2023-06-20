<?php

namespace Jatin;

class InvalidTokenException extends \Exception
{
    public function __construct($message = "Invalid CSRF token", $code = 419, \Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }

    public function html(): string
    {
        return '<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>419 Page Expired</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f8f8;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    text-align: center;
                }
                h1 {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 18px;
                    margin-bottom: 20px;
                }
                a {
                    color: #333;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>419 | Page Expired</h1>                
            </div>
        </body>
        </html>';
    }
}
