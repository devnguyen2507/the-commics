import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const SeoEditorPage = () => {
    const { entity, id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        name: '' // for categories
    });
    const [baseData, setBaseData] = useState(null);

    const getEndpoint = () => {
        const plural = entity === 'category' ? 'categories' : `${entity}s`;
        return `/${plural}/${id}`;
    };

    const { data: detail, isLoading, isError } = useQuery({
        queryKey: ['seo-detail', entity, id],
        queryFn: async () => {
            const res = await api.get(getEndpoint());
            return res.data;
        },
        enabled: !!entity && !!id
    });

    useEffect(() => {
        if (detail) {
            const initialValues = {
                title: detail.title || '',
                description: detail.description || '',
                name: detail.name || ''
            };
            setFormData(initialValues);
            setBaseData(initialValues);
        }
    }, [detail]);

    const hasChanged = baseData && (
        formData.title !== baseData.title ||
        formData.description !== baseData.description ||
        formData.name !== baseData.name
    );

    // Prompt user before leaving if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanged) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanged]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const payload = { ...data };
            // Clean payload based on entity
            if (entity === 'chapter') {
                delete payload.title;
                delete payload.name;
            } else if (entity === 'comic') {
                delete payload.name;
            } else if (entity === 'category') {
                delete payload.title;
            }
            return await api.put(getEndpoint(), payload);
        },
        onSuccess: () => {
            const plural = entity === 'category' ? 'categories' : `${entity}s`;
            queryClient.invalidateQueries({ queryKey: [plural] });
            queryClient.invalidateQueries({ queryKey: ['seo-detail', entity, id] });
            // Navigate back
            if (entity === 'chapter') {
                navigate(-1);
            } else {
                navigate(`/${plural}`);
            }
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        if (hasChanged) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-gray-500 font-medium text-lg">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
                <AlertCircle size={48} />
                <p className="text-xl font-bold">Không tìm thấy dữ liệu!</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const getEntityName = () => {
        switch (entity) {
            case 'comic': return 'Truyện';
            case 'chapter': return 'Chương';
            case 'category': return 'Thể loại';
            default: return 'Đối tượng';
        }
    };

    const displayTitle = detail?.title || detail?.name || `Chapter ${detail?.chapter_number}`;

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Chỉnh sửa SEO {getEntityName()}
                        </h1>
                        <p className="text-gray-500 font-medium truncate max-w-2xl">{displayTitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending || !hasChanged}
                        className="flex items-center gap-2 px-6 py-2 text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Lưu thay đổi</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
                    {entity === 'category' && (
                        <div className="shrink-0">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Tên Thể loại
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
                                placeholder="Nhập tên thể loại..."
                            />
                        </div>
                    )}

                    {entity === 'comic' && (
                        <div className="shrink-0">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                SEO Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
                                placeholder="Nhập tiêu đề chuẩn SEO..."
                            />
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                                SEO Description / Content
                            </label>
                            <span className={`text-sm font-mono ${formData.description.length > 150 ? 'text-blue-600' : 'text-gray-400'}`}>
                                {formData.description.length} words (approx)
                            </span>
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="flex-1 w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none font-mono text-base leading-relaxed"
                            placeholder="Nhập nội dung SEO (khoảng 1000 từ)..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeoEditorPage;
