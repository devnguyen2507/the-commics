import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Edit2, List } from 'lucide-react';
import api from '../services/api';
import SeoEditModal from '../components/SeoEditModal';

const ComicsPage = () => {
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedComic, setSelectedComic] = useState(null);
    const queryClient = useQueryClient();

    const { data: comics, isLoading } = useQuery({
        queryKey: ['comics', page],
        queryFn: async () => {
            const res = await api.get(`/comics?skip=${page * 50}&limit=50`);
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await api.put(`/comics/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comics'] });
            setModalOpen(false);
        }
    });

    const handleTogglePublish = (comic) => {
        updateMutation.mutate({
            id: comic.id,
            data: { is_publish: !comic.is_publish }
        });
    };

    const handleEditClick = (comic) => {
        setSelectedComic(comic);
        setModalOpen(true);
    };

    const handleSaveSeo = async (data) => {
        if (!selectedComic) return;
        await updateMutation.mutateAsync({
            id: selectedComic.id,
            data: data
        });
    };

    if (isLoading) return <div className="flex items-center justify-center h-full">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Danh sách Truyện</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Tên Truyện</th>
                                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {comics?.map((comic) => (
                                <tr key={comic.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{comic.title}</div>
                                        <div className="text-sm text-gray-500 line-clamp-1">{comic.description || 'Chưa có mô tả'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={comic.is_publish}
                                                    onChange={() => handleTogglePublish(comic)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/comics/${comic.id}/chapters`}
                                                className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Xem chapters"
                                            >
                                                <List size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleEditClick(comic)}
                                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Sửa SEO"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SeoEditModal
                key={selectedComic ? `comic-${selectedComic.id}` : 'none'}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedComic(null);
                }}
                data={selectedComic}
                onSave={handleSaveSeo}
                isChapter={false}
            />
        </div>
    );
};

export default ComicsPage;
