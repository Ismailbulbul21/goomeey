import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Fetch monthly collection data for chart
  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('month_name, amount, status')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

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
        amount: amount.toFixed(2),
      }));
    },
  });

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
      title: 'Unpaid Invoices',
      titleAr: 'Biilasha Aan La Bixin',
      value: stats?.unpaid_invoices_count || 0,
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Unpaid Amount',
      titleAr: 'Lacagta Hadhay',
      value: `$${parseFloat(stats?.unpaid_amount || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Bogga Hore - School Finance Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
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
      {monthlyData && monthlyData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Monthly Collections / Ururinta Bisha
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Payments / Bixinaha Ugu Dambeeyay
          </h2>
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
                    Date / Taariikhda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method / Habka
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPayments.map((payment) => (
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
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent payments</p>
              <p className="text-sm text-gray-500">Bixin ma jirto hadda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


