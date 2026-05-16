import { EndpointError, NetworkError } from "../src/errors";
import {
  bootAndStateIdXmlResponse,
  getIdentityResponseMasterDimModule,
  getIdentityResponseMasterInModule,
  getIdentityResponseMasterOutModule,
  getIdentityResponseMasterRoomClimateModule,
  setStateResponseRoomClimate,
} from "./mock.constants";
import { InnoxelApi } from "../src";
import { mergeModuleLists } from "./testHelper";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const user = "test-user";
const pass = "test-pass";
const ip = "127.0.0.2";
const port = 1000;

const server = setupServer();
const mockApiUrl = `http://${ip}:${port}/control`;

describe("MOCK", () => {
  let api: InnoxelApi;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    api = new InnoxelApi({ ip, port, user, password: pass });
  });

  it("throws NetworkError on unknown exceptions", async () => {
    server.use(http.post(mockApiUrl, () => HttpResponse.error()));
    try {
      await api.getBootAndStateIdXml();
      assert.fail("no error thrown");
    } catch (err: unknown) {
      assert.instanceOf(err, NetworkError);
    }
  });

  it("throws EndpointError on API errors", async () => {
    const body = { message: "Unauthorized" };
    server.use(
      http.post(mockApiUrl, () => HttpResponse.json(body, { status: 500 })),
    );
    try {
      await api.getBootAndStateIdXml();
      assert.fail("no error thrown");
    } catch (err: unknown) {
      assert.instanceOf(err, EndpointError);
      assert.equal((err as EndpointError).statusCode, 500);
      assert.equal((err as EndpointError).message, JSON.stringify(body));
    }
  });

  it("asks for auth", async () => {
    let authHeaderPresent = false;
    server.use(
      http.post(mockApiUrl, ({ request }) => {
        if (request.headers.has("authorization")) {
          authHeaderPresent = true;
          return HttpResponse.text("Ok");
        }
        return new HttpResponse(null, {
          status: 401,
          headers: {
            "WWW-AUTHENTICATE": `Digest realm="INNOXEL Master 3", nonce="test-nounce", algorithm="MD5", qop="auth"`,
          },
        });
      }),
    );
    const result = await api.getBootAndStateIdXml();
    assert.equal(result, "Ok");
    assert.isTrue(
      authHeaderPresent,
      "authorization header should have been sent",
    );
  });

  it("extracts boot and state ids", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(bootAndStateIdXmlResponse)),
    );
    const [bootId, stateId] = await api.getBootAndStateIds();
    assert.equal(bootId, "usid:3A006A0F3FAB:00000000");
    assert.equal(
      stateId,
      "usid:3A00D56B404D:0000123B:00001272:00000000:000001B2",
    );
  });

  it("parses getIdentity responses", async () => {
    server.use(
      http.post(mockApiUrl, () =>
        HttpResponse.text(
          mergeModuleLists(
            getIdentityResponseMasterOutModule,
            getIdentityResponseMasterInModule,
            getIdentityResponseMasterDimModule,
            getIdentityResponseMasterRoomClimateModule,
          ),
        ),
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

  it("includes channels with errors", async () => {
    server.use(
      http.post(mockApiUrl, () =>
        HttpResponse.text(
          mergeModuleLists(
            getIdentityResponseMasterOutModule,
            getIdentityResponseMasterDimModule,
          ),
        ),
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

  it("handles setting temperature", async () => {
    server.use(
      http.post(mockApiUrl, () =>
        HttpResponse.text(setStateResponseRoomClimate),
      ),
    );
    const result = await api.setRoomClimate(0, "setTemperatureHeating", 21.5);
    assert.equal(result, "21.5");
  });
});
