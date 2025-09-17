
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Order, OrderStatus } from '../types';

interface OrderChartProps {
  data: Order[];
}

const STATUS_CHART_COLORS: Record<OrderStatus, string> = {
    [OrderStatus.Received]: '#3b82f6',
    [OrderStatus.Designing]: '#8b5cf6',
    [OrderStatus.Datasheet]: '#eab308',
    [OrderStatus.WithVendor]: '#f97316',
    [OrderStatus.Completed]: '#22c55e',
    [OrderStatus.Cancelled]: '#ef4444',
};

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`${value} Orders`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const OrderChart: React.FC<OrderChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
  const statusCounts = data.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const pieChartData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name as OrderStatus,
    value,
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-brand-dark-light p-6 rounded-xl border border-brand-gray/50 shadow-lg h-[400px]">
      <h3 className="text-xl font-bold text-white mb-4">Order Status Distribution</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_CHART_COLORS[entry.name]} />
              ))}
            </Pie>
             <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30,30,30,0.8)', 
                borderColor: '#c59d5f',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
            No data available for the selected period.
        </div>
      )}
    </div>
  );
};

export default OrderChart;
