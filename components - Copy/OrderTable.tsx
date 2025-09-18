import React from 'react';
import { Order, OrderStatus } from '../types';
import OrderRow from './OrderRow';

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onStatusChange, onViewDetails, onDeleteOrder, onEditOrder }) => {
  return (
    <div className="bg-brand-dark-light rounded-xl border border-brand-gray/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-gray">
            <thead className="bg-brand-dark-light/50">
                <tr>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date of Issue</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pieces</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">File Number</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Karigar Name</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Number in Bill</th>
                <th scope="col" className="p-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-brand-dark-light divide-y divide-brand-gray">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} onViewDetails={onViewDetails} onDeleteOrder={onDeleteOrder} onEditOrder={onEditOrder} />
                    ))
                ) : (
                    <tr>
                        <td colSpan={9} className="text-center p-8 text-gray-500">No orders found.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
    </div>
  );
};

export default OrderTable;
