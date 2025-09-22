export interface Order {
  id: string;
  userId: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';
  pairId: string;
  type: 'MARKET' | 'LIMIT';
}

export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: Date;
  buyerId: string; // Add this field
  sellerId: string; // Add this field
  pairId: string;
}
