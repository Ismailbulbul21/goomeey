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
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">
          School Finance
        </h1>
        <p className="text-sm text-gray-500 mt-1">Maamulka Lacagaha</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs opacity-75">{item.nameAr}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-gray-50 rounded-xl mb-3">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout / Kala bax</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};


