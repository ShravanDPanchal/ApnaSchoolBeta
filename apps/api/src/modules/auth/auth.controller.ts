import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response';

export const authRouter = Router();

/**
 * Send OTP
 */
authRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { identifier, purpose = 'REGISTRATION', metadata } = req.body;
    if (!identifier) {
      return sendError(res, 'VALIDATION_ERROR', 'મોબાઈલ નંબર અથવા ઈમેલ દાખલ કરવો ફરજિયાત છે (Identifier required)', null, 400);
    }

    const result = await authService.sendOtp(identifier, purpose, metadata);
    return sendSuccess(res, result, 'OTP સફળતાપૂર્વક મોકલવામાં આવ્યો છે');
  } catch (error: any) {
    if (error.message === 'USER_ALREADY_EXISTS') {
      return sendError(res, 'USER_ALREADY_EXISTS', 'આ મોબાઈલ/ઈમેલ સાથેનું એકાઉન્ટ પહેલેથી જ મોજૂદ છે. કૃપા કરી લૉગીન કરો.', null, 409);
    }
    if (error.message === 'USER_NOT_FOUND') {
      return sendError(res, 'USER_NOT_FOUND', 'આ મોબાઈલ/ઈમેલ સાથે કોઈ એકાઉન્ટ મળ્યું નથી.', null, 404);
    }
    if (error.message === 'INVALID_PHONE_OR_EMAIL') {
      return sendError(res, 'VALIDATION_ERROR', 'કૃપા કરી માન્ય ૧૦ અંકનો મોબાઈલ નંબર અથવા ઈમેલ દાખલ કરો.', null, 400);
    }
    return sendError(res, 'SERVER_ERROR', error.message || 'OTP મોકલવામાં નિષ્ફળતા', null, 500);
  }
});

/**
 * Verify OTP
 */
authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { identifier, otp, purpose = 'REGISTRATION' } = req.body;
    if (!identifier || !otp) {
      return sendError(res, 'VALIDATION_ERROR', 'મોબાઈલ અને OTP દાખલ કરવો જરૂરી છે', null, 400);
    }

    const result = await authService.verifyOtp(identifier, otp, purpose);
    return sendSuccess(res, result, 'OTP ચકાસણી સફળ થઈ');
  } catch (error: any) {
    if (error.message === 'OTP_NOT_FOUND' || error.message === 'OTP_EXPIRED') {
      return sendError(res, 'OTP_EXPIRED', 'OTP ની મુદત પૂરી થઈ ગઈ છે અથવા અમાન્ય છે. નવો OTP મેળવો.', null, 400);
    }
    if (error.message === 'OTP_INVALID') {
      return sendError(res, 'OTP_INVALID', 'દાખલ કરેલ OTP ખોટો છે. કૃપા કરી ફરી ચકાસો.', null, 400);
    }
    if (error.message === 'OTP_MAX_ATTEMPTS_EXCEEDED') {
      return sendError(res, 'OTP_MAX_ATTEMPTS', 'મહત્તમ પ્રયાસો પૂર્ણ થયા છે. નવો OTP મેળવો.', null, 429);
    }
    return sendError(res, 'SERVER_ERROR', error.message || 'OTP ચકાસણીમાં નિષ્ફળતા', null, 500);
  }
});

/**
 * Register New School & Admin
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password, schoolNameGu, schoolNameEn, district, taluka, diseCode, otp } = req.body;

    if (!name || !mobile || !password || !schoolNameGu) {
      return sendError(res, 'VALIDATION_ERROR', 'નામ, મોબાઈલ, પાસવર્ડ અને શાળાનું નામ ફરજિયાત છે.', null, 400);
    }

    if (password.length < 4) {
      return sendError(res, 'VALIDATION_ERROR', 'પાસવર્ડ ઓછામાં ઓછો ૪ અક્ષરનો હોવો જોઈએ.', null, 400);
    }

    const result = await authService.register({
      name,
      mobile,
      email,
      password,
      schoolNameGu,
      schoolNameEn,
      district,
      taluka,
      diseCode,
      otp,
    });

    return sendSuccess(res, result, 'શાળાનું એકાઉન્ટ સફળતાપૂર્વક તૈયાર થઈ ગયું!', undefined, 201);
  } catch (error: any) {
    if (error.message === 'USER_ALREADY_EXISTS') {
      return sendError(res, 'USER_ALREADY_EXISTS', 'આ મોબાઈલ નંબર સાથે એકાઉન્ટ પહેલેથી જ ઉપલબ્ધ છે.', null, 409);
    }
    if (
      error.message === 'OTP_VERIFICATION_REQUIRED' ||
      error.message === 'OTP_INVALID' ||
      error.message === 'OTP_NOT_FOUND' ||
      error.message === 'OTP_EXPIRED'
    ) {
      return sendError(res, 'OTP_REQUIRED', 'કૃપા કરી માન્ય OTP દાખલ કરી મોબાઈલ ચકાસણી પૂર્ણ કરો.', null, 400);
    }
    return sendError(res, 'SERVER_ERROR', error.message || 'રજીસ્ટ્રેશનમાં ક્ષતિ આવી.', null, 500);
  }
});

/**
 * Forgot Password / Reset
 */
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return sendError(res, 'VALIDATION_ERROR', 'મોબાઈલ, OTP અને નવો પાસવર્ડ ફરજિયાત છે.', null, 400);
    }

    const result = await authService.resetPassword(identifier, otp, newPassword);
    return sendSuccess(res, result, 'પાસવર્ડ સફળતાપૂર્વક રીસેટ થઈ ગયો!');
  } catch (error: any) {
    if (error.message === 'OTP_INVALID' || error.message === 'OTP_EXPIRED') {
      return sendError(res, 'OTP_INVALID', 'અમાન્ય અથવા સમયસીમા સમાપ્ત થયેલ OTP.', null, 400);
    }
    if (error.message === 'USER_NOT_FOUND') {
      return sendError(res, 'USER_NOT_FOUND', 'આ મોબાઈલ નંબર સાથે કોઈ વપરાશકર્તા મળ્યા નથી.', null, 404);
    }
    return sendError(res, 'SERVER_ERROR', error.message || 'પાસવર્ડ રીસેટ કરવામાં ક્ષતિ આવી.', null, 500);
  }
});

/**
 * Login
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password, tenantCode } = req.body;
    if (!identifier || !password) {
      return sendError(res, 'VALIDATION_ERROR', 'મોબાઈલ/ઈમેલ અને પાસવર્ડ દાખલ કરવો જરૂરી છે.', null, 400);
    }

    const result = await authService.login(identifier, password, tenantCode);
    return sendSuccess(res, result, 'લૉગીન સફળ થયું');
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return sendError(res, 'INVALID_CREDENTIALS', 'અમાન્ય મોબાઈલ/ઈમેલ અથવા પાસવર્ડ. કૃપા કરી ફરી પ્રયાસ કરો.', null, 401);
    }
    if (error.message === 'NO_TENANT_ASSIGNED') {
      return sendError(res, 'NO_TENANT', 'આ એકાઉન્ટ કોઈ શાળા સાથે જોડાયેલું નથી.', null, 403);
    }
    return sendError(res, 'SERVER_ERROR', error.message || 'લૉગીન નિષ્ફળ રહ્યું', null, 500);
  }
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const profile = await authService.getProfile(req.user!.userId, req.user!.tenantId);
    return sendSuccess(res, profile);
  } catch (error: any) {
    return sendError(res, 'SERVER_ERROR', error.message, null, 500);
  }
});

authRouter.patch('/locale', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { locale } = req.body;
    if (locale !== 'gu' && locale !== 'en') {
      return sendError(res, 'VALIDATION_ERROR', 'Locale must be gu or en', null, 400);
    }
    const result = await authService.updateLocale(req.user!.userId, locale);
    return sendSuccess(res, result, 'Locale preference updated');
  } catch (error: any) {
    return sendError(res, 'SERVER_ERROR', error.message, null, 500);
  }
});

