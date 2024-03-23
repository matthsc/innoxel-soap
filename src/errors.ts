/** custom error object for network errors */
export class NetworkError extends Error {
  constructor(parent: Error) {
    super(parent.message);
  }
}

/** custom error object for api errors */
export class EndpointError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

/** custom error object for fault responses */
export class FaultResponseError extends Error {
  constructor(public readonly fault: unknown) {
    super("Innoxel Master Fault response");
  }
}

/* custom error object for response tag mismatches */
export class ResponseTagError extends Error {
  constructor(
    public readonly action: string,
    public readonly response: unknown,
  ) {
    super("Invalid response tag");
  }
}
