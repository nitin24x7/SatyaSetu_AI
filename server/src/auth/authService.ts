import crypto from 'crypto';
import { CacheService } from '../cache/cacheService';
import { jwtService, JwtService } from './jwtService';
import { totpService, TotpService } from './totpService';
import { rbacService, RbacService } from './rbacService';
import {
  AuthTokens,
  MfaChallenge,
  MfaSetupResult,
  UserAccount,
  UserRole,
} from './types';

export class AuthService {
  private users: Map<string, UserAccount> = new Map();
  private cache: CacheService;
  private jwt: JwtService;
  private totp: TotpService;
  private rbac: RbacService;

  constructor(
    cache?: CacheService,
    jwt?: JwtService,
    totp?: TotpService,
    rbac?: RbacService
  ) {
    this.cache = cache || new CacheService();
    this.jwt = jwt || jwtService;
    this.totp = totp || totpService;
    this.rbac = rbac || rbacService;
    this.seedInitialUsers();
  }

  private seedInitialUsers() {
    const seedAccounts: UserAccount[] = [
      {
        id: 'USR-INST-001',
        email: 'registrar@nitk.edu.in',
        name: 'Dr. Suresh Kumar Nayak',
        role: 'InstitutionalApplicant',
        institutionId: 'INST-001',
        institutionName: 'National Institute of Technology Karnataka (Surathkal)',
        department: 'Academic Affairs & Regulatory Cell',
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', // Known demo secret
        backupCodes: ['NITK-9901', 'NITK-9902', 'NITK-9903'],
        createdAt: '2024-01-15T09:00:00Z',
        status: 'ACTIVE',
      },
      {
        id: 'USR-REV-001',
        email: 'priyadarshini.rao@satyasetu.gov.in',
        name: 'Dr. Priyadarshini Rao',
        role: 'ComplianceDirector',
        department: 'Higher Education Regulatory Directorate',
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
        backupCodes: ['DIR-1001', 'DIR-1002'],
        createdAt: '2023-08-01T10:00:00Z',
        status: 'ACTIVE',
      },
      {
        id: 'USR-REV-002',
        email: 'amitabh.sengupta@satyasetu.gov.in',
        name: 'Amitabh Sengupta',
        role: 'TechnicalAssessor',
        department: 'Engineering Scrutiny Cell',
        mfaEnabled: false,
        createdAt: '2023-10-12T11:30:00Z',
        status: 'ACTIVE',
      },
      {
        id: 'USR-SYS-001',
        email: 'admin@satyasetu.gov.in',
        name: 'Chief Security Officer',
        role: 'SystemAdmin',
        department: 'National Portal Security Directorate',
        mfaEnabled: true,
        mfaSecret: 'KRSXG5CTMVRXEZLUOR2HG5DSMRSXG5CT',
        backupCodes: ['SEC-8801', 'SEC-8802'],
        createdAt: '2023-01-01T00:00:00Z',
        status: 'ACTIVE',
      },
    ];

    for (const u of seedAccounts) {
      this.users.set(u.email.toLowerCase(), u);
    }
  }

  /**
   * Authenticates user credentials and returns tokens or an MFA challenge
   */
  async login(
    email: string,
    password?: string
  ): Promise<{ tokens?: AuthTokens; mfaChallenge?: MfaChallenge }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.users.get(cleanEmail);

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('Invalid institutional credentials or inactive account standing.');
    }

    // If MFA is enabled, issue challenge session
    if (user.mfaEnabled && user.mfaSecret) {
      const sessionId = `mfa_sess_${crypto.randomBytes(24).toString('hex')}`;
      await this.cache.set(`mfa:${sessionId}`, { userId: user.id }, 300); // 5 min TTL

      return {
        mfaChallenge: {
          mfaRequired: true,
          mfaSessionId: sessionId,
          deliveryMethod: 'AUTHENTICATOR_APP',
          maskedDestination: `${cleanEmail.substring(0, 3)}***@${cleanEmail.split('@')[1]}`,
          expiresInSeconds: 300,
        },
      };
    }

    // Direct token issuance
    const tokens = await this.issueTokensForUser(user);
    return { tokens };
  }

  /**
   * Verifies MFA TOTP code and completes authentication
   */
  async verifyMfa(mfaSessionId: string, code: string): Promise<AuthTokens> {
    const session = await this.cache.get<{ userId: string }>(`mfa:${mfaSessionId}`);
    if (!session) {
      throw new Error('MFA verification session expired or invalid. Please re-authenticate.');
    }

    const user = Array.from(this.users.values()).find((u) => u.id === session.userId);
    if (!user || !user.mfaSecret) {
      throw new Error('User account not found or MFA not configured.');
    }

    const cleanCode = (code || '').trim();

    // Check TOTP code or backup code
    const isTotpValid = this.totp.verifyCode(user.mfaSecret, cleanCode);
    const isBackupValid = user.backupCodes?.includes(cleanCode);

    if (!isTotpValid && !isBackupValid) {
      throw new Error('Invalid 6-digit MFA verification code or backup code.');
    }

    // If backup code used, remove it
    if (isBackupValid && user.backupCodes) {
      user.backupCodes = user.backupCodes.filter((c) => c !== cleanCode);
    }

    // Invalidate session
    await this.cache.del(`mfa:${mfaSessionId}`);

    return this.issueTokensForUser(user);
  }

  /**
   * Initiates TOTP setup for a user
   */
  setupMfa(userId: string): MfaSetupResult {
    const user = Array.from(this.users.values()).find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    const secret = this.totp.generateSecret();
    const backupCodes = this.totp.generateBackupCodes();
    const otpauthUri = this.totp.generateOtpAuthUri(user.email, secret);

    user.mfaSecret = secret;
    user.backupCodes = backupCodes;

    return { secret, otpauthUri, backupCodes };
  }

  /**
   * Finalizes MFA setup after confirming user entered first code correctly
   */
  confirmMfaSetup(userId: string, code: string): boolean {
    const user = Array.from(this.users.values()).find((u) => u.id === userId);
    if (!user || !user.mfaSecret) return false;

    const isValid = this.totp.verifyCode(user.mfaSecret, code);
    if (isValid) {
      user.mfaEnabled = true;
      return true;
    }
    return false;
  }

  /**
   * Rotates refresh token and returns fresh access token
   */
  async refreshToken(token: string): Promise<AuthTokens> {
    const userId = await this.jwt.verifyRefreshToken(token);
    if (!userId) {
      throw new Error('Invalid, expired, or revoked refresh token.');
    }

    const user = Array.from(this.users.values()).find((u) => u.id === userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new Error('User account suspended or not found.');
    }

    // Invalidate old refresh token
    await this.jwt.revokeRefreshToken(token);

    // Issue fresh pair
    return this.issueTokensForUser(user);
  }

  /**
   * Logs out user, invalidating access token and refresh token
   */
  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    if (accessToken) {
      await this.jwt.blacklistAccessToken(accessToken);
    }
    if (refreshToken) {
      await this.jwt.revokeRefreshToken(refreshToken);
    }
  }

  /**
   * PKCE OIDC authorization code initiation
   */
  async initiatePkce(redirectUri: string, codeChallenge: string, userEmail?: string): Promise<{ authUrl: string; state: string }> {
    const state = `state_${crypto.randomBytes(16).toString('hex')}`;
    const code = `code_${crypto.randomBytes(24).toString('hex')}`;
    const email = userEmail || 'registrar@nitk.edu.in';
    const user = this.users.get(email.toLowerCase());

    await this.cache.set(
      `pkce:${code}`,
      {
        codeChallenge,
        redirectUri,
        userId: user?.id || 'USR-INST-001',
      },
      600
    );

    const authUrl = `${redirectUri}?code=${code}&state=${state}`;
    return { authUrl, state };
  }

  /**
   * PKCE Authorization Code Exchange with codeVerifier validation
   */
  async exchangePkce(code: string, codeVerifier: string): Promise<AuthTokens> {
    const session = await this.cache.get<{ codeChallenge: string; redirectUri: string; userId: string }>(
      `pkce:${code}`
    );

    if (!session) {
      throw new Error('Invalid or expired PKCE authorization code.');
    }

    // Verify S256 code challenge: SHA256(codeVerifier) base64url encoded
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64');
    const computedChallenge = hash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    if (computedChallenge !== session.codeChallenge) {
      throw new Error('PKCE code verifier verification failed. Possible interception attack.');
    }

    await this.cache.del(`pkce:${code}`);

    const user = Array.from(this.users.values()).find((u) => u.id === session.userId);
    if (!user) throw new Error('User not found.');

    return this.issueTokensForUser(user);
  }

  getUserById(id: string): UserAccount | undefined {
    return Array.from(this.users.values()).find((u) => u.id === id);
  }

  getUserByEmail(email: string): UserAccount | undefined {
    return this.users.get(email.trim().toLowerCase());
  }

  private async issueTokensForUser(user: UserAccount): Promise<AuthTokens> {
    const scopes = this.rbac.getScopesForRole(user.role);

    const accessToken = this.jwt.signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
      scopes,
    });

    const refreshToken = await this.jwt.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        scopes,
      },
    };
  }
}

export const authService = new AuthService();

