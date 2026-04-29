-- ================================================================
-- Bella Salon — Supabase setup
-- Pokreni u: Supabase Dashboard → SQL Editor → New query → Run
-- ================================================================

-- ENUMS (PostgreSQL ne podržava CREATE TYPE IF NOT EXISTS — koristimo DO blok)
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CLIENT', 'EMPLOYEE', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT         NOT NULL UNIQUE,
  "firstName"   TEXT         NOT NULL,
  "lastName"    TEXT         NOT NULL,
  phone         TEXT,
  role          "Role"       NOT NULL DEFAULT 'CLIENT',
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio         TEXT,
  "avatarUrl" TEXT,
  "isActive"  BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT           NOT NULL,
  description   TEXT,
  "durationMin" INTEGER        NOT NULL CHECK ("durationMin" > 0),
  price         DECIMAL(10,2)  NOT NULL CHECK (price >= 0),
  "isActive"    BOOLEAN        NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- EMPLOYEE ↔ SERVICE
CREATE TABLE IF NOT EXISTS public.employee_services (
  "employeeId" UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  "serviceId"  UUID NOT NULL REFERENCES public.services(id)  ON DELETE CASCADE,
  PRIMARY KEY ("employeeId", "serviceId")
);

-- WORKING HOURS
CREATE TABLE IF NOT EXISTS public.working_hours (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID        NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  "dayOfWeek"  "DayOfWeek" NOT NULL,
  "startTime"  TEXT        NOT NULL,
  "endTime"    TEXT        NOT NULL,
  "isActive"   BOOLEAN     NOT NULL DEFAULT TRUE,
  UNIQUE ("employeeId", "dayOfWeek"),
  CONSTRAINT time_order CHECK ("endTime" > "startTime")
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id           UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId"   UUID                NOT NULL REFERENCES public.users(id)     ON DELETE RESTRICT,
  "employeeId" UUID                NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  "serviceId"  UUID                NOT NULL REFERENCES public.services(id)  ON DELETE RESTRICT,
  "startTime"  TIMESTAMPTZ         NOT NULL,
  "endTime"    TIMESTAMPTZ         NOT NULL,
  status       "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  notes        TEXT,
  "createdAt"  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK ("endTime" > "startTime")
);

-- INDEKSI
CREATE INDEX IF NOT EXISTS idx_appt_emp_time ON public.appointments("employeeId","startTime","endTime");
CREATE INDEX IF NOT EXISTS idx_appt_client   ON public.appointments("clientId","startTime");
CREATE INDEX IF NOT EXISTS idx_appt_status   ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_wh_lookup     ON public.working_hours("employeeId","dayOfWeek","isActive");

-- OVERLAP TRIGGER
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE  "employeeId" = NEW."employeeId"
    AND    id           <> NEW.id
    AND    status       NOT IN ('CANCELLED','COMPLETED')
    AND    "startTime"  < NEW."endTime"
    AND    "endTime"    > NEW."startTime"
  ) THEN
    RAISE EXCEPTION 'Preklapanje termina za zaposlenog %', NEW."employeeId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_overlap_check ON public.appointments;
CREATE TRIGGER appointments_overlap_check
  BEFORE INSERT OR UPDATE OF "startTime","endTime","employeeId","status"
  ON public.appointments FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();

-- AUTO updatedAt
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- Policies (CREATE POLICY IF NOT EXISTS podržano od PG 9.4+)
DO $$ BEGIN
  CREATE POLICY "users: own profile"
    ON public.users FOR ALL USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users: admin all"
    ON public.users FOR ALL
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "employees: public read"
    ON public.employees FOR SELECT USING ("isActive" = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "services: public read"
    ON public.services FOR SELECT USING ("isActive" = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "working_hours: public read"
    ON public.working_hours FOR SELECT USING ("isActive" = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "appointments: own"
    ON public.appointments FOR ALL USING (auth.uid() = "clientId");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "appointments: admin all"
    ON public.appointments FOR ALL
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SEED — demo usluge
INSERT INTO public.services (name, description, "durationMin", price) VALUES
  ('Šišanje',         'Muško i žensko šišanje, blow-dry.',  30,  1200),
  ('Bojenje kose',    'Balayage, pramenovi, puna boja.',    90,  3500),
  ('Manikir',         'Klasični manikir, gel lak.',         45,  1500),
  ('Tretman lica',    'Dubinsko čišćenje, hidratacija.',    60,  2500),
  ('Depilacija nogu', 'Voskom ili šećernom pastom.',        60,  2000)
ON CONFLICT DO NOTHING;

-- Provjera
SELECT 'Setup završen!' AS status,
       (SELECT count(*) FROM public.services) AS usluge;
