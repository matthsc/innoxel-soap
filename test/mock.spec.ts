import {
  bootAndStateIdXmlResponse,
  getIdentityResponseMasterDimModule,
  getIdentityResponseMasterInModule,
  getIdentityResponseMasterOutModule,
  getIdentityResponseMasterRoomClimateModule,
} from "./mock.constants";
import InnoxelApi from "../src";
import { assert } from "chai";
import { mergeModuleLists } from "./testHelper";
import nock from "nock";

const user = "test-user";
const pass = "test-pass";
const ip = "127.0.0.2";
const port = 1000;

function createMock() {
  return nock(`http://${ip}:${port}`).post("/control");
}

describe("MOCK", function () {
  let api: InnoxelApi;

  beforeEach(function () {
    api = new InnoxelApi({ ip, port, user, password: pass });
  });

  this.afterEach(function () {
    nock.cleanAll();
  });

  it("asks for auth", async function () {
    const scope = createMock().reply(401, undefined, {
      "WWW-AUTHENTICATE": `Digest realm="INNOXEL Master 3", nonce="test-nounce", algorithm="MD5", qop="auth"`,
    });
    scope.matchHeader("authorization", /.*/).post("/control").reply(200, "Ok");
    const result = await api.getBootAndStateIdXml();
    assert.equal(result, "Ok");
    assert.isTrue(scope.isDone(), "nock scope should be done");
    assert.isTrue(nock.isDone(), "nock should be done");
  });

  it("extracts boot and state ids", async function () {
    createMock().reply(200, bootAndStateIdXmlResponse);
    const [bootId, stateId] = await api.getBootAndStateIds();
    assert.equal(bootId, "usid:3A006A0F3FAB:00000000");
    assert.equal(
      stateId,
      "usid:3A00D56B404D:0000123B:00001272:00000000:000001B2",
    );
    assert.isTrue(nock.isDone(), "nock should be done");
  });

  it("parses getIdentity responses", async function () {
    createMock().reply(
      200,
      mergeModuleLists(
        getIdentityResponseMasterOutModule,
        getIdentityResponseMasterInModule,
        getIdentityResponseMasterDimModule,
        getIdentityResponseMasterRoomClimateModule,
      ),
    );
    const identities = await api.getIdentities();
    assert.exists(identities);
    assert.isArray(identities);
    for (const masterClass of [
      "masterInModule",
      "masterOutModule",
      "masterDimModule",
      "masterRoomClimateModule",
    ])
      assert(
        identities.some((i) => i.class === masterClass),
        `found ${masterClass}`,
      );
  });

  it("includes channels with errors", async function () {
    createMock().reply(
      200,
      mergeModuleLists(
        getIdentityResponseMasterOutModule,
        getIdentityResponseMasterDimModule,
      ),
    );
    const identities = await api.getIdentities();
    for (const masterClass of ["masterOutModule", "masterDimModule"])
      assert(
        identities.some(
          (i) =>
            i.class === masterClass &&
            "channel" in i &&
            i.channel.some((c) => "noxnetError" in c),
        ),
        `found ${masterClass}`,
      );
  });
});
