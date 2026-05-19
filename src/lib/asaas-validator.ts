import { supabase } from '@/integrations/supabase/client';
import type { AsaasEnvironment } from './asaas-types';

export async function validateAsaasApiKey(apiKey: string, environment: AsaasEnvironment) {
  try {
    const { data, error } = await supabase.functions.invoke('asaas-validate-key', {
      body: { 
        api_key: apiKey, 
        environment 
      }
    });

    if (error) {
      console.error('Error invoking asaas-validate-key:', error);
      return { 
        valid: false, 
        error: 'Erro ao validar API Key. Tente novamente.' 
      };
    }

    return data;
  } catch (error) {
    console.error('Exception validating Asaas API key:', error);
    return { 
      valid: false, 
      error: 'Erro de conexão. Verifique sua internet e tente novamente.' 
    };
  }
}

export function getAsaasBaseUrl(environment: AsaasEnvironment): string {
  return environment === 'sandbox' 
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://www.asaas.com/api/v3';
}

export function formatAsaasDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}
