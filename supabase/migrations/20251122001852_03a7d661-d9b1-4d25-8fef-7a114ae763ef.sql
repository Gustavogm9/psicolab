-- Add status field to depoimentos_publicos table
ALTER TABLE public.depoimentos_publicos 
ADD COLUMN status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado'));

-- Create index for faster queries on pending testimonials
CREATE INDEX idx_depoimentos_publicos_status ON public.depoimentos_publicos(status);

-- Update existing testimonials to approved status
UPDATE public.depoimentos_publicos SET status = 'aprovado' WHERE status IS NULL;