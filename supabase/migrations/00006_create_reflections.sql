CREATE TABLE public.reflections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content     TEXT NOT NULL,
    project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id   UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    sentiment   TEXT,
    embedding   vector(1536),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER reflections_updated_at
    BEFORE UPDATE ON public.reflections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to reflections"
    ON public.reflections FOR ALL
    USING (true) WITH CHECK (true);
