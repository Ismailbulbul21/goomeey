import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

export const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch recent payments
  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['recent-payments'],
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
        .limit(5);

      if (error) throw error;
      return data;
    },
  });


  const statCards = [
    {
      title: 'Total Students',
      titleAr: 'Wadarta Ardayda',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Total Collected',
      titleAr: 'Wadarta La Ururiyay',
      value: `$${parseFloat(stats?.total_collected || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    {
      title: 'Unpaid Invoices',
      titleAr: 'Biilasha Aan La Bixin',
      value: stats?.unpaid_invoices_count || 0,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'Unpaid Amount',
      titleAr: 'Lacagta Hadhay',
      value: `$${parseFloat(stats?.unpaid_amount || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
    },
  ];

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm animate-pulse border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">Goomey Finance Overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.titleAr}</p>
            </div>
          ))}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Payments
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Bixinaha Ugu Dambeeyay</p>
          </div>
          <div className="overflow-x-auto">
            {paymentsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : recentPayments && recentPayments.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-900 font-medium">
                        {payment.invoices.students.student_name}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">
                        {payment.invoices.fees.fee_name}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-semibold text-green-600">
                        ${parseFloat(payment.amount_paid).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 capitalize border border-blue-100">
                          {payment.payment_method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No recent payments</p>
                <p className="text-xs text-gray-500 mt-1">Bixin ma jirto hadda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


