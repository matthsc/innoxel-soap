/** custom error object for network errors */
export class NetworkError extends Error {
  constructor(public readonly parent: Error) {
    super(parent.message); // 'Error' breaks prototype chain here for ES5/CommonJS builds
    this.name = "NetworkError";
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

/** custom error object for api errors */
export class EndpointError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message); // 'Error' breaks prototype chain here for ES5/CommonJS builds
    this.name = "EndpointError";
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

/** custom error object for fault responses */
export class FaultResponseError extends Error {
  constructor(public readonly fault: unknown) {
    super("Innoxel Master Fault response"); // 'Error' breaks prototype chain here for ES5/CommonJS builds
    this.name = "FaultResponseError";
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

/* custom error object for response tag mismatches */
export class ResponseTagError extends Error {
  constructor(
    public readonly action: string,
    public readonly response: unknown,
  ) {
    super("Invalid response tag"); // 'Error' breaks prototype chain here for ES5/CommonJS builds
    this.name = "ResponseTagError";
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
