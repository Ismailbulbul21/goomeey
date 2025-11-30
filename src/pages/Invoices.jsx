import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Printer, X, Loader2, AlertCircle, Calendar, Zap, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  const [monthFilter, setMonthFilter] = useState('all'); // 'all' or specific month like 'March 2025'
  const [showQuickGenModal, setShowQuickGenModal] = useState(false);
  const [showCustomGenModal, setShowCustomGenModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch invoices with student and fee details
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          students!inner(student_name),
          fees!inner(fee_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get unique months from invoices and sort them (newest first)
  const uniqueMonths = [...new Set(invoices?.map(inv => inv.month_name) || [])].sort((a, b) => {
    // Sort by date (newest first)
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  // Calculate invoice counts by status
  const invoiceCounts = {
    all: invoices?.length || 0,
    unpaid: invoices?.filter(inv => inv.status === 'unpaid').length || 0,
    paid: invoices?.filter(inv => inv.status === 'paid').length || 0,
  };

  // Filter invoices by month first, then status, then search term
  const filteredInvoices = invoices?.filter((invoice) => {
    // Filter by month
    if (monthFilter !== 'all' && invoice.month_name !== monthFilter) return false;
    
    // Filter by status
    if (statusFilter === 'unpaid' && invoice.status !== 'unpaid') return false;
    if (statusFilter === 'paid' && invoice.status !== 'paid') return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.students.student_name.toLowerCase().includes(searchLower) ||
        invoice.fees.fee_name.toLowerCase().includes(searchLower) ||
        invoice.month_name.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Biilasha - Manage Student Invoices</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQuickGenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <Zap className="w-5 h-5" />
            <span>Quick Generate</span>
          </button>
          <button
            onClick={() => setShowCustomGenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Custom Generate</span>
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

      {/* Search Bar */}
      <div className="relative no-print">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search invoices / Raadi biilal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Month and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 no-print">
        <div className="relative sm:w-64">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Months</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <div className="relative sm:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Invoices ({invoiceCounts.all})</option>
            <option value="unpaid">Unpaid Only ({invoiceCounts.unpaid})</option>
            <option value="paid">Paid Only ({invoiceCounts.paid})</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden print-area">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student / Ardeyga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee / Lacagta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount / Qadarka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month / Bisha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date / Waqtiga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status / Xaalad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.students.student_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.fees.fee_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${parseFloat(invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.month_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.due_date).toLocaleDateString()}
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No invoices found</p>
              <p className="text-sm text-gray-500">Ma jiraan biilal</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showQuickGenModal && (
        <QuickGenerateModal
          onClose={() => setShowQuickGenModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['invoices']);
            setShowQuickGenModal(false);
          }}
        />
      )}

      {showCustomGenModal && (
        <CustomGenerateModal
          onClose={() => setShowCustomGenModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['invoices']);
            setShowCustomGenModal(false);
          }}
        />
      )}
    </div>
  );
};

// Quick Generate Modal - Generate for ALL students
const QuickGenerateModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fee_id: '',
    month: '',
    year: new Date().getFullYear().toString(),
    due_date: '',
  });

  // Fetch fees for dropdown
  const { data: fees } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch active students
  const { data: students } = useQuery({
    queryKey: ['active-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });

  // Helper: Generate month name from month/year
  const generateMonthName = (month, year) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  // Helper: Auto-calculate last day of month
  const getLastDayOfMonth = (month, year) => {
    const date = new Date(year, month, 0); // Day 0 = last day of previous month
    return date.toISOString().split('T')[0];
  };

  // Auto-calculate due date when month/year changes
  useEffect(() => {
    if (formData.month && formData.year) {
      const lastDay = getLastDayOfMonth(formData.month, formData.year);
      setFormData(prev => ({ ...prev, due_date: lastDay }));
    }
  }, [formData.month, formData.year]);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      if (!students || students.length === 0) {
        throw new Error('No active students found');
      }

      const selectedFee = fees?.find(f => f.id === parseInt(data.fee_id));
      if (!selectedFee) throw new Error('Fee not found');

      // Generate month name from month and year
      const month_name = generateMonthName(data.month, data.year);

      // Create invoices for all active students using each student's monthly fee
      const invoices = students.map(student => ({
        student_id: student.id,
        fee_id: data.fee_id,
        amount: student.monthly_fee, // Use student's individual rate
        month_name: month_name,
        due_date: data.due_date,
        status: 'unpaid',
      }));

      // Check for duplicates
      const { data: existing } = await supabase
        .from('invoices')
        .select('student_id, fee_id, month_name')
        .eq('fee_id', data.fee_id)
        .eq('month_name', month_name);

      const existingSet = new Set(
        existing?.map(e => `${e.student_id}-${e.fee_id}-${e.month_name}`) || []
      );

      const newInvoices = invoices.filter(
        inv => !existingSet.has(`${inv.student_id}-${inv.fee_id}-${inv.month_name}`)
      );

      if (newInvoices.length === 0) {
        throw new Error('All invoices already exist for this fee and month');
      }

      const { error } = await supabase.from('invoices').insert(newInvoices);
      if (error) throw error;

      return newInvoices.length;
    },
    onSuccess: (count) => {
      toast.success(`Successfully generated ${count} invoices!`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate invoices');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    generateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Quick Generate Invoices</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-900">
              This will generate invoices for <strong>ALL active students</strong> ({students?.length || 0} students)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Fee Type *
            </label>
            <select
              required
              value={formData.fee_id}
              onChange={(e) => setFormData({ ...formData, fee_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a fee...</option>
              {fees?.map((fee) => (
                <option key={fee.id} value={fee.id}>
                  {fee.fee_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Month / Bisha *
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Month...</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Year / Sanadka *
            </label>
              <select
              required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Auto-filled) *
            </label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-set to last day of month, can be changed if needed</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate All'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Generate Modal - Select specific students
const CustomGenerateModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fee_id: '',
    month: '',
    year: new Date().getFullYear().toString(),
    due_date: '',
    student_ids: [],
  });

  // Fetch fees
  const { data: fees } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch all students
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')
        .order('student_name');
      if (error) throw error;
      return data;
    },
  });

  // Helper: Generate month name from month/year
  const generateMonthName = (month, year) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  // Helper: Auto-calculate last day of month
  const getLastDayOfMonth = (month, year) => {
    const date = new Date(year, month, 0);
    return date.toISOString().split('T')[0];
  };

  // Auto-calculate due date when month/year changes
  useEffect(() => {
    if (formData.month && formData.year) {
      const lastDay = getLastDayOfMonth(formData.month, formData.year);
      setFormData(prev => ({ ...prev, due_date: lastDay }));
    }
  }, [formData.month, formData.year]);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      if (data.student_ids.length === 0) {
        throw new Error('Please select at least one student');
      }

      const selectedFee = fees?.find(f => f.id === parseInt(data.fee_id));
      if (!selectedFee) throw new Error('Fee not found');

      // Generate month name from month and year
      const month_name = generateMonthName(data.month, data.year);

      const invoices = data.student_ids.map(student_id => {
        const student = students.find(s => s.id === student_id);
        return {
        student_id,
        fee_id: data.fee_id,
          amount: student.monthly_fee, // Use student's individual rate
          month_name: month_name,
        due_date: data.due_date,
        status: 'unpaid',
        };
      });

      const { error } = await supabase.from('invoices').insert(invoices);
      if (error) throw error;

      return invoices.length;
    },
    onSuccess: (count) => {
      toast.success(`Successfully generated ${count} invoices!`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate invoices');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    generateMutation.mutate(formData);
  };

  const toggleStudent = (studentId) => {
    setFormData(prev => ({
      ...prev,
      student_ids: prev.student_ids.includes(studentId)
        ? prev.student_ids.filter(id => id !== studentId)
        : [...prev.student_ids, studentId]
    }));
  };

  const selectAll = () => {
    setFormData(prev => ({
      ...prev,
      student_ids: students?.map(s => s.id) || []
    }));
  };

  const deselectAll = () => {
    setFormData(prev => ({ ...prev, student_ids: [] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Custom Generate Invoices</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Fee Type *
            </label>
            <select
              required
              value={formData.fee_id}
              onChange={(e) => setFormData({ ...formData, fee_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a fee...</option>
              {fees?.map((fee) => (
                <option key={fee.id} value={fee.id}>
                  {fee.fee_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Month / Bisha *
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Month...</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year / Sanadka *
              </label>
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Auto-filled) *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            <p className="text-xs text-gray-500 mt-1">Auto-set to last day of month, can be changed if needed</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Students * ({formData.student_ids.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs text-gray-600 hover:text-gray-700"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-xl max-h-64 overflow-y-auto p-3 space-y-2">
              {students?.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.student_ids.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">{student.student_name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Selected'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




