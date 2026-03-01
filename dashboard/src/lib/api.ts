import type {
  ActionItem,
  ActionItemCreate,
  AnalysisResponse,
  Client,
  ClientCreate,
  Project,
  ProjectCreate,
  Reflection,
  ReflectionCreate,
  TravelPlan,
  TravelPlanCreate,
} from '@/types'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'
const API = `${BASE}/api/v1`

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(body?.detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const clientsApi = {
  list: () => request<Client[]>('/clients/'),
  get: (id: string) => request<Client>(`/clients/${id}`),
  create: (data: ClientCreate) =>
    request<Client>('/clients/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ClientCreate>) =>
    request<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
}

export const projectsApi = {
  list: () => request<Project[]>('/projects/'),
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (data: ProjectCreate) =>
    request<Project>('/projects/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ProjectCreate>) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  listClients: (id: string) => request<Client[]>(`/projects/${id}/clients`),
  linkClient: (projectId: string, clientId: string) =>
    request<void>(`/projects/${projectId}/clients/${clientId}`, { method: 'POST' }),
  unlinkClient: (projectId: string, clientId: string) =>
    request<void>(`/projects/${projectId}/clients/${clientId}`, { method: 'DELETE' }),
}

export const travelApi = {
  list: () => request<TravelPlan[]>('/travel-plans/'),
  get: (id: string) => request<TravelPlan>(`/travel-plans/${id}`),
  create: (data: TravelPlanCreate) =>
    request<TravelPlan>('/travel-plans/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<TravelPlanCreate>) =>
    request<TravelPlan>(`/travel-plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/travel-plans/${id}`, { method: 'DELETE' }),
}

export const reflectionsApi = {
  list: (params?: { project_id?: string; client_id?: string; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.project_id) qs.set('project_id', params.project_id)
    if (params?.client_id) qs.set('client_id', params.client_id)
    if (params?.limit) qs.set('limit', String(params.limit))
    return request<Reflection[]>(`/reflections/?${qs.toString()}`)
  },
  get: (id: string) => request<Reflection>(`/reflections/${id}`),
  create: (data: ReflectionCreate) =>
    request<Reflection>('/reflections/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ReflectionCreate>) =>
    request<Reflection>(`/reflections/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/reflections/${id}`, { method: 'DELETE' }),
  analyze: (id: string) =>
    request<AnalysisResponse>(`/reflections/${id}/analyze`, { method: 'POST' }),
}

export const actionItemsApi = {
  list: (params?: {
    status?: ActionItem['status']
    priority?: ActionItem['priority']
    project_id?: string
  }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.priority) qs.set('priority', params.priority)
    if (params?.project_id) qs.set('project_id', params.project_id)
    return request<ActionItem[]>(`/action-items/?${qs.toString()}`)
  },
  get: (id: string) => request<ActionItem>(`/action-items/${id}`),
  create: (data: ActionItemCreate) =>
    request<ActionItem>('/action-items/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ActionItemCreate & { status: ActionItem['status'] }>) =>
    request<ActionItem>(`/action-items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/action-items/${id}`, { method: 'DELETE' }),
}
