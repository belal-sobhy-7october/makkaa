import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ClipboardList, Tag } from 'lucide-react';

const navLinkBase =
  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200';
const navClass = ({ isActive }) =>
  `${navLinkBase} ${
    isActive
      ? 'bg-makka-brown/10 text-makka-brown shadow-sm'
      : 'text-makka-cocoa/80 hover:bg-makka-sand/30 hover:text-makka-cocoa'
  }`;

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-makka-cream" dir="rtl">
      <aside className="w-64 shrink-0 bg-white border-l border-makka-sand shadow-soft hidden md:flex flex-col">
        <div className="p-5 border-b border-makka-sand">
          <h2 className="font-display text-lg font-semibold text-makka-cocoa">لوحة التحكم</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/admin" end className={navClass}>
            <LayoutDashboard className="w-5 h-5" />
            الإحصائيات
          </NavLink>
          <NavLink to="/admin/products" className={navClass}>
            <Package className="w-5 h-5" />
            المنتجات
          </NavLink>
          <NavLink to="/admin/categories" className={navClass}>
            <FolderTree className="w-5 h-5" />
            التصنيفات
          </NavLink>
          <NavLink to="/admin/orders" className={navClass}>
            <ClipboardList className="w-5 h-5" />
            الطلبات
          </NavLink>
          <NavLink to="/admin/coupons" className={navClass}>
            <Tag className="w-5 h-5" />
            الكوبونات
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
