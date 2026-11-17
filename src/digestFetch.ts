import { createHash, randomBytes } from "node:crypto";

interface DigestChallenge {
  realm: string;
  nonce: string;
  qop?: string;
  algorithm: string;
  opaque?: string;
  nc: number;
}

const hash = (algo: string, data: string) =>
  createHash(algo.toLowerCase().replace("-sess", ""))
    .update(data)
    .digest("hex");

function parseChallenge(header: string): DigestChallenge {
  const params: Record<string, string> = {};
  for (const [, k, v1, v2] of header.matchAll(
    /(\w+)=(?:"([^"]*)"|([^\s,]*))/g,
  )) {
    params[k.toLowerCase()] = v1 ?? v2;
  }
  return {
    realm: params.realm ?? "",
    nonce: params.nonce ?? "",
    qop: params.qop,
    algorithm: params.algorithm || "MD5",
    opaque: params.opaque,
    nc: 0,
  };
}

function buildAuthHeader(
  challenge: DigestChallenge,
  username: string,
  password: string,
  method: string,
  uri: string,
): string {
  challenge.nc += 1;
  const ncHex = challenge.nc.toString(16).padStart(8, "0");
  const cnonce = randomBytes(8).toString("hex");
  const { realm, nonce, qop, algorithm, opaque } = challenge;

  let ha1 = hash(algorithm, `${username}:${realm}:${password}`);
  if (algorithm.toLowerCase().endsWith("-sess")) {
    ha1 = hash(algorithm, `${ha1}:${nonce}:${cnonce}`);
  }

  const ha2 = hash(algorithm, `${method}:${uri}`);
  const useAuthQop = qop
    ?.split(",")
    .map((q) => q.trim())
    .includes("auth");

  const response = useAuthQop
    ? hash(algorithm, `${ha1}:${nonce}:${ncHex}:${cnonce}:auth:${ha2}`)
    : hash(algorithm, `${ha1}:${nonce}:${ha2}`);

  const parts = [
    `username="${username}"`,
    `realm="${realm}"`,
    `nonce="${nonce}"`,
    `uri="${uri}"`,
    `algorithm=${algorithm}`,
    `response="${response}"`,
    ...(opaque ? [`opaque="${opaque}"`] : []),
    ...(useAuthQop ? ["qop=auth", `nc=${ncHex}`, `cnonce="${cnonce}"`] : []),
  ];

  return `Digest ${parts.join(", ")}`;
}

/** Creates a fetch wrapper that handles HTTP Digest authentication per client instance. */
export function createDigestFetch(username: string, password: string) {
  let cached: DigestChallenge | undefined;

  return async (url: string | URL, init?: RequestInit): Promise<Response> => {
    const parsedUrl = new URL(url);
    const method = (init?.method || "GET").toUpperCase();
    const uri = parsedUrl.pathname + parsedUrl.search;

    const sendWithChallenge = (challenge: DigestChallenge) => {
      const headers = new Headers(init?.headers);
      headers.set(
        "Authorization",
        buildAuthHeader(challenge, username, password, method, uri),
      );
      return fetch(parsedUrl, { ...init, headers });
    };

    let res: Response;
    if (cached) {
      res = await sendWithChallenge(cached);
      if (res.status !== 401) return res;
      cached = undefined;
    } else {
      res = await fetch(parsedUrl, init);
      if (res.status !== 401) return res;
    }

    const authHeader = res.headers.get("www-authenticate");
    if (!authHeader?.toLowerCase().startsWith("digest ")) return res;

    cached = parseChallenge(authHeader);
    return sendWithChallenge(cached);
  };
}
