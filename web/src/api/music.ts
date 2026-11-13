import { request } from './client'

export interface MusicTrack {
  id: number
  title: string
  artist: string
  album: string
  playlist: string
  rating: number
  note: string
  color: string
  date: string
}

export interface MusicTrackInput {
  id?: number
  title: string
  artist: string
  album: string
  playlist: string
  rating: number
  note: string
  color: string
}

export interface MusicPlaylist {
  name: string
  count: number
}

export interface MusicOverview {
  total: number
  playlistCount: number
  artistCount: number
  avgRating: number
  playlists: MusicPlaylist[]
  items: MusicTrack[]
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchMusicOverview(): Promise<MusicOverview> {
  return request<MusicOverview>('/music/overview')
}

export function saveMusicTrack(input: MusicTrackInput): Promise<{ id: number }> {
  return post<{ id: number }>('/music/track/save', input)
}

export function deleteMusicTrack(id: number): Promise<unknown> {
  return post<unknown>('/music/track/delete', { id })
}
