import { PermissionScope, UserRole } from './types';

const ROLE_PERMISSIONS_MAP: Record<UserRole, PermissionScope[]> = {
  InstitutionalApplicant: [
    'applicant:submit',
    'applicant:read',
    'applicant:resubmit',
  ],
  ScrutinyOfficer: [
    'admin:review',
    'admin:corrections',
    'applicant:read',
  ],
  TechnicalAssessor: [
    'admin:review',
    'admin:corrections',
    'applicant:read',
  ],
  ComplianceDirector: [
    'admin:review',
    'admin:assign',
    'admin:corrections',
    'admin:decide',
    'admin:override',
    'applicant:read',
    'applicant:submit',
    'applicant:resubmit',
  ],
  SystemAdmin: [
    'applicant:submit',
    'applicant:read',
    'applicant:resubmit',
    'admin:review',
    'admin:assign',
    'admin:corrections',
    'admin:decide',
    'admin:override',
    'system:manage',
  ],
};

export class RbacService {
  /**
   * Retrieves all permission scopes granted to a given role
   */
  getScopesForRole(role: UserRole): PermissionScope[] {
    return ROLE_PERMISSIONS_MAP[role] || ['applicant:read'];
  }

  /**
   * Checks whether user scopes contain the specified required scope
   */
  hasScope(userScopes: PermissionScope[], required: PermissionScope): boolean {
    return userScopes.includes(required);
  }

  /**
   * Checks whether user scopes satisfy at least one of the required scopes
   */
  hasAnyScope(userScopes: PermissionScope[], required: PermissionScope[]): boolean {
    return required.some((scope) => userScopes.includes(scope));
  }

  /**
   * Checks whether user scopes satisfy all required scopes
   */
  hasAllScopes(userScopes: PermissionScope[], required: PermissionScope[]): boolean {
    return required.every((scope) => userScopes.includes(scope));
  }
}

export const rbacService = new RbacService();
