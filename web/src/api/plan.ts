import { request } from './client'

export interface PlanCategory {
  id: number
  name: string
  color: string
  sortOrder: number
  taskCount: number
}

export interface PlanCategoryInput {
  id?: number
  name: string
  color: string
  sortOrder: number
}

export interface PlanTask {
  id: number
  title: string
  note: string
  status: number
  statusName: string
  dueDate: string
  categoryId: number
  category: string
  color: string
  sortOrder: number
}

export interface PlanColumn {
  status: number
  name: string
  count: number
  items: PlanTask[]
}

export interface PlanDay {
  date: string
  label: string
  weekday: string
  day: number
  items: PlanTask[]
}

export interface PlanWeek {
  start: string
  end: string
  label: string
}

export interface PlanBoardSummary {
  total: number
  done: number
  rate: number
}

export interface PlanBoard {
  week: PlanWeek
  summary: PlanBoardSummary
  categories: PlanCategory[]
  columns: PlanColumn[]
  timeline: PlanDay[]
}

export interface PlanTaskInput {
  id?: number
  title: string
  note: string
  status: number
  dueDate: string
  categoryId: number
  categoryName: string
}

/** 任务状态：1 待处理 2 进行中 3 已完成。 */
export const PLAN_STATUS = [
  { value: 1, name: '待处理' },
  { value: 2, name: '进行中' },
  { value: 3, name: '已完成' },
] as const

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchPlanBoard(week?: string): Promise<PlanBoard> {
  return request<PlanBoard>(`/plan/board${query({ week })}`)
}

export function fetchPlanCategories(): Promise<{ items: PlanCategory[] }> {
  return request<{ items: PlanCategory[] }>('/plan/categories')
}

export function fetchPlanTasks(params: { status?: number; categoryId?: number; keyword?: string } = {}): Promise<{ items: PlanTask[] }> {
  return request<{ items: PlanTask[] }>(`/plan/tasks${query({ ...params })}`)
}

export function savePlanCategory(input: PlanCategoryInput): Promise<{ id: number }> {
  return post<{ id: number }>('/plan/category/save', input)
}

export function deletePlanCategory(id: number): Promise<unknown> {
  return post<unknown>('/plan/category/delete', { id })
}

export function savePlanTask(input: PlanTaskInput): Promise<{ id: number }> {
  return post<{ id: number }>('/plan/task/save', input)
}

export function movePlanTask(id: number, status: number, sortOrder = -1): Promise<unknown> {
  return post<unknown>('/plan/task/move', { id, status, sortOrder })
}

export function deletePlanTask(id: number): Promise<unknown> {
  return post<unknown>('/plan/task/delete', { id })
}
