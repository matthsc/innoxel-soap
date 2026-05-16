import {
  EndpointError,
  FaultResponseError,
  NetworkError,
  ResponseTagError,
} from "../src/errors";

describe("Errors", () => {
  it("NetworkError should have correct message", () => {
    const parent = new Error("original error");
    const err = new NetworkError(parent);
    assert.equal(err.message, "original error");
  });

  it("EndpointError should have correct properties", () => {
    const err = new EndpointError(404, "Not Found");
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, "Not Found");
  });

  it("FaultResponseError should have correct message", () => {
    const err = new FaultResponseError({ code: "500" });
    assert.equal(err.message, "Innoxel Master Fault response");
    assert.deepEqual(err.fault, { code: "500" });
  });

  it("ResponseTagError should have correct message", () => {
    const err = new ResponseTagError("getState", { body: "invalid" });
    assert.equal(err.message, "Invalid response tag");
    assert.equal(err.action, "getState");
    assert.deepEqual(err.response, { body: "invalid" });
  });
});
