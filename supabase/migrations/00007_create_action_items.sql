CREATE TYPE public.action_item_status AS ENUM (
    'pending', 'in_progress', 'completed', 'cancelled'
);

CREATE TYPE public.action_item_priority AS ENUM (
    'low', 'medium', 'high', 'urgent'
);

CREATE TYPE public.action_item_source AS ENUM (
    'manual', 'reflection', 'ai_generated'
);

CREATE TABLE public.action_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           TEXT NOT NULL,
    description     TEXT,
    status          public.action_item_status NOT NULL DEFAULT 'pending',
    priority        public.action_item_priority NOT NULL DEFAULT 'medium',
    due_date        DATE,
    source          public.action_item_source NOT NULL DEFAULT 'manual',
    reflection_id   UUID REFERENCES public.reflections(id) ON DELETE SET NULL,
    project_id      UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER action_items_updated_at
    BEFORE UPDATE ON public.action_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to action_items"
    ON public.action_items FOR ALL
    USING (true) WITH CHECK (true);
