export interface PriceChangeData {
  token: string;
  price: number;
  previousPrice: number;
  percentageChange: number;
}

export interface HealthFactorData {
  protocol: string;
  healthFactor: number;
  previousHealthFactor: number;
} 