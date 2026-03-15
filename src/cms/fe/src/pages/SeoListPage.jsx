import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Edit2, Search, Filter, Globe, Book, Layers, FileText } from 'lucide-react';
import api from '../services/api';

const SeoListPage = () => {
    const [page, setPage] = useState(0);
    const [entityType, setEntityType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const limit = 20;

    const { data: seoItems, isLoading } = useQuery({
        queryKey: ['seo-list', page, entityType, searchTerm],
        queryFn: async () => {
            let url = `/seo?skip=${page * limit}&limit=${limit}`;
            if (entityType) url += `&entity_type=${entityType}`;
            if (searchTerm) url += `&path_search=${searchTerm}`;
            const res = await api.get(url);
            return res.data;
        }
    });

    const { data: countData } = useQuery({
        queryKey: ['seo-count', entityType, searchTerm],
        queryFn: async () => {
            let url = `/seo/count?`;
            if (entityType) url += `&entity_type=${entityType}`;
            if (searchTerm) url += `&path_search=${searchTerm}`;
            const res = await api.get(url);
            return res.data;
        }
    });

    const totalCount = countData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const getEntityIcon = (type) => {
        switch (type) {
            case 'comic': return <Book size={16} className="text-blue-500" />;
            case 'chapter': return <FileText size={16} className="text-green-500" />;
            case 'category': return <Layers size={16} className="text-purple-500" />;
            default: return <Globe size={16} className="text-gray-500" />;
        }
    };

    const getEntityLabel = (type) => {
        switch (type) {
            case 'comic': return 'Truyện';
            case 'chapter': return 'Chương';
            case 'category': return 'Thể loại';
            default: return 'Trang';
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-full">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý SEO</h1>
            </div>

            {/* Tabs for Entity Filtering */}
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                {[
                    { id: '', label: 'Tất cả', icon: <Globe size={18} /> },
                    { id: 'comic', label: 'Truyện', icon: <Book size={18} /> },
                    { id: 'chapter', label: 'Chương', icon: <FileText size={18} /> },
                    { id: 'category', label: 'Thể loại', icon: <Layers size={18} /> },
                    { id: 'page', label: 'Trang', icon: < Globe size={18} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setEntityType(tab.id);
                            setPage(0);
                        }}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            entityType === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo slug/đường dẫn..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0);
                        }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Đường dẫn (Slug)</th>
                                <th className="px-6 py-4 font-medium">Loại đối tượng</th>
                                <th className="px-6 py-4 font-medium">SEO Title</th>
                                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {seoItems?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600">
                                        {item.path}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getEntityIcon(item.entity_type)}
                                            <span className="text-sm font-medium">{getEntityLabel(item.entity_type)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 line-clamp-1">{item.title || 'Chưa có tiêu đề'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {item.is_published ? 'Đã đăng' : 'Bản nháp'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/seo-edit/seo/${item.id}`)}
                                            className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Sửa SEO"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {seoItems?.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                        Không tìm thấy dữ liệu SEO phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Hiển thị {page * limit + 1} - {Math.min((page + 1) * limit, totalCount)} trong tổng số {totalCount}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1 font-medium">{page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={page === totalPages - 1}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeoListPage;
