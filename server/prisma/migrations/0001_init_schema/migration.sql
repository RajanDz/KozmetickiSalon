-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "DayOfWeek" AS ENUM (
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
  'FRIDAY', 'SATURDAY', 'SUNDAY'
);

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────

CREATE TABLE "users" (
  "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
  "email"        TEXT         NOT NULL,
  "passwordHash" TEXT         NOT NULL,
  "firstName"    TEXT         NOT NULL,
  "lastName"     TEXT         NOT NULL,
  "phone"        TEXT,
  "role"         "Role"       NOT NULL DEFAULT 'CLIENT',
  "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx"        ON "users"("email");

-- ─────────────────────────────────────────────
-- EMPLOYEES
-- ─────────────────────────────────────────────

CREATE TABLE "employees" (
  "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
  "userId"    UUID         NOT NULL,
  "bio"       TEXT,
  "avatarUrl" TEXT,
  "isActive"  BOOLEAN      NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "employees_pkey"            PRIMARY KEY ("id"),
  CONSTRAINT "employees_userId_fkey"     FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "employees_userId_unique"   UNIQUE ("userId")
);

CREATE INDEX "employees_isActive_idx" ON "employees"("isActive");

-- ─────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────

CREATE TABLE "services" (
  "id"          UUID           NOT NULL DEFAULT gen_random_uuid(),
  "name"        TEXT           NOT NULL,
  "description" TEXT,
  "durationMin" INTEGER        NOT NULL,
  "price"       DECIMAL(10,2)  NOT NULL,
  "isActive"    BOOLEAN        NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT "services_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "services_duration_check" CHECK ("durationMin" > 0),
  CONSTRAINT "services_price_check"    CHECK ("price" >= 0)
);

CREATE INDEX "services_isActive_idx" ON "services"("isActive");

-- ─────────────────────────────────────────────
-- EMPLOYEE ↔ SERVICE  (pivot)
-- ─────────────────────────────────────────────

CREATE TABLE "employee_services" (
  "employeeId" UUID NOT NULL,
  "serviceId"  UUID NOT NULL,

  CONSTRAINT "employee_services_pkey"        PRIMARY KEY ("employeeId", "serviceId"),
  CONSTRAINT "employee_services_emp_fkey"    FOREIGN KEY ("employeeId")
    REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "employee_services_svc_fkey"    FOREIGN KEY ("serviceId")
    REFERENCES "services"("id")  ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- WORKING HOURS
-- ─────────────────────────────────────────────

CREATE TABLE "working_hours" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "employeeId" UUID        NOT NULL,
  "dayOfWeek"  "DayOfWeek" NOT NULL,
  "startTime"  TEXT        NOT NULL,  -- "HH:MM"
  "endTime"    TEXT        NOT NULL,  -- "HH:MM"
  "isActive"   BOOLEAN     NOT NULL DEFAULT TRUE,

  CONSTRAINT "working_hours_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "working_hours_emp_fkey"      FOREIGN KEY ("employeeId")
    REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "working_hours_emp_day_unique" UNIQUE ("employeeId", "dayOfWeek"),
  -- endTime mora biti posle startTime
  CONSTRAINT "working_hours_time_check"    CHECK ("endTime" > "startTime")
);

CREATE INDEX "working_hours_lookup_idx"
  ON "working_hours"("employeeId", "dayOfWeek", "isActive");

-- ─────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────

CREATE TABLE "appointments" (
  "id"         UUID                NOT NULL DEFAULT gen_random_uuid(),
  "clientId"   UUID                NOT NULL,
  "employeeId" UUID                NOT NULL,
  "serviceId"  UUID                NOT NULL,
  "startTime"  TIMESTAMPTZ         NOT NULL,
  "endTime"    TIMESTAMPTZ         NOT NULL,
  "status"     "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "notes"      TEXT,
  "createdAt"  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CONSTRAINT "appointments_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "appointments_client_fkey"  FOREIGN KEY ("clientId")
    REFERENCES "users"("id")      ON DELETE RESTRICT,
  CONSTRAINT "appointments_emp_fkey"     FOREIGN KEY ("employeeId")
    REFERENCES "employees"("id")  ON DELETE RESTRICT,
  CONSTRAINT "appointments_svc_fkey"     FOREIGN KEY ("serviceId")
    REFERENCES "services"("id")   ON DELETE RESTRICT,

  -- endTime mora biti posle startTime
  CONSTRAINT "appointments_time_check"   CHECK ("endTime" > "startTime")
);

CREATE INDEX "appointments_emp_time_idx"    ON "appointments"("employeeId", "startTime", "endTime");
CREATE INDEX "appointments_client_time_idx" ON "appointments"("clientId", "startTime");
CREATE INDEX "appointments_status_idx"      ON "appointments"("status");

-- ─────────────────────────────────────────────────────────────────────────────
-- OVERLAP PREVENTION
-- Sprečava da isti zaposleni ima dva termina koji se vremenski preklapaju.
-- Uslov: novi termin se preklapa sa postojećim ako važi
--        existing.startTime < new.endTime AND existing.endTime > new.startTime
-- CANCELLED i COMPLETED termini se ne računaju kao prepreka.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   "appointments"
    WHERE  "employeeId" = NEW."employeeId"
    AND    "id"         <> NEW."id"                       -- isključi sam sebe (UPDATE)
    AND    "status"     NOT IN ('CANCELLED', 'COMPLETED') -- samo aktivni termini
    AND    "startTime"  < NEW."endTime"
    AND    "endTime"    > NEW."startTime"
  ) THEN
    RAISE EXCEPTION
      'Termin se preklapa sa postojećim terminom zaposlenog (employeeId: %)',
      NEW."employeeId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Okida se na INSERT i UPDATE (promena statusa ne može stvoriti konflikt)
CREATE TRIGGER "appointments_overlap_check"
  BEFORE INSERT OR UPDATE OF "startTime", "endTime", "employeeId", "status"
  ON "appointments"
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATE updatedAt
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "users_updated_at"        BEFORE UPDATE ON "users"        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER "employees_updated_at"    BEFORE UPDATE ON "employees"    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER "services_updated_at"     BEFORE UPDATE ON "services"     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER "appointments_updated_at" BEFORE UPDATE ON "appointments" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
