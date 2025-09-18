
import { OrderStatus } from './types';

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.Received]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [OrderStatus.Designing]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  [OrderStatus.Datasheet]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [OrderStatus.WithVendor]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [OrderStatus.Completed]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [OrderStatus.Cancelled]: 'bg-red-500/20 text-red-300 border-red-500/30',
};
