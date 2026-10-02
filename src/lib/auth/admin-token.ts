const COOKIE_NAME =
  "venuvella_admin_session";

const SESSION_DURATION_SECONDS =
  60 * 60 * 12;


export type AdminSessionRole =
  | "ADMIN"
  | "EDITOR"
  | "AUTHOR"
  | "ANALYST";


export type AdminSessionPayload = {
  userId: string;
  email: string;
  role: AdminSessionRole;
  exp: number;
};


type AdminSessionInput = {
  userId: string;
  email: string;
  role: AdminSessionRole;
};


const VALID_ROLES:
  readonly AdminSessionRole[] = [
    "ADMIN",
    "EDITOR",
    "AUTHOR",
    "ANALYST",
  ];


function isValidRole(
  value: unknown
): value is AdminSessionRole {
  return (
    typeof value === "string" &&
    VALID_ROLES.includes(
      value as AdminSessionRole
    )
  );
}


function bytesToBase64Url(
  bytes: Uint8Array
) {
  let binary = "";

  for (const byte of bytes) {
    binary +=
      String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}


function base64UrlToBytes(
  value: string
) {
  const normalized =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const padding =
    normalized.length % 4 === 0
      ? ""
      : "=".repeat(
          4 -
            (normalized.length % 4)
        );


  const binary =
    atob(
      normalized +
        padding
    );


  return Uint8Array.from(
    binary,
    (character) =>
      character.charCodeAt(0)
  );
}


function encodeText(
  value: string
) {
  return new TextEncoder().encode(
    value
  );
}


async function getSigningKey(
  secret: string
) {
  return crypto.subtle.importKey(
    "raw",
    encodeText(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    [
      "sign",
      "verify",
    ]
  );
}


async function signValue(
  value: string,
  secret: string
) {
  const key =
    await getSigningKey(
      secret
    );


  const signature =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encodeText(value)
    );


  return bytesToBase64Url(
    new Uint8Array(
      signature
    )
  );
}


async function verifySignature(
  value: string,
  signature: string,
  secret: string
) {
  try {
    const key =
      await getSigningKey(
        secret
      );


    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(
        signature
      ),
      encodeText(value)
    );

  } catch {
    return false;
  }
}


function encodePayload(
  payload:
    AdminSessionPayload
) {
  return bytesToBase64Url(
    encodeText(
      JSON.stringify(
        payload
      )
    )
  );
}


function decodePayload(
  value: string
):
  | AdminSessionPayload
  | null {

  try {
    const bytes =
      base64UrlToBytes(
        value
      );


    const text =
      new TextDecoder().decode(
        bytes
      );


    const parsed =
      JSON.parse(
        text
      ) as Partial<AdminSessionPayload>;


    if (
      typeof parsed.userId !==
        "string" ||
      parsed.userId.length === 0 ||
      typeof parsed.email !==
        "string" ||
      parsed.email.length === 0 ||
      !isValidRole(
        parsed.role
      ) ||
      typeof parsed.exp !==
        "number"
    ) {
      return null;
    }


    return {
      userId:
        parsed.userId,

      email:
        parsed.email,

      role:
        parsed.role,

      exp:
        parsed.exp,
    };

  } catch {
    return null;
  }
}


export async function createAdminToken(
  session: AdminSessionInput,
  secret: string
) {
  const now =
    Math.floor(
      Date.now() /
        1000
    );


  const payload:
    AdminSessionPayload = {
      userId:
        session.userId,

      email:
        session.email,

      role:
        session.role,

      exp:
        now +
        SESSION_DURATION_SECONDS,
    };


  const encodedPayload =
    encodePayload(
      payload
    );


  const signature =
    await signValue(
      encodedPayload,
      secret
    );


  return `${encodedPayload}.${signature}`;
}


export async function verifyAdminToken(
  token:
    | string
    | undefined,
  secret: string
) {
  if (!token) {
    return null;
  }


  const parts =
    token.split(".");


  if (
    parts.length !== 2
  ) {
    return null;
  }


  const [
    encodedPayload,
    signature,
  ] = parts;


  if (
    !encodedPayload ||
    !signature
  ) {
    return null;
  }


  const signatureValid =
    await verifySignature(
      encodedPayload,
      signature,
      secret
    );


  if (!signatureValid) {
    return null;
  }


  const payload =
    decodePayload(
      encodedPayload
    );


  if (!payload) {
    return null;
  }


  const now =
    Math.floor(
      Date.now() /
        1000
    );


  if (
    payload.exp <=
    now
  ) {
    return null;
  }


  return payload;
}


export function getAdminCookieName() {
  return COOKIE_NAME;
}


export function getAdminSessionDurationSeconds() {
  return SESSION_DURATION_SECONDS;
}