import React from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import IconTrash from './icons/IconTrash';
import IconPencil from './icons/IconPencil';

interface OrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, onStatusChange, onViewDetails, onDeleteOrder, onEditOrder }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(order.id, e.target.value as OrderStatus);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        onDeleteOrder(order.id);
    }
  }

  return (
    <tr className="border-b border-brand-gray hover:bg-brand-dark-light/50 transition-colors">
      <td className="p-4 whitespace-nowrap text-sm font-medium text-white">{order.id}</td>
      <td className="p-4 whitespace-nowrap text-sm text-gray-300">{order.issueDate.toLocaleDateString()}</td>
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img className="h-10 w-10 rounded-full object-cover" src={order.imageUrl} alt="Product" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white truncate max-w-xs">{order.productDescription}</div>
          </div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap text-sm text-gray-300">{order.pieces}</td>
      <td className="p-4 whitespace-nowrap text-sm text-gray-300">{order.fileNumber}</td>
      <td className="p-4 whitespace-nowrap text-sm text-gray-300">{order.karigarName}</td>
      <td className="p-4 whitespace-nowrap">
        <select
          value={order.status}
          onChange={handleStatusChange}
          className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full border bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold ${STATUS_COLORS[order.status]}`}
        >
          {Object.values(OrderStatus).map((status) => (
            <option key={status} value={status} className="bg-brand-dark text-white">{status}</option>
          ))}
        </select>
      </td>
      <td className="p-4 whitespace-nowrap text-sm text-gray-300">{order.billNumber}</td>
      <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-4">
            <button onClick={() => onViewDetails(order)} className="text-brand-gold-light hover:text-brand-gold transition-colors" aria-label={`View details for order ${order.id}`}>
            View Details
            </button>
            <button onClick={() => onEditOrder(order)} className="text-gray-400 hover:text-white transition-colors" aria-label={`Edit order ${order.id}`}>
                <IconPencil className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-400 transition-colors" aria-label={`Delete order ${order.id}`}>
                <IconTrash className="w-5 h-5" />
            </button>
        </div>
      </td>
    </tr>
  );
};

export default OrderRow;
