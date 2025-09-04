// stores/analytics/types.ts
export interface AnalyticsState {
  loading: boolean;
  error: string | null;
  tokenDetails: any[];
  appTokenDetails: any[];
  orgDocList: any[];
  organizationDetails: any[];
  orgUserList: any[];
  userAppWiseTokenDetail: any[];
}


export interface TokenUsageData {
  name: string;
  token_usage_details: TokenDetail[];
}

export interface TokenDetail {
  date: string;
  total_tokens: number;
  created_at: string;
}

export interface AppTokenUsage {
  name: string;
  total_tokens: number;
}

export interface DocumentAnalysis {
  document_source: string;
  reference_count: number;
  questions?: any[];
}
