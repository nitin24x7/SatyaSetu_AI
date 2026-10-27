import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../../auth/authService';
import { authenticate } from '../../auth/authMiddleware';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email('Valid institutional email is required'),
  password: z.string().optional(),
});

const mfaVerifySchema = z.object({
  mfaSessionId: z.string().min(1, 'mfaSessionId is required'),
  code: z.string().min(6, '6-digit MFA code required').max(10),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});

const pkceAuthorizeSchema = z.object({
  redirectUri: z.string().url('redirectUri must be a valid URL'),
  codeChallenge: z.string().min(1, 'codeChallenge is required'),
  userEmail: z.string().email().optional(),
});

const pkceTokenSchema = z.object({
  code: z.string().min(1, 'code is required'),
  codeVerifier: z.string().min(1, 'codeVerifier is required'),
});

/**
 * POST /api/v1/auth/login - Institutional & Assessor Authentication
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);

    if (result.mfaChallenge) {
      return res.status(200).json({
        success: true,
        data: result.mfaChallenge,
        message: 'MFA challenge issued. Provide 6-digit TOTP code from your registered authenticator app.',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: result.tokens,
      message: 'Authentication successful. Access and refresh tokens issued.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      type: 'https://satyasetu.gov.in/errors/AUTH_FAILED',
      title: 'Authentication Failed',
      status: 401,
      detail: err.message || 'Invalid credentials.',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/auth/mfa/verify - Verify TOTP MFA token
 */
authRouter.post('/mfa/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mfaSessionId, code } = mfaVerifySchema.parse(req.body);
    const tokens = await authService.verifyMfa(mfaSessionId, code);

    res.status(200).json({
      success: true,
      data: tokens,
      message: 'MFA code verified. Session established.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      type: 'https://satyasetu.gov.in/errors/MFA_FAILED',
      title: 'MFA Verification Failed',
      status: 401,
      detail: err.message || 'Invalid verification code.',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/auth/mfa/setup - Initialize TOTP configuration (Authenticated)
 */
authRouter.post('/mfa/setup', authenticate, async (req: Request, res: Response) => {
  try {
    const result = authService.setupMfa(req.user!.sub);
    res.json({
      success: true,
      data: result,
      message: 'TOTP secret generated. Scan QR code or enter secret into your authenticator app.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/SETUP_FAILED',
      title: 'MFA Setup Failed',
      status: 400,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/auth/mfa/confirm - Confirm and activate MFA (Authenticated)
 */
authRouter.post('/mfa/confirm', authenticate, async (req: Request, res: Response) => {
  const code = req.body.code as string;
  if (!code) {
    return res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/BAD_REQUEST',
      title: 'Missing Code',
      status: 400,
      detail: 'MFA code is required to confirm setup.',
      timestamp: new Date().toISOString(),
    });
  }

  const isConfirmed = authService.confirmMfaSetup(req.user!.sub, code);
  if (!isConfirmed) {
    return res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/INVALID_CODE',
      title: 'Verification Failed',
      status: 400,
      detail: 'Code does not match generated secret.',
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'MFA successfully enabled for account.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/auth/refresh - Rotate refresh token & issue new access token
 */
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
      message: 'Access token refreshed successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      type: 'https://satyasetu.gov.in/errors/REFRESH_FAILED',
      title: 'Token Refresh Failed',
      status: 401,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/auth/logout - Revoke active tokens (Authenticated)
 */
authRouter.post('/logout', authenticate, async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken as string | undefined;
  await authService.logout(req.token!, refreshToken);

  res.json({
    success: true,
    message: 'Session revoked. Token blacklisted.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/auth/me - Retrieve authenticated user identity & scopes (Authenticated)
 */
authRouter.get('/me', authenticate, (req: Request, res: Response) => {
  const user = authService.getUserById(req.user!.sub);
  res.json({
    success: true,
    data: {
      id: req.user!.sub,
      email: req.user!.email,
      name: req.user!.name,
      role: req.user!.role,
      institutionId: req.user!.institutionId,
      department: user?.department,
      mfaEnabled: user?.mfaEnabled || false,
      scopes: req.user!.scopes,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/auth/oidc/authorize - PKCE OIDC authorization initialization
 */
authRouter.post('/oidc/authorize', async (req: Request, res: Response) => {
  try {
    const parsed = pkceAuthorizeSchema.parse(req.body);
    const result = await authService.initiatePkce(parsed.redirectUri, parsed.codeChallenge, parsed.userEmail);

    res.json({
      success: true,
      data: result,
      message: 'PKCE authorization code initiated.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/OIDC_FAILED',
      title: 'PKCE Authorization Error',
      status: 400,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/auth/oidc/token - PKCE Authorization Code Exchange
 */
authRouter.post('/oidc/token', async (req: Request, res: Response) => {
  try {
    const { code, codeVerifier } = pkceTokenSchema.parse(req.body);
    const tokens = await authService.exchangePkce(code, codeVerifier);

    res.json({
      success: true,
      data: tokens,
      message: 'PKCE code successfully exchanged for JWT access and refresh tokens.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      type: 'https://satyasetu.gov.in/errors/PKCE_VERIFICATION_FAILED',
      title: 'PKCE Exchange Error',
      status: 401,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});
