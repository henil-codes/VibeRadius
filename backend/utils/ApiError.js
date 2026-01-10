class APIError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [], // Fixed naming and default to empty array
      stack = "" // Optional custom stack trace
    ) {
      super(message); // Call the parent `Error` class constructor with the message
      this.statusCode = statusCode;
      this.errors = errors; // Store any additional errors
      this.success = false; // API errors are always unsuccessful
      if (stack) {
        this.stack = stack; // Optionally override the stack trace
      }else{
        Error.captureStackTrace(this,this.constructor)
      }
    }
  }

export { APIError };
