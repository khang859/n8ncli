export class N8nApiError extends Error {
  public readonly statusCode: number;
  public readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'N8nApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class N8nAuthenticationError extends N8nApiError {
  constructor(message: string = 'Authentication failed. Check your API key.') {
    super(message, 401);
    this.name = 'N8nAuthenticationError';
  }
}

export class N8nConnectionError extends Error {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'N8nConnectionError';
    this.cause = cause;
  }
}
