import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  FileText, 
  DollarSign, 
  BarChart3, 
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      nameAr: 'Bogga Hore',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Students',
      nameAr: 'Ardayda',
      href: '/students',
      icon: Users,
    },
    {
      name: 'Fees',
      nameAr: 'Lacagaha',
      href: '/fees',
      icon: Receipt,
    },
    {
      name: 'Invoices',
      nameAr: 'Biilasha',
      href: '/invoices',
      icon: FileText,
    },
    {
      name: 'Payments',
      nameAr: 'Bixinta',
      href: '/payments',
      icon: DollarSign,
    },
    {
      name: 'Reports',
      nameAr: 'Warbixino',
      href: '/reports',
      icon: BarChart3,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Goomey Finance
            </h1>
            <p className="text-xs text-gray-500">Maamulka Lacagaha</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className={`text-xs ${
                    isActive ? 'text-blue-100' : 'text-gray-400'
                  }`}>{item.nameAr}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-gray-100">
        <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl mb-4">
          <p className="text-xs text-gray-500 font-medium">Logged in as</p>
          <p className="text-sm font-semibold text-gray-900 truncate mt-1">
            {user?.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-4 px-4 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">Logout / Kala bax</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-200"
      >
        {isMobileOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 fixed inset-y-0 left-0 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden flex flex-col w-72 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};


