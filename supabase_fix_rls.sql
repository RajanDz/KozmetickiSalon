-- ================================================================
-- POPRAVKA RLS — infinite recursion fix
-- Pokreni u SQL Editor
-- ================================================================

-- Korak 1: Ukloni sve stare politike na users tabeli
DROP POLICY IF EXISTS "users: own profile"     ON public.users;
DROP POLICY IF EXISTS "users: admin all"        ON public.users;
DROP POLICY IF EXISTS "users: select own"       ON public.users;
DROP POLICY IF EXISTS "users: update own"       ON public.users;
DROP POLICY IF EXISTS "users: insert"           ON public.users;
DROP POLICY IF EXISTS "users: admin select all" ON public.users;

-- Korak 2: SECURITY DEFINER funkcija koja čita rolu bez RLS
-- (izbjegava infinite recursion jer SECURITY DEFINER bypassa RLS)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Korak 3: Nove ispravne politike

-- Korisnik čita vlastiti profil (bez rekurzije)
CREATE POLICY "users: select own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Admin čita sve profila — koristi SECURITY DEFINER funkciju
CREATE POLICY "users: admin select"
  ON public.users FOR SELECT
  USING (public.current_user_role() = 'ADMIN');

-- Korisnik ažurira vlastiti profil (ne može promijeniti rolu)
CREATE POLICY "users: update own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- INSERT je slobodan — kreira se putem auth triggera
CREATE POLICY "users: insert"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Admin može brisati/ažurirati korisničke profile
CREATE POLICY "users: admin update"
  ON public.users FOR UPDATE
  USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "users: admin delete"
  ON public.users FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- Korak 4: Popravka appointments politika (isti problem)
DROP POLICY IF EXISTS "appointments: own"       ON public.appointments;
DROP POLICY IF EXISTS "appointments: admin all" ON public.appointments;

CREATE POLICY "appointments: client select"
  ON public.appointments FOR SELECT
  USING (auth.uid() = "clientId");

CREATE POLICY "appointments: client insert"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = "clientId");

CREATE POLICY "appointments: client cancel"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = "clientId");

CREATE POLICY "appointments: admin all"
  ON public.appointments FOR ALL
  USING (public.current_user_role() = 'ADMIN');

SELECT 'RLS popravljen!' AS status;
