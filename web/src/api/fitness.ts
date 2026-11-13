import { request } from './client'

export interface FitnessRecord {
  id: number
  activity: string
  minutes: number
  distanceKm: number
  calories: number
  performedOn: string
  date: string
  weekday: string
  note: string
  color: string
}

export interface FitnessRecordInput {
  id?: number
  activity: string
  minutes: number
  distanceKm: number
  calories: number
  performedOn: string
  note: string
  color: string
}

export interface FitnessDayStat {
  date: string
  weekday: string
  minutes: number
  level: number
}

export interface FitnessOverview {
  total: number
  totalMinutes: number
  weekMinutes: number
  monthMinutes: number
  streakDays: number
  heatmap: FitnessDayStat[]
  items: FitnessRecord[]
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchFitnessOverview(): Promise<FitnessOverview> {
  return request<FitnessOverview>('/fitness/overview')
}

export function saveFitnessRecord(input: FitnessRecordInput): Promise<{ id: number }> {
  return post<{ id: number }>('/fitness/record/save', input)
}

export function deleteFitnessRecord(id: number): Promise<unknown> {
  return post<unknown>('/fitness/record/delete', { id })
}
