import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Edit2, Search, Loader2 } from 'lucide-react';
import api from '../services/api';

const CategoriesPage = () => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories?limit=200');
            return res.data;
        }
    });

    const [showCreate, setShowCreate] = useState(false);
    const [newCat, setNewCat] = useState({ id: '', name: '' });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            return await api.post('/categories', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setShowCreate(false);
            setNewCat({ id: '', name: '' });
        }
    });

    const filteredCategories = categories?.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-gray-500 font-medium">Đang tải thể loại...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Quản lý Thể loại ({categories?.length || 0})</h1>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        {showCreate ? 'Hủy bỏ' : 'Thêm Thể loại'}
                    </button>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thể loại..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {showCreate && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Mã (Slug ID)</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: netorare"
                            value={newCat.id}
                            onChange={(e) => setNewCat({ ...newCat, id: e.target.value })}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white font-mono"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Tên Thể loại</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Ngoại tình"
                            value={newCat.name}
                            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                        />
                    </div>
                    <button
                        onClick={() => createMutation.mutate(newCat)}
                        disabled={!newCat.id || !newCat.name || createMutation.isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50"
                    >
                        {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Tạo mới'}
                    </button>
                    {createMutation.isError && (
                        <p className="w-full text-red-500 text-xs mt-1 italic font-medium">Lỗi: {createMutation.error.response?.data?.detail || 'ID đã tồn tại'}</p>
                    )}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Tên Thể loại</th>
                                <th className="px-6 py-4 font-medium">Mô tả SEO</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCategories?.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{category.name}</div>
                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{category.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 line-clamp-2 max-w-xl">
                                            {category.description || <span className="text-gray-300 italic">Chưa có nội dung SEO</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/seo-edit/category/${category.id}`)}
                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center gap-2"
                                            title="Sửa SEO"
                                        >
                                            <Edit2 size={18} />
                                            <span className="text-sm font-medium">Sửa SEO</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories?.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        Không tìm thấy thể loại nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;
