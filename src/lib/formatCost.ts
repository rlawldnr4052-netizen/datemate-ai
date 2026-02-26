import { BudgetLevel } from '@/types/onboarding'

export function formatCost(cost: number): string {
  if (cost === 0) return '무료'
  if (cost >= 10000) {
    const man = cost / 10000
    const display = man % 1 === 0 ? man.toString() : man.toFixed(1)
    return `약 ${display}만원`
  }
  return `약 ${cost.toLocaleString()}원`
}

export const BUDGET_RANGES: Record<BudgetLevel, { min: number; max: number; label: string }> = {
  budget: { min: 0, max: 30000, label: '~3만원' },
  moderate: { min: 30000, max: 70000, label: '3~7만원' },
  premium: { min: 70000, max: Infinity, label: '7만원+' },
}
