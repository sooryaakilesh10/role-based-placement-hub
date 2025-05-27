
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  BarChart3
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['Admin', 'Manager', 'Officer']
  },
  {
    label: 'Companies',
    href: '/companies',
    icon: Building2,
    roles: ['Admin', 'Manager', 'Officer']
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['Admin']
  },
  {
    label: 'Pending Approvals',
    href: '/pending',
    icon: ClipboardList,
    roles: ['Admin', 'Manager']
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['Admin', 'Manager']
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['Admin', 'Manager', 'Officer']
  }
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Placement Platform</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.role}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
