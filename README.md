# CSRF Token 

A CSRF token package for secure form submissions.

## Usage

To generate a CSRF token in your form, you can use the csrf() function provided by the package. For example:

```html
<form method="POST">
    <?= csrf(); ?>
    <!-- Rest of the form fields -->
    <button type="submit">Submit</button>
</form>
```


To enable CSRF protection on your server-side code, you can use the enableCsrfProtection() function. 
This function should be called before processing any POST request or AJAX request that requires CSRF protection. For example:

```bash
enableCsrfProtection();
```

If an invalid CSRF token is detected, an InvalidTokenException will be thrown. You can catch this exception and handle it accordingly.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on GitHub.
