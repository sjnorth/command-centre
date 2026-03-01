CREATE TABLE public.travel_plans (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination TEXT NOT NULL,
    start_date  DATE,
    end_date    DATE,
    purpose     TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER travel_plans_updated_at
    BEFORE UPDATE ON public.travel_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to travel_plans"
    ON public.travel_plans FOR ALL
    USING (true) WITH CHECK (true);
