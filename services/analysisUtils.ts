
import { AppData, ValueWheel, AIAlert, View } from '../types';

export interface ReliableFitMetrics {
  totalFit: number;
  domainScore: number;
  executionScore: number;
  coverageScore: number;
  dataConfidence: number;
  status: 'Kritiek' | 'Instabiel' | 'Stabiel' | 'Optimaal';
  breakdown: string;
}

export const calculateReliableFitScore = (data: AppData): ReliableFitMetrics => {
  const avgDomain = data.fitCheckScores.length > 0 
    ? (data.fitCheckScores.reduce((acc, curr) => acc + curr.score, 0) / data.fitCheckScores.length) * 20
    : 40; 

  const totalActions = data.actions.length;
  const completedActions = data.actions.filter(a => a.status === 'done').length;
  const overdueActions = data.actions.filter(a => a.status !== 'done' && new Date(a.deadline) < new Date()).length;
  
  let executionBase = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  const overduePenalty = Math.min(25, overdueActions * 5);
  const executionScore = totalActions === 0 ? 50 : Math.max(0, executionBase - overduePenalty);

  const totalGoals = data.strategicGoals.length;
  const goalsWithKpi = data.strategicGoals.filter(g => !!g.kpiId).length;
  const goalsWithActions = data.strategicGoals.filter(g => data.actions.some(a => a.linkedId === g.id)).length;
  
  const coverageBase = totalGoals > 0 
    ? ((goalsWithKpi / totalGoals) * 50) + ((goalsWithActions / totalGoals) * 50)
    : 0;
  const coverageScore = coverageBase;

  let confidencePoints = 0;
  if (data.mission) confidencePoints += 20;
  if (data.vision) confidencePoints += 20;
  if (data.strategicGoals.length > 0) confidencePoints += 20;
  if (data.fitCheckScores.length > 0) confidencePoints += 20;
  if (data.actions.length > 0) confidencePoints += 20;
  const dataConfidence = confidencePoints;

  const totalFit = Math.round((avgDomain * 0.4) + (executionScore * 0.3) + (coverageScore * 0.3));

  let status: ReliableFitMetrics['status'] = 'Instabiel';
  if (totalFit < 35) status = 'Kritiek';
  else if (totalFit > 50 && totalFit <= 75) status = 'Stabiel';
  else if (totalFit > 75) status = 'Optimaal';

  let breakdown = "";
  if (status === 'Kritiek') {
    breakdown = "Kritieke mismatch gedetecteerd. De executiekracht en strategische dekking zijn onvoldoende om de ambities te realiseren.";
  } else if (status === 'Optimaal') {
    breakdown = "Uitstekende synergie. De organisatie is optimaal ingericht en de executie verloopt volgens plan.";
  } else if (status === 'Stabiel') {
    breakdown = "Stabiele operatie. Er is een solide basis, maar focus op het verhogen van de executiesnelheid is aanbevolen.";
  } else {
    breakdown = "Waarschuwing: Er is een aanzienlijke 'gap' tussen de gestelde doelen en de huidige inrichting/voortgang.";
  }

  return {
    totalFit,
    domainScore: Math.round(avgDomain),
    executionScore: Math.round(executionScore),
    coverageScore: Math.round(coverageScore),
    dataConfidence,
    status,
    breakdown
  };
};

export const generateSystemAlerts = (data: AppData): AIAlert[] => {
  const alerts: AIAlert[] = [];

  data.strategicGoals.forEach(goal => {
    if (!goal.kpiId) {
      alerts.push({
        id: `goal_no_kpi_${goal.id}`,
        type: 'info',
        priority: 2,
        title: 'Doel zonder KPI',
        message: `Het doel "${goal.description}" heeft nog geen meetbare KPI.`,
        linkedTo: goal.id,
        actionLabel: 'Koppel KPI',
        actionView: View.FOCUS
      });
    }
    const hasActions = data.actions.some(a => a.linkedId === goal.id);
    if (!hasActions) {
      alerts.push({
        id: `goal_no_actions_${goal.id}`,
        type: 'warning',
        priority: 1,
        title: 'Geen executie op doel',
        message: `Er zijn geen acties gekoppeld aan het doel "${goal.description}".`,
        linkedTo: goal.id,
        actionLabel: 'Plan Actie',
        actionView: View.TRANSITIE
      });
    }
  });

  const overdueCount = data.actions.filter(a => a.status !== 'done' && new Date(a.deadline) < new Date()).length;
  if (overdueCount > 0) {
    alerts.push({
      id: 'overdue_actions',
      type: 'warning',
      priority: 1,
      title: 'Executie vertraging',
      message: `Er zijn ${overdueCount} acties over de deadline heen. Dit beïnvloedt de FIT score negatief.`,
      actionLabel: 'Bekijk Acties',
      actionView: View.TRANSITIE
    });
  }

  data.fitCheckScores.forEach(score => {
    if (score.score <= 2) {
      alerts.push({
        id: `low_domain_${score.domain}`,
        type: 'warning',
        priority: 1,
        title: `Kritiek Domein: ${score.domain}`,
        message: `De FIT-score op ${score.domain} is kritiek laag (${score.score}/5).`,
        actionLabel: 'Bekijk Audit',
        actionView: View.FITCHECK
      });
    }
  });

  return alerts.sort((a, b) => a.priority - b.priority);
};
