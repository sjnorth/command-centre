-- Clients
CREATE INDEX idx_clients_name ON public.clients (name);

-- Projects
CREATE INDEX idx_projects_status ON public.projects (status);

-- Travel plans
CREATE INDEX idx_travel_plans_dates ON public.travel_plans (start_date, end_date);

-- Reflections
CREATE INDEX idx_reflections_project_id ON public.reflections (project_id);
CREATE INDEX idx_reflections_client_id ON public.reflections (client_id);
CREATE INDEX idx_reflections_created_at ON public.reflections (created_at DESC);

-- Action items
CREATE INDEX idx_action_items_status ON public.action_items (status);
CREATE INDEX idx_action_items_priority ON public.action_items (priority);
CREATE INDEX idx_action_items_due_date ON public.action_items (due_date);
CREATE INDEX idx_action_items_project_id ON public.action_items (project_id);
CREATE INDEX idx_action_items_reflection_id ON public.action_items (reflection_id);

-- Note: ivfflat index on reflections.embedding deferred until data exists.
-- Add it later with:
-- CREATE INDEX idx_reflections_embedding ON public.reflections
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
