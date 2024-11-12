class ConnectionError extends Error {
    constructor() {
        super("Could not connect to the server.");
        this.name = "ConnectionError"
    }
}

class HttpError extends Error {
    constructor(message, statusCode) {
        super(message); 
        this.name = "HttpError"; 
        this.statusCode = statusCode;
    }
}

class AuthenticationError extends HttpError {
    constructor() {
        super("Authentication failed.", 401);
        this.name = "AuthenticationError";
    }
}

class LoginExpiredError extends HttpError {
    constructor() {
        super("Your credentials have expired. Please log in again.", 401);
        this.name = "LoginExpiredError";
    }
}

class RateLimitingError extends HttpError {
    constructor() {
        super("You are sending too many requests. Try slowing down.", 429);
        this.name = "RateLimitingError";
    }
}

class ResourceNotFoundError extends HttpError {
    constructor() {
        super("The requested resource was not found.", 404);
        this.name = "ResourceNotFoundError";
    }
}

class AppError extends Error {
    constructor(message) {
        super(message);
        this.name = "AppError";
    }
}

class LoginRequiredError extends AppError {
    constructor() {
        super("You must log in to continue.");
        this.name = "LoginRequiredError";
    }
}

class AlreadyLoggedInError extends AppError {
    constructor() {
        super("You are already logged in. To continue, you must sign out first.");
        this.name = "AlreadyLoggedInError";
    }
}

export {ConnectionError, HttpError, AuthenticationError, LoginExpiredError, RateLimitingError, ResourceNotFoundError, LoginRequiredError, AlreadyLoggedInError }