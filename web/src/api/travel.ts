import { request } from './client'

export interface TravelTrip {
  id: number
  title: string
  region: string
  visitedOn: string
  date: string
  year: number
  days: number
  rating: number
  note: string
  color: string
}

export interface TravelTripInput {
  id?: number
  title: string
  region: string
  visitedOn: string
  days: number
  rating: number
  note: string
  color: string
}

export interface TravelOverview {
  total: number
  placeCount: number
  totalDays: number
  yearCount: number
  year: number
  avgRating: number
  items: TravelTrip[]
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchTravelOverview(): Promise<TravelOverview> {
  return request<TravelOverview>('/travel/overview')
}

export function saveTravelTrip(input: TravelTripInput): Promise<{ id: number }> {
  return post<{ id: number }>('/travel/trip/save', input)
}

export function deleteTravelTrip(id: number): Promise<unknown> {
  return post<unknown>('/travel/trip/delete', { id })
}
