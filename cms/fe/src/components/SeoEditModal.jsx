import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';

const SeoEditModal = ({ isOpen, onClose, data, onSave, isChapter }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [baseData, setBaseData] = useState({
        title: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!isOpen || !data?.id) return;

            setFetching(true);
            try {
                const endpoint = isChapter ? `/chapters/${data.id}` : `/comics/${data.id}`;
                const res = await api.get(endpoint);
                const detail = res.data;

                const initialValues = {
                    title: detail.title || '',
                    description: detail.description || ''
                };

                setBaseData(initialValues);
                setFormData(initialValues);
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết:', error);
                alert('Không thể lấy dữ liệu mới nhất từ server');
            } finally {
                setFetching(false);
            }
        };

        fetchDetail();
    }, [isOpen, data?.id, isChapter]);

    if (!isOpen) return null;

    const hasChanged =
        formData.title !== baseData.title ||
        formData.description !== baseData.description;

    const handleClose = () => {
        if (hasChanged) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hasChanged) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi lưu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold">
                        Cập nhật SEO: {isChapter ? 'Chương' : 'Truyện'}
                    </h2>
                    <button onClick={handleClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {fetching ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-gray-500 font-medium">Đang tải dữ liệu mới nhất...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="p-6 space-y-4 overflow-y-auto">
                            {!isChapter && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title (SEO Title)
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="Nhập tiêu đề..."
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (SEO Description)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                                    placeholder="Nhập mô tả chuẩn SEO..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !hasChanged}
                                className="px-5 py-2.5 text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SeoEditModal;
