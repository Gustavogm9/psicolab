CREATE OR REPLACE FUNCTION public.atualizar_faturas_vencidas_com_alertas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  fatura_rec RECORD;
BEGIN
  -- Find invoices that just became overdue
  FOR fatura_rec IN
    SELECT f.id, f.numero_fatura, f.valor, f.consultora_id, c.nome as cliente_nome
    FROM faturas f
    LEFT JOIN clientes c ON c.id = f.cliente_id
    WHERE f.status = 'pendente'
    AND f.data_vencimento < CURRENT_DATE
  LOOP
    -- Update status
    UPDATE faturas SET status = 'atrasado' WHERE id = fatura_rec.id;
    
    -- Create alert
    INSERT INTO alertas (consultora_id, tipo, titulo, descricao)
    VALUES (
      fatura_rec.consultora_id,
      'fatura_atrasada',
      '💰 Fatura Atrasada!',
      'A fatura ' || COALESCE(fatura_rec.numero_fatura, '') || 
      CASE WHEN fatura_rec.cliente_nome IS NOT NULL THEN ' de ' || fatura_rec.cliente_nome ELSE '' END ||
      ' (R$ ' || fatura_rec.valor::text || ') está atrasada'
    );
  END LOOP;
END;
$$;