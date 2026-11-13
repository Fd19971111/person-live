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
  return request<FinanceOverview>(`/finance/overview${query({ month })}`)
}

export interface FinanceCategory {
  id: number
  name: string
  kind: number
  color: string
  sortOrder: number
  transactionCount: number
}

export interface FinanceCategoryInput {
  id?: number
  name: string
  kind: number
  color: string
  sortOrder: number
}

export interface FinanceTransactionRow {
  id: number
  date: string
  title: string
  category: string
  categoryId: number
  type: number
  amountCents: number
  note: string
}

export interface FinanceTransactionQuery {
  month?: string
  type?: number
  categoryId?: number
  keyword?: string
  page?: number
  pageSize?: number
}

export interface FinanceTransactionList {
  items: FinanceTransactionRow[]
  total: number
  page: number
  pageSize: number
  incomeCents: number
  expenseCents: number
}

export interface FinanceTransactionInput {
  id?: number
  type: number
  categoryId: number
  categoryName?: string
  amountCents: number
  title: string
  note: string
  date: string
}

export interface ImportRow {
  line: number
  date: string
  typeName: string
  category: string
  amountCents: number
  title: string
  note: string
  status: 'ok' | 'duplicate' | 'error'
  message: string
}

export interface ImportPreview {
  total: number
  validCount: number
  duplicateCount: number
  errorCount: number
  newCategories: string[]
  rows: ImportRow[]
  guide: string
  filename: string
  columns: string[]
}

export interface ImportCommitResult {
  imported: number
  skipped: number
  errorCount: number
  newCategories: string[]
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 0) {
      search.set(key, String(value))
    }
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

/** 浏览器直接下载 CSV，统一补 UTF-8 BOM 以便 Excel 正确识别中文。 */
export function downloadCsv(filename: string, content: string): void {
  const text = content.replace(/^\uFEFF/, '')
  const blob = new Blob([`\uFEFF${text}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function fetchFinanceCategories(): Promise<{ items: FinanceCategory[] }> {
  return request<{ items: FinanceCategory[] }>('/finance/categories')
}

export function saveFinanceCategory(input: FinanceCategoryInput): Promise<{ id: number }> {
  return post<{ id: number }>('/finance/category/save', input)
}

export function deleteFinanceCategory(id: number): Promise<unknown> {
  return post<unknown>('/finance/category/delete', { id })
}

export function fetchFinanceTransactions(params: FinanceTransactionQuery): Promise<FinanceTransactionList> {
  return request<FinanceTransactionList>(`/finance/transactions${query({ ...params })}`)
}

export function saveFinanceTransaction(input: FinanceTransactionInput): Promise<{ id: number }> {
  return post<{ id: number }>('/finance/transaction/save', input)
}

export function deleteFinanceTransaction(id: number): Promise<unknown> {
  return post<unknown>('/finance/transaction/delete', { id })
}

export function fetchImportTemplate(): Promise<{ filename: string; content: string; guide: string }> {
  return request<{ filename: string; content: string; guide: string }>('/finance/import-template')
}

export function previewFinanceImport(content: string): Promise<ImportPreview> {
  return post<ImportPreview>('/finance/import/preview', { content })
}

export function commitFinanceImport(content: string): Promise<ImportCommitResult> {
  return post<ImportCommitResult>('/finance/import/commit', { content })
}

export function fetchFinanceExport(params: FinanceTransactionQuery): Promise<{ filename: string; content: string; total: number }> {
  return request<{ filename: string; content: string; total: number }>(
    `/finance/export${query({ month: params.month, type: params.type, categoryId: params.categoryId, keyword: params.keyword })}`,
  )
}
