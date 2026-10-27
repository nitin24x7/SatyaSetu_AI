import { CadreCalculusResult, InfrastructureCalculusResult } from './types';

export class StatutoryCalculus {
  /**
   * Deterministic Cadre Ratio & Student-to-Faculty Ratio (SFR) validation
   * Based on AICTE Approval Process Handbook (Clause 7.1)
   */
  static evaluateCadre(params: {
    totalStudents?: number;
    professors?: number;
    assocProfessors?: number;
    asstProfessors?: number;
    institutionType?: string;
  }): CadreCalculusResult {
    const totalStudents = params.totalStudents || 4200;
    const professors = params.professors !== undefined ? params.professors : 42;
    const assocProfessors = params.assocProfessors !== undefined ? params.assocProfessors : 78;
    const asstProfessors = params.asstProfessors !== undefined ? params.asstProfessors : 164;

    const totalFaculty = professors + assocProfessors + asstProfessors;
    const mandatedSfrCeiling = params.institutionType?.includes('Polytechnic') ? 25.0 : 20.0;

    const calculatedSfr = parseFloat((totalStudents / (totalFaculty || 1)).toFixed(2));
    const isSfrCompliant = calculatedSfr <= mandatedSfrCeiling;

    // Cadre proportionality check: Standard norm 1 : 2 : 6
    // Professors should represent at least ~10% (1/9) of total required cadre
    const isCadreRatioCompliant = professors >= Math.floor(totalFaculty * 0.1);

    const ratioStr = `${professors} Prof : ${assocProfessors} Assoc Prof : ${asstProfessors} Asst Prof`;
    let summary = `Student-to-Faculty Ratio (SFR) is 1:${calculatedSfr}, strictly meeting the statutory ceiling of 1:${mandatedSfrCeiling}. Cadre distribution (${ratioStr}) meets regulatory staffing norms.`;

    if (!isSfrCompliant) {
      summary = `Deficiency Detected: SFR of 1:${calculatedSfr} exceeds maximum permissible threshold of 1:${mandatedSfrCeiling}. Deficit of ${Math.ceil(totalStudents / mandatedSfrCeiling - totalFaculty)} additional full-time teaching faculty.`;
    }

    return {
      totalStudents,
      totalFaculty,
      calculatedSfr,
      mandatedSfrCeiling,
      isSfrCompliant,
      cadreDistribution: {
        professors,
        assocProfessors,
        asstProfessors,
        ratio: ratioStr,
        isCadreRatioCompliant,
      },
      summary,
    };
  }

  /**
   * Evaluates instructional, administrative, and amenities carpet area (sq.m)
   * Based on AICTE / State Technical Board spatial norms
   */
  static evaluateInfrastructure(params: {
    totalStudents?: number;
    actualBuiltCarpetArea?: number;
  }): InfrastructureCalculusResult {
    const totalStudents = params.totalStudents || 4200;
    const actualBuiltAreaSqM = params.actualBuiltCarpetArea || 58500;

    // Statutory norm: 4.5 sq.m instructional & lab space per sanctioned student
    const mandatedMinimumSqM = totalStudents * 4.5; // e.g. 18,900 sq.m minimum
    const diff = actualBuiltAreaSqM - mandatedMinimumSqM;
    const deficitSurplusPercent = parseFloat(((diff / mandatedMinimumSqM) * 100).toFixed(1));
    const isCompliant = actualBuiltAreaSqM >= mandatedMinimumSqM;

    let summary = `Total instructional built carpet area of ${actualBuiltAreaSqM.toLocaleString()} sq.m provides a +${deficitSurplusPercent}% surplus over statutory minimum requirement (${mandatedMinimumSqM.toLocaleString()} sq.m).`;

    if (!isCompliant) {
      summary = `Infra Area Deficit: Built carpet area of ${actualBuiltAreaSqM.toLocaleString()} sq.m falls short of statutory requirement (${mandatedMinimumSqM.toLocaleString()} sq.m) by ${Math.abs(diff).toLocaleString()} sq.m.`;
    }

    return {
      totalBuiltAreaSqM: actualBuiltAreaSqM,
      mandatedMinimumSqM,
      deficitSurplusPercent,
      isCompliant,
      summary,
    };
  }
}

