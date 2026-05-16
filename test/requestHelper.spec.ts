import { asArray, getResponseTag } from "../src/requestHelper";

describe("requestHelper", () => {
  describe("getResponseTag", () => {
    it("returns correct tag for getDeviceStateList", () => {
      assert.equal(
        getResponseTag("getDeviceStateList"),
        "getDeviceStateResponse",
      );
    });

    it("returns correct tag for other actions", () => {
      assert.equal(getResponseTag("getState"), "getStateResponse");
      assert.equal(getResponseTag("setState"), "setStateResponse");
    });
  });

  describe("asArray", () => {
    it("returns same array if input is array", () => {
      const input = [1, 2, 3];
      assert.strictEqual(asArray(input), input);
    });

    it("returns new array with single element if input is not array", () => {
      const input = { a: 1 };
      assert.deepEqual(asArray(input), [input]);
    });
  });
});
