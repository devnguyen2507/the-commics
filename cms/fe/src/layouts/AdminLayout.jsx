import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Book, Layers, LogOut, Menu } from 'lucide-react';

const AdminLayout = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-bg-main">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-sidebar text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold font-black uppercase">Commics CMS</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        to="/comics"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.startsWith('/comics') ? 'bg-primary' : 'hover:bg-gray-800'}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Book size={20} />
                        <span className="font-semibold">Quản lý Truyện</span>
                    </Link>
                    <Link
                        to="/categories"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.startsWith('/categories') ? 'bg-primary' : 'hover:bg-gray-800'}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Layers size={20} />
                        <span className="font-semibold">Quản lý Thể loại</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm shrink-0">
                    <button
                        className="p-2 rounded-md lg:hidden hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Admin</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={16} />
                            Đăng xuất
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
