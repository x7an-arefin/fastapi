import type { Context } from 'hono';
import type { Env } from '../../generated/bindings.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifySession } from '../../core/auth/session-cache.js';
import { AppError } from '../../core/errors/application-error.js';
import { logger } from '../../core/observability/logger.js';

const ALLOWED_MIME_TYPES = new Set(["image/jpeg","image/png","application/pdf"]);
const MAX_BYTES = 5242880;
const PUBLIC_BASE_URL = 'https://media.example.com';
const URL_EXPIRY_SECONDS = 300;

/**
 * @author arefin
 * @description Initialize and return an S3 client configured with R2-compatible credentials from the environment
 */
function getS3Client(env: Env): S3Client {
  const e = env as unknown as Record<string, string>;
  return new S3Client({
    region: 'auto',
    endpoint: `https://s3.us-west-002.backblazeb2.com`,
    credentials: {
      accessKeyId: e['B2_KEY_ID'] ?? '',
      secretAccessKey: e['B2_APP_KEY'] ?? '',
    },
  });
}

/**
 * @author arefin
 * @description Handle the incoming HTTP request — orchestrates input validation, business logic, and response formatting
 */
export async function uploadUrlRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();

  const session = await verifySession(c.env, c.req.raw);
  if (!session) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }

  const body = await c.req.json() as { filename: string; mimeType: string; entityType?: string; entityId?: string };
  const { filename, mimeType, entityType, entityId } = body;

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError('INVALID_MIME_TYPE', `MIME type not allowed: ${mimeType}`, 422);
  }

  const ext = filename.split('.').pop() ?? 'bin';
  const objectKey = `uploads/${session.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const s3 = getS3Client(c.env);
  const command = new PutObjectCommand({
    Bucket: (c.env as unknown as Record<string, string>)['B2_BUCKET_NAME'] ?? '',
    Key: objectKey,
    ContentType: mimeType,
    ContentLength: MAX_BYTES,
    Metadata: {
      userId: session.userId,
      entityType: entityType ?? '',
      entityId: entityId ?? '',
      correlationId,
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: URL_EXPIRY_SECONDS });
  const publicUrl = `${PUBLIC_BASE_URL}/${objectKey}`;

  logger.info({ action: 'presigned_url_generated', objectKey, userId: session.userId, correlationId });

  c.header('x-correlation-id', correlationId);
  return c.json({ uploadUrl, objectKey, publicUrl, expiresIn: URL_EXPIRY_SECONDS });
}

/**
 * @author arefin
 * @description Handle the incoming HTTP request — orchestrates input validation, business logic, and response formatting
 */
export async function completeUploadRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const correlationId = c.req.header('x-correlation-id') ?? crypto.randomUUID();

  const session = await verifySession(c.env, c.req.raw);
  if (!session) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);

  const body = await c.req.json() as { objectKey: string; entityType: string; entityId: string };
  const { objectKey, entityType, entityId } = body;

  const publicUrl = `${PUBLIC_BASE_URL}/${objectKey}`;

  logger.info({ action: 'upload_completed', objectKey, entityType, entityId, correlationId });

  c.header('x-correlation-id', correlationId);
  return c.json({
    success: true,
    url: publicUrl,
    objectKey,
    entityType,
    entityId,
  });
}
