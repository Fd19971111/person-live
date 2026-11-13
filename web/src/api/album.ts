import { request, upload } from './client'

export interface AlbumCategory {
  id: number
  name: string
  color: string
  count: number
}

export interface AlbumPhoto {
  id: number
  url: string
  category: string
  name: string
  note: string
  sizeBytes: number
  sizeText: string
  date: string
}

export interface AlbumOverview {
  total: number
  sizeBytes: number
  sizeText: string
  categories: AlbumCategory[]
  photos: AlbumPhoto[]
}

export interface AlbumPhotoInput {
  id: number
  category: string
  note: string
}

export interface AlbumCategoryInput {
  id?: number
  name: string
  color: string
}

export function fetchAlbumOverview(): Promise<AlbumOverview> {
  return request<AlbumOverview>('/album/overview')
}

/** 上传单张照片，category 为空表示未分类。 */
export function uploadAlbumPhoto(file: File, category: string, note: string): Promise<{ id: number }> {
  const form = new FormData()
  form.append('file', file)
  form.append('category', category)
  form.append('note', note)
  return upload<{ id: number }>('/album/photo/upload', form)
}

export function saveAlbumPhoto(input: AlbumPhotoInput): Promise<{ id: number }> {
  return request<{ id: number }>('/album/photo/save', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteAlbumPhoto(id: number): Promise<unknown> {
  return request<unknown>('/album/photo/delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function saveAlbumCategory(input: AlbumCategoryInput): Promise<{ id: number }> {
  return request<{ id: number }>('/album/category/save', {
    method: 'POST',
    body: JSON.stringify({ id: input.id ?? 0, name: input.name, color: input.color }),
  })
}

export function deleteAlbumCategory(id: number): Promise<unknown> {
  return request<unknown>('/album/category/delete', { method: 'POST', body: JSON.stringify({ id }) })
}
