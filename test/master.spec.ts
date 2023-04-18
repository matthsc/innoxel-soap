/// <reference types="node" />
import "dotenv/config";
import InnoxelApi, { ModuleRoomClimateSetType } from "../src/index";
import { assert, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);

function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

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
    assert.isRejected(api.getBootAndStateIdXml());
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
      assert.isRejected(api.getBootAndStateIdXml());
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

  it("loads identities", async function () {
    const identities = await api.getIdentities();
    assert.exists(identities);
    assert.isArray(identities);
    assert.isTrue(identities.length > 0);
  });

  it("triggers out module", async function () {
    const moduleIndex = Number.parseInt(
      process.env.INNOXEL_TEST_MODULE_OUT_INDEX || "-1",
      10,
    );
    const channelIndex = Number.parseInt(
      process.env.INNOXEL_TEST_MODULE_OUT_CHANNEL || "-1",
      10,
    );

    if (moduleIndex < 0 || channelIndex < 0) {
      this.skip();
      return;
    }

    await api.triggerOutModule(moduleIndex, channelIndex);
    await sleep(1000);
    await api.triggerOutModule(moduleIndex, channelIndex);
  });

  it("sets room temperature", async function () {
    const moduleIndex = Number.parseInt(
      process.env.INNOXEL_TEST_MODULE_ROOMCLIMATE_INDEX || "-1",
      10,
    );
    const type = process.env.INNOXEL_TEST_MODULE_OUT_CHANNEL;

    if (moduleIndex < 0 || !type) {
      this.skip();
      return;
    }

    const temperatures = [16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21];
    const temperature =
      temperatures[Math.floor(Math.random() * temperatures.length)];
    const result = await api.setRoomClimate(
      moduleIndex,
      type as ModuleRoomClimateSetType,
      temperature,
    );
    assert.equal(result, temperature);
  });
});
