/**
 * SatyaSetu AI: Institutional Identity, Statutory Integrations & Security Hardening
 * Phase 6 Core Types
 */

export type UserRole =
  | 'InstitutionalApplicant'
  | 'ScrutinyOfficer'
  | 'TechnicalAssessor'
  | 'ComplianceDirector'
  | 'SystemAdmin';

export type PermissionScope =
  | 'applicant:submit'
  | 'applicant:read'
  | 'applicant:resubmit'
  | 'admin:review'
  | 'admin:assign'
  | 'admin:corrections'
  | 'admin:decide'
  | 'admin:override'
  | 'system:manage';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  department?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string;
  scopes: PermissionScope[];
  iat?: number;
  exp?: number;
  iss?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // in seconds
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    institutionId?: string;
    scopes: PermissionScope[];
  };
}

export interface MfaChallenge {
  mfaRequired: true;
  mfaSessionId: string;
  deliveryMethod: 'AUTHENTICATOR_APP' | 'SMS_OTP';
  maskedDestination: string;
  expiresInSeconds: number;
}

export interface MfaSetupResult {
  secret: string;
  otpauthUri: string;
  backupCodes: string[];
}

export interface PkceSession {
  code: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  redirectUri: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}
