import { request } from './client'

export interface WorkspaceModule {
  key: string
  name: string
  icon: string
  color: string
  template: string
  sortOrder: number
  hidden: boolean
}

type ModuleList = { items: WorkspaceModule[] }

/** 模块列表包含已隐藏的模块，用于「添加模块」时加回。 */
export function fetchModules(): Promise<ModuleList> {
  return request<ModuleList>('/module/list')
}

export function addModule(key: string): Promise<ModuleList> {
  return request<ModuleList>('/module/add', { method: 'POST', body: JSON.stringify({ key }) })
}

/** 删除模块只做隐藏，数据仍保留。 */
export function hideModule(key: string): Promise<ModuleList> {
  return request<ModuleList>('/module/hide', { method: 'POST', body: JSON.stringify({ key }) })
}

export function sortModules(keys: string[]): Promise<ModuleList> {
  return request<ModuleList>('/module/sort', { method: 'POST', body: JSON.stringify({ keys }) })
}
