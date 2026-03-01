export const keys = {
  clients: {
    all: ['clients'] as const,
    detail: (id: string) => ['clients', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    clients: (id: string) => ['projects', id, 'clients'] as const,
  },
  travel: {
    all: ['travel'] as const,
  },
  reflections: {
    all: ['reflections'] as const,
    filtered: (params: object) => ['reflections', params] as const,
    detail: (id: string) => ['reflections', id] as const,
  },
  actionItems: {
    all: ['action-items'] as const,
    filtered: (params: object) => ['action-items', params] as const,
  },
}
