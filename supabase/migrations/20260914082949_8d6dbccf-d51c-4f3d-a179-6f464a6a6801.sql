ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT '';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS deposit_paid numeric NOT NULL DEFAULT 0;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS contract_signed boolean NOT NULL DEFAULT false;
ALTER TABLE public.vendors ALTER COLUMN notes SET DEFAULT '';
UPDATE public.vendors SET notes = '' WHERE notes IS NULL;