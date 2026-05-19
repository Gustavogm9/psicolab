import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2 } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

interface SlugValidatorProps {
  slug: string;
  currentSlug: string; // slug atual do perfil (para não validar contra si mesmo)
  onChange: (isValid: boolean, normalizedSlug: string) => void;
}

export const SlugValidator = ({ slug, currentSlug, onChange }: SlugValidatorProps) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [normalizedSlug, setNormalizedSlug] = useState('');

  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!slug || slug.length < 3) {
        setStatus('idle');
        onChange(false, '');
        return;
      }

      // Normalizar o slug
      const normalized = generateSlug(slug);
      setNormalizedSlug(normalized);

      // Se for o slug atual, não precisa validar
      if (normalized === currentSlug) {
        setStatus('available');
        onChange(true, normalized);
        return;
      }

      setStatus('checking');

      try {
        const { data, error } = await supabase
          .from('perfis_publicos')
          .select('id')
          .eq('slug', normalized)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar slug:', error);
          setStatus('idle');
          onChange(false, normalized);
          return;
        }

        if (!data) {
          // Nenhum resultado encontrado = slug disponível
          setStatus('available');
          onChange(true, normalized);
        } else {
          // Slug já existe
          setStatus('taken');
          onChange(false, normalized);
        }
      } catch (error) {
        console.error('Erro ao verificar slug:', error);
        setStatus('idle');
        onChange(false, normalized);
      }
    };

    const debounceTimer = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [slug, currentSlug, onChange]);

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-2 text-sm mt-1">
      {status === 'checking' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Verificando disponibilidade...</span>
        </>
      )}
      {status === 'available' && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600">
            Disponível: <code className="text-xs bg-muted px-1 py-0.5 rounded">{normalizedSlug}</code>
          </span>
        </>
      )}
      {status === 'taken' && (
        <>
          <X className="h-4 w-4 text-destructive" />
          <span className="text-destructive">
            Este slug já está em uso. Tente outro.
          </span>
        </>
      )}
    </div>
  );
};
