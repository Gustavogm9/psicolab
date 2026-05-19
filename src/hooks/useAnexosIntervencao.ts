import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Anexo } from '@/types/anexo';
import { validateFile } from '@/lib/anexo-utils';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

export function useAnexosIntervencao() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { effectiveUserId } = useAuth();

  const uploadAnexo = async (
    file: File,
    intervencaoId?: string
  ): Promise<Anexo | null> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = intervencaoId 
        ? `${effectiveUserId}/${intervencaoId}/${fileName}`
        : `${effectiveUserId}/temp/${fileName}`;

      // Upload do arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('intervencoes-anexos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('intervencoes-anexos')
        .getPublicUrl(filePath);

      setProgress(100);

      const anexo: Anexo = {
        id: fileName,
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        url: publicUrl,
        data_upload: new Date().toISOString(),
        uploaded_by: effectiveUserId
      };

      toast.success('Arquivo enviado com sucesso!');
      return anexo;
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(getUserFriendlyError(error, { action: 'enviar', entity: 'intervenção' }));
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteAnexo = async (anexo: Anexo, intervencaoId?: string): Promise<boolean> => {
    try {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const filePath = intervencaoId
        ? `${effectiveUserId}/${intervencaoId}/${anexo.id}`
        : `${effectiveUserId}/temp/${anexo.id}`;

      const { error } = await supabase.storage
        .from('intervencoes-anexos')
        .remove([filePath]);

      if (error) throw error;

      toast.success('Arquivo removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'intervenção' }));
      return false;
    }
  };

  return {
    uploadAnexo,
    deleteAnexo,
    uploading,
    progress
  };
}
