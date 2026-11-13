import { request } from './client'

export interface StudyCourse {
  id: number
  title: string
  unitLabel: string
  totalUnits: number
  doneUnits: number
  progress: number
  color: string
  sortOrder: number
}

export interface StudyCourseInput {
  id?: number
  title: string
  unitLabel: string
  totalUnits: number
  doneUnits: number
  color: string
  sortOrder: number
}

export interface StudyNote {
  id: number
  title: string
  tag: string
  content: string
  date: string
}

export interface StudyNoteInput {
  id?: number
  title: string
  tag: string
  content: string
}

export interface StudySession {
  id: number
  date: string
  minutes: number
  courseId: number
  course: string
  note: string
}

export interface StudySessionInput {
  id?: number
  date: string
  minutes: number
  courseId: number
  courseName: string
  note: string
}

export interface StudyDayStat {
  date: string
  weekday: string
  minutes: number
  level: number
}

export interface StudyOverview {
  month: string
  monthMinutes: number
  monthTargetMinutes: number
  monthRate: number
  changeMinutes: number
  streakDays: number
  weekMinutes: number
  weekGoalMinutes: number
  weekRate: number
  weekDays: StudyDayStat[]
  heatmap: StudyDayStat[]
  courses: StudyCourse[]
  notes: StudyNote[]
}

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

export function fetchStudyOverview(): Promise<StudyOverview> {
  return request<StudyOverview>('/study/overview')
}

export function fetchStudySessions(month?: string): Promise<{ items: StudySession[]; totalMinutes: number }> {
  return request<{ items: StudySession[]; totalMinutes: number }>(`/study/sessions${query({ month })}`)
}

export function saveStudySession(input: StudySessionInput): Promise<{ id: number }> {
  return post<{ id: number }>('/study/session/save', input)
}

export function deleteStudySession(id: number): Promise<unknown> {
  return post<unknown>('/study/session/delete', { id })
}

export function fetchStudyCourses(): Promise<{ items: StudyCourse[] }> {
  return request<{ items: StudyCourse[] }>('/study/courses')
}

export function saveStudyCourse(input: StudyCourseInput): Promise<{ id: number }> {
  return post<{ id: number }>('/study/course/save', input)
}

export function deleteStudyCourse(id: number): Promise<unknown> {
  return post<unknown>('/study/course/delete', { id })
}

export function fetchStudyNotes(): Promise<{ items: StudyNote[] }> {
  return request<{ items: StudyNote[] }>('/study/notes')
}

export function saveStudyNote(input: StudyNoteInput): Promise<{ id: number }> {
  return post<{ id: number }>('/study/note/save', input)
}

export function deleteStudyNote(id: number): Promise<unknown> {
  return post<unknown>('/study/note/delete', { id })
}

export function saveStudyGoal(weeklyGoalMinutes: number): Promise<{ weeklyGoalMinutes: number }> {
  return post<{ weeklyGoalMinutes: number }>('/study/goal/save', { weeklyGoalMinutes })
}
