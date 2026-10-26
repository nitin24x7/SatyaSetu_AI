import { applicationService } from '../services/applicationService';
import { complianceRuleEngine, ComplianceRuleEngine } from './ruleEngine';
import { ConcordanceMatcher } from './concordanceMatcher';
import { StatutoryCalculus } from './statutoryCalculus';
import {
  CadreCalculusResult,
  ComplianceEvaluationContext,
  ComplianceEvaluationSummary,
  ConcordanceReport,
  InfrastructureCalculusResult,
} from './types';

export class ComplianceService {
  private engine: ComplianceRuleEngine;

  constructor(engine?: ComplianceRuleEngine) {
    this.engine = engine || complianceRuleEngine;
  }

  /**
   * Evaluates an existing application dossier by its identifier
   */
  async evaluateApplication(applicationId: string): Promise<ComplianceEvaluationSummary | null> {
    const app = await applicationService.getApplicationById(applicationId);
    if (!app) return null;

    const institution = await applicationService.getInstitutionById(app.institutionId);

    const context: ComplianceEvaluationContext = {
      application: app,
      institution,
      documents: app.documents,
      idpResult: undefined, // uses extractedMetadata on documents if present
    };

    const summary = this.engine.evaluate(context);

    // Update riskLevel on application in state/store if it changed
    if (app.riskLevel !== summary.riskLevel) {
      app.riskLevel = summary.riskLevel;
    }

    return summary;
  }

  /**
   * Evaluates an ad-hoc or incoming payload
   */
  evaluatePayload(context: ComplianceEvaluationContext): ComplianceEvaluationSummary {
    return this.engine.evaluate(context);
  }

  /**
   * Dedicated string similarity & concordance cross-check
   */
  checkConcordance(declared: any, extractedEntities?: any): ConcordanceReport {
    return ConcordanceMatcher.match({ declared, extractedEntities });
  }

  /**
   * Dedicated cadre and Student-to-Faculty Ratio (SFR) calculus
   */
  calculateCadre(params: {
    totalStudents?: number;
    professors?: number;
    assocProfessors?: number;
    asstProfessors?: number;
    institutionType?: string;
  }): CadreCalculusResult {
    return StatutoryCalculus.evaluateCadre(params);
  }

  /**
   * Dedicated infrastructure square-meter carpet area calculus
   */
  calculateInfrastructure(params: {
    totalStudents?: number;
    actualBuiltCarpetArea?: number;
  }): InfrastructureCalculusResult {
    return StatutoryCalculus.evaluateInfrastructure(params);
  }

  /**
   * Returns list of all registered statutory compliance rules
   */
  getRegisteredRules() {
    return this.engine.getRules().map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      category: r.category,
      regulatoryStandard: r.regulatoryStandard,
      description: r.description,
      weight: r.weight,
    }));
  }
}

export const complianceService = new ComplianceService();
