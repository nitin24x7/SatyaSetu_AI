import {
  ComplianceEvaluationContext,
  ComplianceEvaluationSummary,
  ComplianceRule,
  RuleEvaluationResult,
} from './types';
import { COMPLIANCE_RULES } from './ruleDefinitions';
import { ConcordanceMatcher } from './concordanceMatcher';
import { TemporalValidator } from './temporalValidator';
import { StatutoryCalculus } from './statutoryCalculus';

export class ComplianceRuleEngine {
  private rules: ComplianceRule[];

  constructor(customRules?: ComplianceRule[]) {
    this.rules = customRules || COMPLIANCE_RULES;
  }

  /**
   * Evaluates an application dossier against the active regulatory rulebook
   */
  evaluate(context: ComplianceEvaluationContext): ComplianceEvaluationSummary {
    const applicationId = context.application?.id || 'APP-2026-UNKNOWN';
    const institutionName =
      context.application?.institutionName ||
      context.institution?.name ||
      'National Institute of Technology Karnataka (Surathkal)';

    const findings: RuleEvaluationResult[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const rule of this.rules) {
      try {
        const result = rule.evaluate(context);
        findings.push(result);
        totalScore += result.scoreContribution;
        maxPossibleScore += result.maxScore;
      } catch (err: any) {
        findings.push({
          ruleId: rule.id,
          title: rule.title,
          category: rule.category,
          severity: 'Warning',
          status: 'Warning',
          scoreContribution: Math.round(rule.weight * 0.5),
          maxScore: rule.weight,
          evidence: `Evaluation warning: ${err.message}`,
          recommendedAction: 'Assessor manual inspection required.',
        });
        totalScore += Math.round(rule.weight * 0.5);
        maxPossibleScore += rule.weight;
      }
    }

    const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    const failCount = findings.filter((f) => f.status === 'Fail').length;
    const warningCount = findings.filter((f) => f.status === 'Warning').length;

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (failCount > 0 || overallScore < 65) {
      riskLevel = 'High';
    } else if (warningCount > 0 || overallScore < 85) {
      riskLevel = 'Medium';
    }

    let recommendedDecision: ComplianceEvaluationSummary['recommendedDecision'] = 'Approve';
    if (riskLevel === 'High') {
      recommendedDecision = failCount >= 2 ? 'Reject' : 'Priority Triage';
    } else if (riskLevel === 'Medium') {
      recommendedDecision = 'Request Corrections';
    }

    // Generate Concordance Report
    const concordanceReport = ConcordanceMatcher.match({
      declared: {
        institutionName,
        institutionType: context.application?.institutionType || context.institution?.institutionType,
        aisheCode: context.application?.aisheCode || context.institution?.aisheCode,
        registrationNumber: context.application?.registrationNumber || context.institution?.registrationNumber,
        academicYear: context.application?.academicYear,
      },
      extractedEntities: context.idpResult?.extractedEntities,
    });

    // Generate Calculus Reports
    const cadreCheck = StatutoryCalculus.evaluateCadre({
      institutionType: context.application?.institutionType,
    });

    const infrastructureCheck = StatutoryCalculus.evaluateInfrastructure({});

    const temporalChecks = TemporalValidator.evaluate(
      context.documents || context.application?.documents,
      context.application?.academicYear || '2026-2027'
    );

    return {
      applicationId,
      institutionName,
      evaluationTimestamp: new Date().toISOString(),
      overallScore,
      riskLevel,
      findings,
      concordanceReport,
      cadreCheck,
      infrastructureCheck,
      temporalChecks,
      recommendedDecision,
    };
  }

  getRules(): ComplianceRule[] {
    return this.rules;
  }
}

export const complianceRuleEngine = new ComplianceRuleEngine();
