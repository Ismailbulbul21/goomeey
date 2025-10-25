import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Plus, X, Loader2, AlertCircle, Edit, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const Fees = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const queryClient = useQueryClient();

  // Fetch fees
  const { data: fees, isLoading } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees</h1>
          <p className="text-gray-600 mt-1">Lacagaha - Manage Fee Types</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Fee Type</span>
        </button>
      </div>

      {/* Fees Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : fees && fees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary-600" />
                </div>
                <button
                  onClick={() => setEditingFee(fee)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {fee.fee_name}
              </h3>
              
              <p className="text-sm text-gray-500 mb-3">
                Fee Type
              </p>
              
              {fee.description && (
                <p className="text-sm text-gray-600">
                  {fee.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No fees found</p>
          <p className="text-sm text-gray-500">Ma jiraan noocyo lacag</p>
        </div>
      )}

      {/* Add/Edit Fee Modal */}
      {(showAddModal || editingFee) && (
        <FeeModal
          fee={editingFee}
          onClose={() => {
            setShowAddModal(false);
            setEditingFee(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(['fees']);
            setShowAddModal(false);
            setEditingFee(null);
          }}
        />
      )}
    </div>
  );
};

// Fee Modal Component
const FeeModal = ({ fee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fee_name: fee?.fee_name || '',
    description: fee?.description || '',
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (fee) {
        // Update existing fee
        const { error } = await supabase
          .from('fees')
          .update(data)
          .eq('id', fee.id);

        if (error) throw error;
      } else {
        // Add new fee
        const { error } = await supabase
          .from('fees')
          .insert([data]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(fee ? 'Fee updated successfully!' : 'Fee added successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save fee');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Fee template - Only Monthly Tuition
  const templates = [
    { fee_name: 'Monthly Tuition', description: 'Regular monthly tuition fee' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {fee ? 'Edit Fee' : 'Add New Fee'} / {fee ? 'Wax ka Badal' : 'Ku Dar Lacag Cusub'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!fee && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="text-sm font-medium text-primary-900 mb-2">Quick Templates:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(template)}
                    className="px-3 py-1 text-xs bg-white border border-primary-300 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    {template.fee_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Name / Magaca Lacagta *
            </label>
            <input
              type="text"
              required
              value={formData.fee_name}
              onChange={(e) => setFormData({ ...formData, fee_name: e.target.value })}
              placeholder="e.g., Monthly Tuition"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Sharaxaad
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows={3}
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
              disabled={saveMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                fee ? 'Update Fee' : 'Add Fee'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



