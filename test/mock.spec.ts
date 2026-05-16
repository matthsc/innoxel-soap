import {
  EndpointError,
  FaultResponseError,
  NetworkError,
  ResponseTagError,
} from "../src/errors";
import {
  bootAndStateIdXmlResponse,
  faultResponse,
  getDeviceStateResponse,
  getIdentityResponseMasterDimModule,
  getIdentityResponseMasterInModule,
  getIdentityResponseMasterOutModule,
  getIdentityResponseMasterRoomClimateModule,
  getWeatherResponse,
  setStateResponseRoomClimate,
  setStateSuccessResponse,
} from "./mock.constants";
import { IDeviceStatusResponse, InnoxelApi } from "../src";
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

  it("throws FaultResponseError on SOAP faults", async () => {
    server.use(http.post(mockApiUrl, () => HttpResponse.text(faultResponse)));
    try {
      await api.getDeviceState();
      assert.fail("no error thrown");
    } catch (err: unknown) {
      assert.instanceOf(err, FaultResponseError);
    }
  });

  it("throws ResponseTagError on tag mismatch", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(bootAndStateIdXmlResponse)),
    );
    try {
      await api.getDeviceState();
      assert.fail("no error thrown");
    } catch (err: unknown) {
      assert.instanceOf(err, ResponseTagError);
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

  it("gets device state", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(getDeviceStateResponse)),
    );
    const result: Partial<IDeviceStatusResponse> = await api.getDeviceState();
    assert.deepEqual(result, { baseSupplyStateCAN1: "OK" });
  });

  it("gets weather", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(getWeatherResponse)),
    );
    const result = await api.getWeather();
    assert.equal(result.sunTwilight.value, 100);
    assert.equal(result.temperatureAir.value, 20.5);
  });

  it("triggers push button", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(setStateSuccessResponse)),
    );
    await api.triggerPushButton(0, 0);
  });

  it("triggers out module", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(setStateSuccessResponse)),
    );
    await api.triggerOutModule(0, 0);
  });

  it("sets dim value", async () => {
    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(setStateSuccessResponse)),
    );
    await api.setDimValue(0, 0, 50);
  });

  it("logs soap messages", async () => {
    const logs: string[] = [];
    const logger = (status: string | number, message: string) => {
      logs.push(`${status}: ${message}`);
    };
    api = new InnoxelApi({
      ip,
      port,
      user,
      password: pass,
      soapLogger: logger,
    });

    server.use(
      http.post(mockApiUrl, () => HttpResponse.text(getDeviceStateResponse)),
    );
    await api.getDeviceState();

    assert.isAbove(logs.length, 0);
    assert.include(logs[0], "POST: ");
    assert.include(logs[1], "200: ");
  });

  it("gets module states", async () => {
    server.use(
      http.post(mockApiUrl, () =>
        HttpResponse.text(
          bootAndStateIdXmlResponse.replace("bootId", "moduleList"),
        ),
      ),
    );
    const states = await api.getModuleStates();
    assert.isArray(states);
  });

  it("uses default port 5001", async () => {
    api = new InnoxelApi({ ip, user, password: pass });
    server.use(
      http.post(`http://${ip}:5001/control`, () =>
        HttpResponse.text(bootAndStateIdXmlResponse),
      ),
    );
    const result = await api.getBootAndStateIdXml();
    assert.isString(result);
  });

  it("gets room climate", async () => {
    server.use(
      http.post(mockApiUrl, () =>
        HttpResponse.text(
          setStateResponseRoomClimate.replace(
            "setStateResponse",
            "getStateResponse",
          ),
        ),
      ),
    );
    const rooms = await api.getRoomClimate([0]);
    assert.isArray(rooms);
    assert.equal(rooms.length, 1);
  });
});
