export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'on_hold' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface TravelPlan {
  id: string
  destination: string
  start_date: string | null
  end_date: string | null
  purpose: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Reflection {
  id: string
  content: string
  project_id: string | null
  client_id: string | null
  sentiment: string | null
  summary: string | null
  created_at: string
  updated_at: string
}

export interface ActionItem {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  source: 'manual' | 'reflection' | 'ai_generated'
  reflection_id: string | null
  project_id: string | null
  created_at: string
  updated_at: string
}

export interface AnalysisResponse {
  reflection: Reflection
  action_items: ActionItem[]
}

export type ClientCreate = {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export type ProjectCreate = {
  name: string
  description?: string
  status?: Project['status']
}

export type TravelPlanCreate = {
  destination: string
  start_date?: string
  end_date?: string
  purpose?: string
  notes?: string
}

export type ReflectionCreate = {
  content: string
  project_id?: string
  client_id?: string
}

export type ActionItemCreate = {
  title: string
  description?: string
  status?: ActionItem['status']
  priority?: ActionItem['priority']
  due_date?: string
  project_id?: string
}
