export interface IWompiService {
  getAcceptanceTokens(): Promise<{
    acceptance_token: string;
    accept_personal_auth: string;
  }>;

  createTransaction(payload: {
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    payment_method: { type: string; token: string; installments: number };
    reference: string;
    payment_description: string;
    acceptance_token: string;
    accept_personal_auth: string;
    signature?: string;
  }): Promise<any>;

  tokenizeCard(cardDetails: CardDetails): Promise<any>;

  getPublicInfo(): Promise<any>;

  getTransactionStatus(transactionId: string): Promise<any>;

  logToFile(data: any): void;
}

export interface CardDetails {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}
