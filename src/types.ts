export type PlanType = string;

export interface PricingPlan {
  id: string;
  name: string;
  priceDZD: number;
  messageLimit: number;
  features: string[];
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  status: 'active' | 'suspended' | 'pending';
  messageCount: number;
  createdAt: string;
  botIdentity?: string;
  facebookPageId?: string;
  verifyToken?: string;
  password?: string;
  faqs?: Array<{ id: string; question: string; answer: string }>;
  
  // New fields
  algerianDialect?: boolean;
  trialExpiresAt?: string;
  paymentStatus?: 'none' | 'pending' | 'approved';
  paymentTxRef?: string;
  paymentMethod?: 'ccp' | 'baridimob';
  paymentAmount?: number;
}

export interface ExtractedOrder {
  product: string;
  phone: string;
  address: string;
  wilaya: string;
  pieces: number;
  size: string;
  totalPrice: number;
}

export interface MockCustomer {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  lastTime: string;
  phoneOrUsername: string;
  platform: 'facebook' | 'instagram' | 'whatsapp';
  status: 'chatbot_active' | 'paused_manual';
  messages: Array<{
    sender: 'customer' | 'bot' | 'merchant';
    text: string;
    timestamp: string;
  }>;
  extractedOrder?: ExtractedOrder;
}

export interface AdminUser {
  email: string;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  totalMerchants: number;
  activeMerchants: number;
  suspendedMerchants: number;
  totalMessages: number;
  planDistribution: {
    Basic: number;
    Pro: number;
    Premium: number;
  };
}
