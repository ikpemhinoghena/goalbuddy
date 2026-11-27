export const maxJsonBodyBytes = 64 * 1024;

export type JsonBodyFailure = {
  ok: false;
  status: 400 | 413 | 415;
  code: 'bad_request' | 'payload_too_large' | 'unsupported_media_type';
  message: string;
};

export type JsonBodyResult = { ok: true; value: unknown } | JsonBodyFailure;

const tooLarge: JsonBodyFailure = {
  ok: false,
  status: 413,
  code: 'payload_too_large',
  message: 'The request body must be 64 KiB or smaller.',
};

export async function readJsonBody(
  request: Request,
  maxBytes: number = maxJsonBodyBytes,
): Promise<JsonBodyResult> {
  const mediaType = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (mediaType !== 'application/json') {
    return {
      ok: false,
      status: 415,
      code: 'unsupported_media_type',
      message: 'Send the request body as application/json.',
    };
  }
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > maxBytes) {
    return tooLarge;
  }
  if (!request.body) {
    return { ok: false, status: 400, code: 'bad_request', message: 'A request body is required.' };
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return tooLarge;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch {
    return {
      ok: false,
      status: 400,
      code: 'bad_request',
      message: 'The request body must be valid JSON.',
    };
  }
}
