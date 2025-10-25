import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Download, Printer, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [filterMonth, setFilterMonth] = useState('');
  const [filterFee, setFilterFee] = useState('');

  // Fetch overall statistics
  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch fees for filter
  const { data: fees } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch invoices for detailed analysis
  const { data: invoices } = useQuery({
    queryKey: ['report-invoices', filterMonth, filterFee],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          students!inner(student_name),
          fees!inner(fee_name)
        `);

      if (filterMonth) {
        query = query.eq('month_name', filterMonth);
      }

      if (filterFee) {
        query = query.eq('fee_id', parseInt(filterFee));
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch payments grouped by month
  const { data: monthlyCollections } = useQuery({
    queryKey: ['monthly-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('month_name, amount, status')
        .eq('status', 'paid');

      if (error) throw error;

      // Group by month
      const grouped = data.reduce((acc, item) => {
        const month = item.month_name;
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += parseFloat(item.amount);
        return acc;
      }, {});

      return Object.entries(grouped).map(([month, amount]) => ({
        month,
        amount: parseFloat(amount.toFixed(2)),
      }));
    },
  });

  // Payment method distribution
  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('payment_method, amount_paid');

      if (error) throw error;

      const grouped = data.reduce((acc, item) => {
        const method = item.payment_method;
        if (!acc[method]) {
          acc[method] = 0;
        }
        acc[method] += parseFloat(item.amount_paid);
        return acc;
      }, {});

      return Object.entries(grouped).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: parseFloat(value.toFixed(2)),
      }));
    },
  });

  // Get unique months for filter
  const uniqueMonths = [...new Set(invoices?.map(inv => inv.month_name) || [])];

  const handleExportCSV = () => {
    if (!invoices || invoices.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvData = invoices.map(inv => ({
      'Student Name': inv.students.student_name,
      'Fee Name': inv.fees.fee_name,
      'Amount': parseFloat(inv.amount).toFixed(2),
      'Month': inv.month_name,
      'Status': inv.status,
      'Due Date': new Date(inv.due_date).toLocaleDateString(),
      'Created At': new Date(inv.created_at).toLocaleDateString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `school_finance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Report exported successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statCards = [
    {
      title: 'Total Students',
      titleAr: 'Wadarta Ardayda',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Collected',
      titleAr: 'Wadarta La Ururiyay',
      value: `$${parseFloat(stats?.total_collected || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Unpaid Amount',
      titleAr: 'Lacagta Hadhay',
      value: `$${parseFloat(stats?.unpaid_amount || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Invoices',
      titleAr: 'Wadarta Biilasha',
      value: invoices?.length || 0,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Warbixino - Financial Reports & Analytics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm no-print">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters / Shuruudo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Month / Bisha
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Months</option>
              {uniqueMonths.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Fee Type / Nooca Lacagta
            </label>
            <select
              value={filterFee}
              onChange={(e) => setFilterFee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Fees</option>
              {fees?.map((fee) => (
                <option key={fee.id} value={fee.id}>{fee.fee_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print-area">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <p className="text-sm text-gray-600">{stat.title}</p>
            <p className="text-xs text-gray-500">{stat.titleAr}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-area">
        {/* Monthly Collections Bar Chart */}
        {monthlyCollections && monthlyCollections.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Monthly Collections / Ururinta Bilaha
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCollections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Methods Pie Chart */}
        {paymentMethods && paymentMethods.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Methods / Habka Bixinta
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Invoice Table */}
      {invoices && invoices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden print-area">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Detailed Invoice Report / Warbixin Faahfaahsan
              {filterMonth && <span className="text-sm text-gray-600 ml-2">({filterMonth})</span>}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-gray-900">
                      {invoice.students.student_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {invoice.fees.fee_name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      ${parseFloat(invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {invoice.month_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-gray-900">
                    Total / Wadarta:
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    ${invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}
                  </td>
                  <td colSpan="3" className="px-6 py-4 text-gray-600">
                    Paid: {invoices.filter(inv => inv.status === 'paid').length} / 
                    Unpaid: {invoices.filter(inv => inv.status === 'unpaid').length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Summary Section for Print */}
      <div className="hidden print:block print-area mt-8">
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Report Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Generated Date:</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Report Type:</p>
              <p className="font-medium">School Finance Report</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};








