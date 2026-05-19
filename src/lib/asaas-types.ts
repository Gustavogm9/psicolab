// Tipos TypeScript para integração Asaas

export type AsaasEnvironment = 'sandbox' | 'production';

export interface AsaasCredentials {
  id: string;
  consultora_id: string;
  sandbox_api_key: string | null;
  production_api_key: string | null;
  environment: AsaasEnvironment;
  webhook_token: string | null; // deprecated, mantido para compatibilidade
  sandbox_webhook_token: string | null;
  production_webhook_token: string | null;
  ativo: boolean;
  connection_status?: 'not_tested' | 'validated' | 'failed';
  last_validation_at?: string;
  account_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  externalReference?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeBase64?: string;
  pixCopyAndPaste?: string;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';
}

export interface AsaasWebhookEvent {
  event: 'PAYMENT_CREATED' | 'PAYMENT_UPDATED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'PAYMENT_DELETED' | 'PAYMENT_RESTORED' | 'PAYMENT_REFUNDED' | 'PAYMENT_RECEIVED_IN_CASH_UNDONE' | 'PAYMENT_CHARGEBACK_REQUESTED' | 'PAYMENT_CHARGEBACK_DISPUTE' | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL' | 'PAYMENT_DUNNING_RECEIVED' | 'PAYMENT_DUNNING_REQUESTED' | 'PAYMENT_BANK_SLIP_VIEWED' | 'PAYMENT_CHECKOUT_VIEWED';
  payment: AsaasPayment;
}

export interface CreatePaymentRequest {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface MetricasFinanceiras {
  receita_total: number;
  receita_pendente: number;
  receita_atrasada: number;
  total_faturas: number;
  faturas_pagas: number;
  faturas_pendentes: number;
  faturas_atrasadas: number;
  ticket_medio: number;
  taxa_inadimplencia: number;
}
