import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Users, Settings } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-4 px-2">
          <AdminNavLink to="/admin/overview" icon={<LayoutDashboard size={20} />}>Overview</AdminNavLink>
          <AdminNavLink to="/admin/users" icon={<Users size={20} />}>Users</AdminNavLink>
          <AdminNavLink to="/admin/content" icon={<BarChart2 size={20} />}>Content</AdminNavLink>
          <AdminNavLink to="/admin/operations" icon={<Settings size={20} />}>Operations</AdminNavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* The Outlet will render the specific admin pages based on the route */}
        <Outlet />
      </main>
    </div>
  );
};

interface AdminNavLinkProps {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const AdminNavLink: React.FC<AdminNavLinkProps> = ({ to, children, icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${
          isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`
      }
    >
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  );
};

export default AdminDashboardPage;
