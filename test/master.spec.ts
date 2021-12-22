/// <reference types="node" />

import InnoxelApi from "../src/index";
import { assert } from "chai";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

describe("Innoxel Master", function () {
  const ip = process.env.INNOXEL_IP as string;
  const port = Number.parseInt(process.env.INNOXEL_PORT || "5001");
  const user = process.env.INNOXEL_USER as string;
  const password = process.env.INNOXEL_PASS as string;
  const skipTests = !ip || !port || !user || !password;
  let api: InnoxelApi;

  beforeEach(function () {
    if (skipTests) this.skip();

    api = new InnoxelApi({ ip, port, user, password });
  });

  it("throws on wrong port", async function () {
    this.timeout(5000);
    api = new InnoxelApi({ ip, port: port - 1, user, password });
    try {
      await api.getBootAndStateIdXml();
      assert.fail("call should not succeed");
    } catch {
      // all good
    }
  });

  it("throws on wrong credentials", async function () {
    for (const wrongCredentialsApi of [
      new InnoxelApi({ ip, port, user: "i-shouldnt exists", password }),
      new InnoxelApi({
        ip,
        port,
        user,
        password: "i-shouldnt-be-the-password",
      }),
    ]) {
      api = wrongCredentialsApi;
      try {
        await api.getBootAndStateIdXml();
        assert.fail("call should not succeed");
      } catch {
        // all good
      }
    }
  });

  it("loads boot and state id xml", async function () {
    const xml = await api.getBootAndStateIdXml();
    for (const tag of [
      "Envelope",
      "Body",
      "getStateResponse",
      "bootId",
      "stateId",
    ])
      assert.include(xml, tag);
  });

  it("loads boot and state ids", async function () {
    const ids = await api.getBootAndStateIds();
    assert.lengthOf(ids, 2);
    for (const id of ids) {
      assert.typeOf(id, "string");
      assert.isTrue(id.length > 0);
      assert.include(id, "usid:");
    }
  });
});
