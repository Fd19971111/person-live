import { request } from './client'

export interface FinanceTrendPoint {
  month: string
  label: string
  incomeCents: number
  expenseCents: number
}

export interface FinanceCategoryShare {
  name: string
  color: string
  amountCents: number
  percent: number
}

export interface FinanceTransaction {
  id: number
  date: string
  title: string
  category: string
  type: number
  amountCents: number
}

export interface FinanceOverview {
  month: string
  incomeCents: number
  expenseCents: number
  balanceCents: number
  incomeChangePct: number
  expenseChangePct: number
  balanceChangePct: number
  balanceRate: number
  totalCount: number
  trend: FinanceTrendPoint[]
  categories: FinanceCategoryShare[]
  recent: FinanceTransaction[]
}

/** 读取记账总览，month 形如 2026-11，不传则取当月。 */
export function fetchFinanceOverview(month?: string): Promise<FinanceOverview> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  return request<FinanceOverview>(`/finance/overview${query}`)
}
