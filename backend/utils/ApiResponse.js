class APIResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.data = data; // The response payload
    this.message = message; // The response message
    this.success = statusCode < 400; // `success` is true for status codes below 400
  }
}

export { APIResponse };
