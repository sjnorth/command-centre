CREATE TABLE public.project_clients (
    project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, client_id)
);

ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to project_clients"
    ON public.project_clients FOR ALL
    USING (true) WITH CHECK (true);
