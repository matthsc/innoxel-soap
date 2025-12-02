import "dotenv/config";
import InnoxelApi, { type ModuleRoomClimateSetType } from "../src/index";

function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

describe("Innoxel Master", () => {
  const ip = process.env.INNOXEL_IP as string;
  const port = Number.parseInt(process.env.INNOXEL_PORT || "5001", 10);
  const user = process.env.INNOXEL_USER as string;
  const password = process.env.INNOXEL_PASS as string;
  const skipTests = !ip || !port || !user || !password;
  let api: InnoxelApi;

  beforeEach(({ skip }) => {
    if (skipTests) skip();

    api = new InnoxelApi({ ip, port, user, password });
  });

  it("throws on wrong port", async () => {
    api = new InnoxelApi({ ip, port: port - 1, user, password });
    try {
      await api.getBootAndStateIdXml();
      assert.fail("Should have thrown");
    } catch {
      // expected
    }
  });

  it("throws on wrong credentials", async () => {
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
        assert.fail("Should have thrown");
      } catch {
        // expected
      }
    }
  });

  it("loads boot and state id xml", async () => {
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

  it("loads boot and state ids", async () => {
    const ids = await api.getBootAndStateIds();
    assert.lengthOf(ids, 2);
    for (const id of ids) {
      assert.typeOf(id, "string");
      assert.isTrue(id.length > 0);
      assert.include(id, "usid:");
    }
  });

  it("loads identities", async () => {
    const identities = await api.getIdentities();
    assert.exists(identities);
    assert.isArray(identities);
    assert.isTrue(identities.length > 0);
  });

  it("triggers out module", async ({ skip }) => {
    const moduleIndex = Number.parseInt(
      process.env.INNOXEL_TEST_MODULE_OUT_INDEX || "-1",
      10,
    );
    const channelIndex = Number.parseInt(
      process.env.INNOXEL_TEST_MODULE_OUT_CHANNEL || "-1",
      10,
    );

    if (moduleIndex < 0 || channelIndex < 0) {
      skip();
      return;
    }

    await api.triggerOutModule(moduleIndex, channelIndex);
    await sleep(1000);
    await api.triggerOutModule(moduleIndex, channelIndex);
  });

  it("sets room temperature", async ({ skip }) => {
    const moduleIndex = Number.parseInt(
      process.env.INNOXEL_TEST_MODULE_ROOMCLIMATE_INDEX || "-1",
      10,
    );
    const type = process.env.INNOXEL_TEST_MODULE_ROOMCLIMATE_TYPE;

    if (moduleIndex < 0 || !type) {
      skip();
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
