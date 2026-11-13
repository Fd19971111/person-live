import { request } from './client'

export const MOVIE_STATUS = {
  want: 1,
  watching: 2,
  watched: 3,
} as const

export interface MovieItem {
  id: number
  title: string
  year: number
  genre: string
  director: string
  rating: number
  status: number
  statusName: string
  note: string
  color: string
  date: string
}

export interface MovieItemInput {
  id?: number
  title: string
  year: number
  genre: string
  director: string
  rating: number
  status: number
  note: string
  color: string
}

export interface MovieStatusCount {
  status: number
  name: string
  count: number
}

export interface MoviesOverview {
  total: number
  wantCount: number
  watchingCount: number
  watchedCount: number
  avgRating: number
  statuses: MovieStatusCount[]
  items: MovieItem[]
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchMoviesOverview(): Promise<MoviesOverview> {
  return request<MoviesOverview>('/movies/overview')
}

export function saveMovieItem(input: MovieItemInput): Promise<{ id: number }> {
  return post<{ id: number }>('/movies/item/save', input)
}

export function deleteMovieItem(id: number): Promise<unknown> {
  return post<unknown>('/movies/item/delete', { id })
}

export function setMovieStatus(id: number, status: number): Promise<unknown> {
  return post<unknown>('/movies/item/status', { id, status })
}
