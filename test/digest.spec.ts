import { createHash } from "node:crypto";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { InnoxelApi } from "../src";
import { EndpointError } from "../src/errors";
import { bootAndStateIdXmlResponse } from "./mock.constants";

const user = "test-user";
const pass = "test-pass";
const ip = "127.0.0.2";
const port = 1000;
const mockApiUrl = `http://${ip}:${port}/control`;

const server = setupServer();

const md5 = (data: string) => createHash("md5").update(data).digest("hex");

function parseDigestAuth(header: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [, k, v1, v2] of header.matchAll(
    /(\w+)=(?:"([^"]*)"|([^\s,]*))/g,
  )) {
    params[k] = v1 ?? v2;
  }
  return params;
}

function verifyDigestAuth(
  header: string,
  method: string,
  realm: string,
  expectedNonce: string,
  expectedPass: string,
): { ok: boolean; params: Record<string, string> } {
  if (!header.toLowerCase().startsWith("digest ")) {
    return { ok: false, params: {} };
  }
  const params = parseDigestAuth(header.slice(7));
  if (
    params.username !== user ||
    params.realm !== realm ||
    params.nonce !== expectedNonce
  ) {
    return { ok: false, params };
  }

  const ha1 = md5(`${params.username}:${realm}:${expectedPass}`);
  const ha2 = md5(`${method}:${params.uri}`);
  const expected = params.qop
    ? md5(
        `${ha1}:${params.nonce}:${params.nc}:${params.cnonce}:${params.qop}:${ha2}`,
      )
    : md5(`${ha1}:${params.nonce}:${ha2}`);

  return { ok: params.response === expected, params };
}

describe("Digest Auth", () => {
  let api: InnoxelApi;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    api = new InnoxelApi({ ip, port, user, password: pass });
  });

  it("computes valid Digest auth response with qop=auth", async () => {
    const realm = "INNOXEL Master 3";
    const nonce = "nonce-qop-1";
    let requestCount = 0;

    server.use(
      http.post(mockApiUrl, ({ request }) => {
        requestCount += 1;
        const auth = request.headers.get("authorization");
        if (!auth) {
          return new HttpResponse(null, {
            status: 401,
            headers: {
              "WWW-Authenticate": `Digest realm="${realm}", nonce="${nonce}", algorithm="MD5", qop="auth"`,
            },
          });
        }
        const { ok, params } = verifyDigestAuth(
          auth,
          request.method,
          realm,
          nonce,
          pass,
        );
        assert.isTrue(ok, "digest response hash should match");
        assert.equal(params.uri, "/control");
        assert.equal(params.qop, "auth");
        assert.equal(params.nc, "00000001");
        assert.isString(params.cnonce);
        return HttpResponse.text(bootAndStateIdXmlResponse);
      }),
    );

    const [bootId] = await api.getBootAndStateIds();
    assert.equal(bootId, "usid:3A006A0F3FAB:00000000");
    assert.equal(requestCount, 2);
  });

  it("supports legacy Digest without qop and preserves opaque", async () => {
    const realm = "INNOXEL Master 3";
    const nonce = "nonce-no-qop";
    const opaque = "opaque-xyz";

    server.use(
      http.post(mockApiUrl, ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) {
          return new HttpResponse(null, {
            status: 401,
            headers: {
              "WWW-Authenticate": `Digest realm="${realm}", nonce="${nonce}", opaque="${opaque}", algorithm="MD5"`,
            },
          });
        }
        const { ok, params } = verifyDigestAuth(
          auth,
          request.method,
          realm,
          nonce,
          pass,
        );
        assert.isTrue(ok, "legacy digest response hash should match");
        assert.equal(params.opaque, opaque);
        assert.isUndefined(params.qop);
        return HttpResponse.text(bootAndStateIdXmlResponse);
      }),
    );

    const [bootId] = await api.getBootAndStateIds();
    assert.equal(bootId, "usid:3A006A0F3FAB:00000000");
  });

  it("preserves POST method, SOAP headers, and XML body on retry", async () => {
    const realm = "INNOXEL Master 3";
    const nonce = "nonce-preserve";
    let sawAuth = false;

    server.use(
      http.post(mockApiUrl, async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) {
          return new HttpResponse(null, {
            status: 401,
            headers: {
              "WWW-Authenticate": `Digest realm="${realm}", nonce="${nonce}", algorithm="MD5", qop="auth"`,
            },
          });
        }
        sawAuth = true;
        assert.equal(request.method, "POST");
        assert.include(request.headers.get("content-type") ?? "", "text/xml");
        assert.isString(request.headers.get("soapaction"));
        const body = await request.text();
        assert.include(body, "getState");
        return HttpResponse.text(bootAndStateIdXmlResponse);
      }),
    );

    await api.getBootAndStateIds();
    assert.isTrue(sawAuth);
  });

  it("throws EndpointError(401) on wrong credentials without looping", async () => {
    let requestCount = 0;
    server.use(
      http.post(mockApiUrl, () => {
        requestCount += 1;
        return new HttpResponse("Unauthorized", {
          status: 401,
          headers: {
            "WWW-Authenticate": `Digest realm="INNOXEL Master 3", nonce="nonce-bad", algorithm="MD5", qop="auth"`,
          },
        });
      }),
    );

    try {
      await api.getBootAndStateIds();
      assert.fail("no error thrown");
    } catch (err: unknown) {
      assert.instanceOf(err, EndpointError);
      assert.equal((err as EndpointError).statusCode, 401);
      assert.isAtMost(requestCount, 2);
    }
  });

  it("reuses nonce and increments nc across requests, and re-challenges on stale nonce", async () => {
    const realm = "INNOXEL Master 3";
    let activeNonce = "nonce-1";
    let challengeCount = 0;
    const seenNc: string[] = [];

    server.use(
      http.post(mockApiUrl, ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) {
          challengeCount += 1;
          return new HttpResponse(null, {
            status: 401,
            headers: {
              "WWW-Authenticate": `Digest realm="${realm}", nonce="${activeNonce}", algorithm="MD5", qop="auth"`,
            },
          });
        }

        const { ok, params } = verifyDigestAuth(
          auth,
          request.method,
          realm,
          activeNonce,
          pass,
        );
        if (!ok) {
          challengeCount += 1;
          return new HttpResponse(null, {
            status: 401,
            headers: {
              "WWW-Authenticate": `Digest realm="${realm}", nonce="${activeNonce}", algorithm="MD5", qop="auth", stale=true`,
            },
          });
        }

        seenNc.push(params.nc);
        return HttpResponse.text(bootAndStateIdXmlResponse);
      }),
    );

    await api.getBootAndStateIds();
    await api.getBootAndStateIds();

    // Rotate nonce on server to simulate expiry
    activeNonce = "nonce-2";
    await api.getBootAndStateIds();

    assert.deepEqual(seenNc.slice(0, 2), ["00000001", "00000002"]);
    assert.lengthOf(seenNc, 3);
    assert.equal(challengeCount, 2);
  });
});
