import { request } from './client'

export interface InspirationItem {
  id: number
  title: string
  content: string
  tag: string
  source: string
  color: string
  pinned: boolean
  date: string
}

export interface InspirationItemInput {
  id?: number
  title: string
  content: string
  tag: string
  source: string
  color: string
  pinned: boolean
}

export interface InspirationTag {
  name: string
  count: number
}

export interface InspirationOverview {
  total: number
  monthAdded: number
  pinnedCount: number
  tagTotal: number
  tags: InspirationTag[]
  items: InspirationItem[]
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchInspirationOverview(): Promise<InspirationOverview> {
  return request<InspirationOverview>('/inspiration/overview')
}

export function saveInspirationItem(input: InspirationItemInput): Promise<{ id: number }> {
  return post<{ id: number }>('/inspiration/item/save', input)
}

export function deleteInspirationItem(id: number): Promise<unknown> {
  return post<unknown>('/inspiration/item/delete', { id })
}

export function pinInspirationItem(id: number, pinned: boolean): Promise<unknown> {
  return post<unknown>('/inspiration/item/pin', { id, pinned })
}
