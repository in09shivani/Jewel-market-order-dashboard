import { Order, OrderStatus } from '../types';

// Mock Data Generation
export const generateMockOrders = (): Order[] => {
  const demoOrders: Order[] = [
    {
      id: 'SM-101',
      issueDate: new Date('2024-09-15T10:00:00Z'),
      status: OrderStatus.Designing,
      imageUrl: 'https://picsum.photos/seed/wedding-ring/400/400',
      productDescription: '22K Gold Wedding Ring with Diamonds',
      pieces: 1,
      fileNumber: 'FN-2024-001',
      karigarName: 'Ritu Sharma',
      billNumber: 'B-54321',
    }
  ];
  return demoOrders;
};

// CSV Export
export const exportToCSV = (data: Order[]) => {
  if (data.length === 0) return;

  const headers = "Order ID,Date of Issue,Product,Pieces,File Number,Karigar Name,Status,Bill Number,Image URL";
  const rows = data.map(row => {
      const rowData = [
          row.id,
          row.issueDate.toISOString(),
          row.productDescription,
          row.pieces,
          row.fileNumber,
          row.karigarName,
          row.status,
          row.billNumber,
          row.imageUrl
      ];
      return rowData.map(val => {
          const strVal = String(val).replace(/"/g, '""');
          return `"${strVal}"`;
      }).join(',');
  });


  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jewel_market_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Date helpers
export const isSameDay = (d1: Date, d2: Date) => 
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const isSameWeek = (d1: Date, d2: Date) => {
    const startOfWeek = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }
    const d1WeekStart = startOfWeek(d1);
    d1WeekStart.setHours(0,0,0,0);
    const d2WeekStart = startOfWeek(d2);
    d2WeekStart.setHours(0,0,0,0);

    return d1WeekStart.getTime() === d2WeekStart.getTime();
};

export const isSameMonth = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth();