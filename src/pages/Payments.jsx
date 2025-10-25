import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Search, CheckCircle, X, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const queryClient = useQueryClient();

  // Fetch unpaid invoices
  const { data: unpaidInvoices, isLoading } = useQuery({
    queryKey: ['unpaid-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          students!inner(student_name, parent_name, parent_phone),
          fees!inner(fee_name)
        `)
        .eq('status', 'unpaid')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner(
            *,
            students!inner(student_name),
            fees!inner(fee_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Filter invoices
  const filteredInvoices = unpaidInvoices?.filter((invoice) =>
    invoice.students.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.fees.fee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.month_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Bixinta - Record Student Payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unpaid Invoices</p>
              <p className="text-xs text-gray-500">Biilasha Aan La Bixin</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{unpaidInvoices?.length || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-xs text-gray-500">Wadarta Hadhay</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${unpaidInvoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Payments</p>
              <p className="text-xs text-gray-500">Bixinaha Cusub</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{paymentHistory?.length || 0}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search unpaid invoices / Raadi biilal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Unpaid Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Unpaid Invoices / Biilasha Aan La Bixin
          </h2>
        </div>
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
                    Parent / Waalidka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee / Lacagta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month / Bisha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount / Qadarka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
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
                      {invoice.students.parent_name}
                      <br />
                      <span className="text-xs text-gray-500">{invoice.students.parent_phone}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.fees.fee_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.month_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${parseFloat(invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600">All invoices are paid!</p>
              <p className="text-sm text-gray-500">Dhammaan biilasha waa la bixiyay</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Payment History / Taariikhda Bixinta
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.invoices.students.student_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.invoices.fees.fee_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${parseFloat(payment.amount_paid).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 capitalize">
                        {payment.payment_method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            queryClient.invalidateQueries(['unpaid-invoices']);
            queryClient.invalidateQueries(['payment-history']);
            queryClient.invalidateQueries(['invoices']);
            queryClient.invalidateQueries(['dashboard-stats']);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ invoice, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    amount_paid: invoice.amount,
  });

  const paymentMutation = useMutation({
    mutationFn: async (data) => {
      // Insert payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          invoice_id: invoice.id,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          amount_paid: data.amount_paid,
        }]);

      if (paymentError) throw paymentError;

      // Note: Invoice status will be automatically updated by the trigger we created
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    paymentMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Record Payment / Diiwaan Geli Bixinta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium text-gray-900">{invoice.students.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium text-gray-900">{invoice.fees.fee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Month:</span>
                <span className="font-medium text-gray-900">{invoice.month_name}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">${parseFloat(invoice.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date / Taariikhda Bixinta *
              </label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method / Habka Bixinta *
              </label>
              <select
                required
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="cash">Cash / Lacag Caddaan</option>
                <option value="mobile money">Mobile Money / Lacag Telefoon</option>
                <option value="bank">Bank / Bangiga</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid / Qadarka La Bixiyay *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
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
                disabled={paymentMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};








