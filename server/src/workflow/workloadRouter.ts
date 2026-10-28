/**
 * SatyaSetu AI — Phase 8: Workload Balancing & Automated Case Routing Engine
 * Distributes Applications across Assessors based on Discipline Specialization, Capacity & SLA Performance
 */

import { ReviewerWorkloadProfile, AutoAssignmentResult } from './types';
import { INITIAL_REVIEWERS } from '../mock/seedData';

export class WorkloadRouter {
  private reviewers: Map<string, ReviewerWorkloadProfile> = new Map();

  constructor() {
    this.initializeDefaultRoster();
  }

  private initializeDefaultRoster(): void {
    const disciplineMap: Record<string, string[]> = {
      'REV-001': ['Technical & Engineering', 'Autonomous Engineering College', 'Affiliated Technical Institute'],
      'REV-002': ['University Governance', 'Central University', 'State University', 'Deemed University'],
      'REV-003': ['Polytechnic & Vocational', 'Polytechnic Institute', 'Technical & Engineering'],
      'REV-004': ['Management & Computer Applications', 'Management Institute', 'Deemed University'],
    };

    INITIAL_REVIEWERS.forEach((rev, idx) => {
      const disciplines = disciplineMap[rev.id] || ['Technical & Engineering', 'General Compliance'];
      const maxCapacity = 10;
      const currentActive = rev.activeCasesCount || (2 + (idx * 2));
      const utilization = Math.min(1.0, Number((currentActive / maxCapacity).toFixed(2)));
      const adherence = Number((0.92 + (idx * 0.02)).toFixed(2)); // 92% - 98% on-time rate

      this.reviewers.set(rev.id, {
        reviewerId: rev.id,
        name: rev.name,
        email: rev.email,
        department: rev.department,
        disciplines,
        currentActiveCases: currentActive,
        maxCapacity,
        utilizationRate: utilization,
        slaAdherenceScore: adherence,
        isAvailable: currentActive < maxCapacity,
      });
    });
  }

  /**
   * Retrieve all reviewer workload profiles.
   */
  getReviewerProfiles(): ReviewerWorkloadProfile[] {
    return Array.from(this.reviewers.values());
  }

  /**
   * Find the optimal reviewer for an application using weighted multi-criteria routing.
   */
  findOptimalReviewer(application: any): AutoAssignmentResult {
    const profiles = this.getReviewerProfiles();
    if (profiles.length === 0) {
      throw new Error('No active reviewers registered in regulatory directorate.');
    }

    const appType = application.institutionType || 'Autonomous Engineering College';
    const appDiscipline = application.purpose || 'Technical & Engineering';

    const scoredReviewers = profiles.map((rev) => {
      // 1. Capacity availability factor (45% weight)
      // Lower utilization yields higher score
      const capacityScore = Math.max(0, 1.0 - rev.utilizationRate);

      // 2. Discipline match factor (35% weight)
      const hasDirectDiscipline = rev.disciplines.some(
        (d) =>
          d.toLowerCase().includes(appType.toLowerCase()) ||
          appType.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(appDiscipline.toLowerCase())
      );
      const disciplineScore = hasDirectDiscipline ? 1.0 : 0.4;

      // 3. Historical SLA Adherence factor (20% weight)
      const adherenceScore = rev.slaAdherenceScore;

      // Weighted total (0.0 to 1.0)
      const totalScore = capacityScore * 0.45 + disciplineScore * 0.35 + adherenceScore * 0.20;
      const normalizedScore = Math.round(totalScore * 100);

      return {
        reviewer: rev,
        score: normalizedScore,
        disciplineMatched: hasDirectDiscipline,
        isOverCapacity: rev.currentActiveCases >= rev.maxCapacity,
      };
    });

    // Sort descending by score, prioritizing non-overcapacity reviewers
    scoredReviewers.sort((a, b) => {
      if (a.isOverCapacity && !b.isOverCapacity) return 1;
      if (!a.isOverCapacity && b.isOverCapacity) return -1;
      return b.score - a.score;
    });

    const bestMatch = scoredReviewers[0];
    const selected = bestMatch.reviewer;

    // Increment active case count
    this.adjustReviewerLoad(selected.reviewerId, 1);

    const reason = bestMatch.disciplineMatched
      ? `Highest match score (${bestMatch.score}/100) with domain expertise in ${selected.department} and ${(100 - selected.utilizationRate * 100).toFixed(0)}% available capacity.`
      : `Assigned based on lowest queue backlog (${selected.currentActiveCases}/${selected.maxCapacity} cases) and high historical SLA compliance (${(selected.slaAdherenceScore * 100).toFixed(0)}%).`;

    return {
      applicationId: application.id,
      assignedReviewerId: selected.reviewerId,
      assignedReviewerName: selected.name,
      department: selected.department,
      matchScore: bestMatch.score,
      assignmentReason: reason,
      assignedAt: new Date().toISOString(),
    };
  }

  /**
   * Adjust active case workload for a reviewer.
   */
  adjustReviewerLoad(reviewerId: string, delta: number): void {
    const rev = this.reviewers.get(reviewerId);
    if (!rev) return;

    rev.currentActiveCases = Math.max(0, rev.currentActiveCases + delta);
    rev.utilizationRate = Math.min(1.0, Number((rev.currentActiveCases / rev.maxCapacity).toFixed(2)));
    rev.isAvailable = rev.currentActiveCases < rev.maxCapacity;
  }
}

export const workloadRouter = new WorkloadRouter();
