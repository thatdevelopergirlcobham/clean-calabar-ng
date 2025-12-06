// Paystack TypeScript definitions

export interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: unknown;
  };
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export interface PaystackHandler {
  openIframe: () => void;
}

export interface PaystackPop {
  setup: (options: PaystackOptions) => PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}
