import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import api from '../services/api';
import SeoEditModal from '../components/SeoEditModal';

const ChaptersPage = () => {
    const { comicId } = useParams();
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const queryClient = useQueryClient();

    const { data: comic } = useQuery({
        queryKey: ['comic', comicId],
        queryFn: async () => {
            const res = await api.get(`/comics/${comicId}`);
            return res.data;
        }
    });

    const { data: chapters, isLoading } = useQuery({
        queryKey: ['chapters', comicId, page],
        queryFn: async () => {
            const res = await api.get(`/chapters?comic_id=${comicId}&skip=${page * 100}&limit=100`);
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await api.put(`/chapters/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chapters', comicId] });
            setModalOpen(false);
        }
    });

    const handleTogglePublish = (chapter) => {
        updateMutation.mutate({
            id: chapter.id,
            data: { is_publish: !chapter.is_publish }
        });
    };

    const handleEditClick = (chapter) => {
        setSelectedChapter(chapter);
        setModalOpen(true);
    };

    const handleSaveSeo = async (data) => {
        if (!selectedChapter) return;
        await updateMutation.mutateAsync({
            id: selectedChapter.id,
            // Chapter only needs description logic based on our specs
            data: { description: data.description }
        });
    };

    if (isLoading) return <div className="flex items-center justify-center h-full">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/comics" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Danh sách Chương</h1>
                    <p className="text-gray-500 font-medium">{comic?.title}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Chương</th>
                                <th className="px-6 py-4 font-medium">Mô tả (SEO)</th>
                                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {chapters?.map((chapter) => (
                                <tr key={chapter.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        Chapter {chapter.chapter_number}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                        {chapter.description || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={chapter.is_publish}
                                                    onChange={() => handleTogglePublish(chapter)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEditClick(chapter)}
                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Sửa SEO"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {chapters?.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Không có chương nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SeoEditModal
                key={selectedChapter ? `chapter-${selectedChapter.id}` : 'none'}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedChapter(null);
                }}
                data={selectedChapter}
                onSave={handleSaveSeo}
                isChapter={true}
            />
        </div>
    );
};

export default ChaptersPage;
