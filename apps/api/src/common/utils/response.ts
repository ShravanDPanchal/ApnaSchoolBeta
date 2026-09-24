import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message?: string, meta?: Record<string, any>, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  details?: any,
  statusCode = 400
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
