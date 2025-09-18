import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { exportToCSV } from '../utils/helpers';
import Header from './Header';
import StatsCard from './StatsCard';
import OrderTable from './OrderTable';
import OrderChart from './OrderChart';
import Modal from './Modal';
import IconChartBar from './icons/IconChartBar';
import IconUsers from './icons/IconUsers';
import IconClock from './icons/IconClock';
import { getAiSummaryForOrders } from '../services/geminiService';
import IconSearch from './icons/IconSearch';
import { GoogleSheetSetup } from './GoogleSheetSetup';
import * as sheetService from '../services/googleSheetService';
import IconAlert from './icons/IconAlert';


type OrderFormData = Omit<Order, 'id' | 'issueDate' | 'status'>;

const initialOrderFormData: OrderFormData = {
    productDescription: '',
    pieces: 1,
    fileNumber: '',
    karigarName: '',
    billNumber: '',
    imageUrl: '',
};

const toInputDateString = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const Dashboard: React.FC = () => {
  const [webAppUrl, setWebAppUrl] = useState<string | null>(() => localStorage.getItem('googleSheetWebAppUrl'));
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiSummaryModalOpen, setIsAiSummaryModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const fetchOrders = useCallback(async () => {
    if (!webAppUrl) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await sheetService.getOrders(webAppUrl);
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to fetch data from Google Sheets. Please check your URL and sheet setup. Details: ${err.message}`);
      // If URL is invalid, clear it to force setup again
      localStorage.removeItem('googleSheetWebAppUrl');
      setWebAppUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [webAppUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSaveWebAppUrl = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
        // Test the connection
        await sheetService.getOrders(url);
        localStorage.setItem('googleSheetWebAppUrl', url);
        setWebAppUrl(url);
    } catch (err: any) {
        setError(`Could not connect using this URL. Please verify it's correct and try again. Error: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };


  const filteredOrders = useMemo(() => {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return orders.filter(order => {
      const orderDate = new Date(order.issueDate);
      const isDateInRange = orderDate >= startOfDay && orderDate <= endOfDay;
      const isIdMatch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return isDateInRange && isIdMatch;
    }).sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }, [orders, startDate, endDate, searchQuery]);

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(o => ![OrderStatus.Completed, OrderStatus.Cancelled].includes(o.status)).length;
    return { totalOrders, pendingOrders };
  }, [filteredOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = [...orders];
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate || !webAppUrl) return;

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
      await sheetService.updateOrder(webAppUrl, { ...orderToUpdate, status: newStatus });
    } catch (err) {
      setError('Failed to update status. Reverting change.');
      setOrders(originalOrders); // Revert on error
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => setIsModalOpen(false);

  const handleExport = () => exportToCSV(filteredOrders);

  const handleGetAiSummary = async () => {
    setIsAiLoading(true);
    setIsAiSummaryModalOpen(true);
    const summary = await getAiSummaryForOrders(filteredOrders);
    setAiSummary(summary);
    setIsAiLoading(false);
  };
  
  const handleAddNewOrder = () => setIsNewOrderModalOpen(true);

  const handleOpenEditModal = (order: Order) => {
    setOrderToEdit(order);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setOrderToEdit(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!webAppUrl) return;
    const originalOrders = [...orders];
    // Optimistic UI update
    setOrders(prev => prev.filter(order => order.id !== orderId));
    try {
        await sheetService.deleteOrder(webAppUrl, orderId);
    } catch(err) {
        setError('Failed to delete order. Reverting change.');
        setOrders(originalOrders);
    }
  };

  const handleSaveNewOrder = async (data: OrderFormData) => {
    if (!webAppUrl) return;
    setIsNewOrderModalOpen(false);
    try {
        const newOrder = await sheetService.addOrder(webAppUrl, data);
        setOrders(prev => [newOrder, ...prev]);
    } catch(err) {
        setError('Failed to add new order.');
    }
  };

  const handleUpdateOrder = async (data: OrderFormData) => {
    if (!orderToEdit || !webAppUrl) return;
    handleCloseEditModal();
    const originalOrders = [...orders];
    const updatedOrderData: Order = { ...orderToEdit, ...data };

    setOrders(prev => prev.map(o => o.id === updatedOrderData.id ? updatedOrderData : o));

    try {
        await sheetService.updateOrder(webAppUrl, updatedOrderData);
    } catch(err) {
        setError('Failed to update order. Reverting change.');
        setOrders(originalOrders);
    }
  };
  
  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        if (!isNaN(newDate.getTime())) setter(newDate);
    }
  };

  if (!webAppUrl) {
    return <GoogleSheetSetup onSave={handleSaveWebAppUrl} isLoading={isLoading} />;
  }

  return (
    <main className="p-4 md:p-8">
      <Header onExport={handleExport} onGetAiSummary={handleGetAiSummary} isAiLoading={isAiLoading} onAddNewOrder={handleAddNewOrder} />
      
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 flex items-start space-x-3">
            <IconAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-white">&times;</button>
        </div>
      )}
      
      <div className="mb-6 bg-brand-dark-light border border-brand-gray/50 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-white mr-4">Filters</h3>
        <div className="relative flex-grow max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IconSearch className="w-5 h-5 text-gray-400" /></span>
          <input type="text" placeholder="Search by Order ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 pl-10 pr-4 text-white w-full focus:outline-none focus:ring-brand-gold focus:border-brand-gold" aria-label="Search orders by ID" />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-gray-400">From:</label>
            <input type="date" id="startDate" value={toInputDateString(startDate)} onChange={handleDateChange(setStartDate)} className="bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-gray-400">To:</label>
            <input type="date" id="endDate" value={toInputDateString(endDate)} onChange={handleDateChange(setEndDate)} className="bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" />
        </div>
        <button onClick={fetchOrders} disabled={isLoading} className="ml-auto bg-brand-dark-light hover:bg-brand-gray text-brand-gold-light font-semibold py-2 px-4 border border-brand-gray rounded-lg shadow-sm transition-colors disabled:opacity-50">
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={<IconUsers className="w-6 h-6 text-blue-300"/>} color="bg-blue-500/20" />
        <StatsCard title="Pending Orders" value={stats.pendingOrders} icon={<IconClock className="w-6 h-6 text-yellow-300"/>} color="bg-yellow-500/20" />
        <StatsCard title="Est. Revenue" value="$ N/A" icon={<IconChartBar className="w-6 h-6 text-purple-300"/>} color="bg-purple-500/20" />
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8"><OrderChart data={filteredOrders} /></div>
      
      <h2 className="text-2xl font-bold mb-4 text-white">Orders ({isLoading ? '...' : filteredOrders.length})</h2>
       {isLoading ? (
        <div className="text-center p-8 text-gray-500">Loading orders from Google Sheets...</div>
       ) : (
        <OrderTable orders={filteredOrders} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} onDeleteOrder={handleDeleteOrder} onEditOrder={handleOpenEditModal} />
       )}

      {selectedOrder && <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Order Details"><OrderDetails order={selectedOrder} /></Modal>}
      <Modal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} title="Add New Order"><OrderForm onSave={handleSaveNewOrder} onCancel={() => setIsNewOrderModalOpen(false)} /></Modal>
      {orderToEdit && <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Edit Order"><OrderForm onSave={handleUpdateOrder} onCancel={handleCloseEditModal} existingOrder={orderToEdit} /></Modal>}
      <Modal isOpen={isAiSummaryModalOpen} onClose={() => setIsAiSummaryModalOpen(false)} title="AI-Powered Summary">
        {isAiLoading ? <LoadingSpinner /> : <AiSummaryDisplay summary={aiSummary} />}
      </Modal>
    </main>
  );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
        <svg className="animate-spin h-10 w-10 text-brand-gold mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300">Our AI is analyzing your data...</p>
        <p className="text-sm text-gray-500">This might take a moment.</p>
    </div>
);

const AiSummaryDisplay: React.FC<{ summary: string }> = ({ summary }) => {
    const renderMarkdown = (text: string) => text.split('\n').map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) return <h3 key={index} className="text-lg font-bold text-brand-gold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) return <p key={index} className="ml-4 my-1 text-gray-300">{line}</p>;
        return <p key={index} className="my-1 text-gray-300">{line}</p>;
    });
    return <div className="prose prose-invert max-w-none">{renderMarkdown(summary)}</div>;
};

const OrderDetails: React.FC<{ order: Order }> = ({ order }) => (
    <div className="space-y-4 text-gray-300">
        <img src={order.imageUrl} alt={order.productDescription} className="w-full h-64 object-cover rounded-lg mb-4" />
        <p><strong>Order ID:</strong> <span className="text-white">{order.id}</span></p>
        <p><strong>Product:</strong> <span className="text-white">{order.productDescription}</span></p>
        <div className="grid grid-cols-2 gap-4">
            <p><strong>Pieces:</strong> <span className="text-white">{order.pieces}</span></p>
            <p><strong>File Number:</strong> <span className="text-white">{order.fileNumber}</span></p>
            <p><strong>Karigar Name:</strong> <span className="text-white">{order.karigarName}</span></p>
            <p><strong>Bill Number:</strong> <span className="text-white">{order.billNumber}</span></p>
        </div>
    </div>
);

interface OrderFormProps { onSave: (data: OrderFormData) => void; onCancel: () => void; existingOrder?: Order | null; }
const OrderForm: React.FC<OrderFormProps> = ({ onSave, onCancel, existingOrder }) => {
    const [formData, setFormData] = useState<OrderFormData>(existingOrder ? { productDescription: existingOrder.productDescription, pieces: existingOrder.pieces, fileNumber: existingOrder.fileNumber, karigarName: existingOrder.karigarName, billNumber: existingOrder.billNumber, imageUrl: existingOrder.imageUrl } : initialOrderFormData);
    const [imagePreview, setImagePreview] = useState<string | null>(existingOrder?.imageUrl || null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'pieces' ? parseInt(value) : value }));
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData(prev => ({ ...prev, imageUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Product Image</label>
            <div className="mt-1 flex items-center space-x-4">
                {imagePreview ? <img src={imagePreview} alt="Product Preview" className="h-24 w-24 rounded-lg object-cover" /> : <div className="h-24 w-24 rounded-lg bg-brand-dark flex items-center justify-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>}
                <input type="file" id="imageUrl" name="imageUrl" accept="image/*" onChange={handleImageChange} className="hidden" />
                <label htmlFor="imageUrl" className="cursor-pointer bg-brand-dark-light hover:bg-brand-gray text-brand-gold-light font-semibold py-2 px-4 border border-brand-gray rounded-lg shadow-sm">{imagePreview ? 'Change Image' : 'Upload Image'}</label>
            </div>
          </div>
          <div><label htmlFor="productDescription" className="block text-sm font-medium text-gray-300">Product Description</label><input type="text" name="productDescription" id="productDescription" value={formData.productDescription} onChange={handleChange} required className="mt-1 block w-full bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="pieces" className="block text-sm font-medium text-gray-300">No. of Pieces</label><input type="number" name="pieces" id="pieces" value={formData.pieces} onChange={handleChange} required min="1" className="mt-1 block w-full bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" /></div>
              <div><label htmlFor="fileNumber" className="block text-sm font-medium text-gray-300">File Number</label><input type="text" name="fileNumber" id="fileNumber" value={formData.fileNumber} onChange={handleChange} required className="mt-1 block w-full bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" /></div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="karigarName" className="block text-sm font-medium text-gray-300">Karigar Name</label><input type="text" name="karigarName" id="karigarName" value={formData.karigarName} onChange={handleChange} required className="mt-1 block w-full bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" /></div>
              <div><label htmlFor="billNumber" className="block text-sm font-medium text-gray-300">Number in Bill</label><input type="text" name="billNumber" id="billNumber" value={formData.billNumber} onChange={handleChange} required className="mt-1 block w-full bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold" /></div>
          </div>
          <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onCancel} className="bg-brand-gray hover:bg-brand-gray/80 text-white font-bold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold py-2 px-4 rounded-lg">Save Order</button></div>
      </form>
    )
}
export default Dashboard;