'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiPlus,
    FiEdit3,
    FiTrash2,
    FiUpload,
    FiImage,
    FiAlertCircle,
    FiCheckCircle,
    FiLayers,
    FiClock,
    FiSearch,
    FiLink,
    FiX
} from 'react-icons/fi';

export default function AdminUpliftsPage() {
    const router = useRouter();

    const [uplifts, setUplifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    const [submitting, setSubmitting] = useState(false);

    // ================= DELETE MODAL STATE =================
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ================= ALERT =================
    const [alert, setAlert] = useState({ open: false, type: 'info', message: '' });

    const showAlert = (message, type = 'info') => {
        setAlert({ open: true, message, type });
        setTimeout(() => setAlert({ open: false, message: '', type: 'info' }), 3000);
    };

    /* =========================
        FETCH UPLIFTS
    ========================= */
    const fetchUplifts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/uplifts', { cache: 'no-store' });
            const response = await res.json();

            console.log('API Response:', response);

            let list = [];
            if (response.success && Array.isArray(response.data)) {
                list = response.data;
            } else if (Array.isArray(response)) {
                list = response;
            } else if (response.data && Array.isArray(response.data)) {
                list = response.data;
            }

            setUplifts(list);
        } catch (err) {
            console.error('Fetch error:', err);
            showAlert('Failed to load uplifts', 'error');
            setUplifts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUplifts();
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, []);

    /* =========================
        INPUT & FILE HANDLERS
    ========================= */
    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image size should be less than 5MB', 'error');
            return;
        }

        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImageUrl(''); // Clear URL when file is selected
        setUploadMethod('file');
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        
        // If URL is valid, show preview
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            setImagePreview(url);
            setSelectedFile(null);
            setUploadMethod('url');
        } else {
            // If URL is cleared or invalid, remove preview
            if (imagePreview && !imagePreview.startsWith('blob:')) {
                setImagePreview(null);
            }
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setSelectedFile(null);
        setImageUrl('');
        setImagePreview(null);
    };

    const handleUploadMethodChange = (method) => {
        setUploadMethod(method);
        // Clear the other method's data
        if (method === 'file') {
            setImageUrl('');
            if (imagePreview && !imagePreview.startsWith('blob:')) {
                setImagePreview(null);
            }
        } else {
            setSelectedFile(null);
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
            }
        }
    };

    /* =========================
        CREATE
    ========================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            showAlert('Title and description are required', 'error');
            return;
        }

        if (!selectedFile && !imageUrl) {
            showAlert('Please add an image (upload or URL)', 'error');
            return;
        }

        try {
            setSubmitting(true);

            // First create the uplift
            const upliftRes = await fetch('/api/uplifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description
                })
            });

            const upliftData = await upliftRes.json();

            if (!upliftData.success) {
                throw new Error(upliftData.message || 'Failed to create uplift');
            }

            const newUpliftId = upliftData.id;

            // Then upload image if exists
            if (newUpliftId) {
                let mediaUploaded = false;

                if (selectedFile) {
                    // Upload file
                    const mediaFormData = new FormData();
                    mediaFormData.append('file', selectedFile);
                    mediaFormData.append('owner_type', 'uplift');
                    mediaFormData.append('owner_id', newUpliftId.toString());

                    const mediaRes = await fetch('/api/media', {
                        method: 'POST',
                        body: mediaFormData
                    });

                    if (mediaRes.ok) {
                        mediaUploaded = true;
                    } else {
                        console.error('Media upload failed');
                    }
                } else if (imageUrl) {
                    // Upload URL
                    const mediaFormData = new FormData();
                    mediaFormData.append('url', imageUrl);
                    mediaFormData.append('owner_type', 'uplift');
                    mediaFormData.append('owner_id', newUpliftId.toString());

                    const mediaRes = await fetch('/api/media', {
                        method: 'POST',
                        body: mediaFormData
                    });

                    if (mediaRes.ok) {
                        mediaUploaded = true;
                    } else {
                        console.error('Media URL upload failed');
                    }
                }

                showAlert(
                    mediaUploaded 
                        ? 'Uplift created successfully with image' 
                        : 'Uplift created but image upload failed',
                    mediaUploaded ? 'success' : 'error'
                );
            }

            // Reset form
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setForm({ title: '', description: '' });
            setSelectedFile(null);
            setImageUrl('');
            setImagePreview(null);
            setUploadMethod('file');

            // Refresh the list
            await fetchUplifts();

        } catch (err) {
            console.error('Create error:', err);
            showAlert(err.message || 'Failed to create uplift', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    /* =========================
        DELETE
    ========================= */
    const openDeleteModal = (item) => {
        setDeleteTarget(item);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            setIsDeleting(true);

            // First delete the media if exists
            if (deleteTarget.image_url) {
                try {
                    await fetch('/api/media', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: deleteTarget.image_url })
                    });
                } catch (mediaErr) {
                    console.error('Media deletion error:', mediaErr);
                }
            }

            // Delete the uplift
            const res = await fetch(`/api/uplifts/${deleteTarget.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete');
            }

            setDeleteTarget(null);
            showAlert('Uplift deleted successfully', 'success');
            await fetchUplifts();

        } catch (err) {
            console.error('Delete error:', err);
            showAlert(err.message || 'Failed to delete uplift', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (id) => {
        router.push(`/admin/uplifts/edit/${id}`);
    };

    // Helper function to get image URL from uplift item
    const getImageUrl = (item) => {
        if (!item) return null;
        return item.image_url || null;
    };

    // Filter uplifts based on search
    const filteredUplifts = uplifts.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

            {/* ================= ALERT TOAST ================= */}
            {alert.open && (
                <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl ${alert.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : alert.type === 'error'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        }`}>
                        {alert.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
                        <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* ================= HEADER ================= */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                Uplifts Manager
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">
                                Create and manage your uplift content
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                                <FiLayers className="text-purple-400" />
                                <span className="text-white font-semibold">{uplifts.length}</span>
                                <span className="text-gray-400 text-sm">Entries</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* ================= LEFT: CREATION FORM ================= */}
                    <div className="lg:col-span-5 lg:sticky lg:top-6">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <FiPlus className="text-purple-400 text-lg" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Create New Entry</h2>
                                    <p className="text-sm text-gray-400">Add a new uplift item</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter title..."
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Enter description..."
                                        rows={4}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Image Upload - NEW */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Cover Image *</label>
                                    
                                    {/* Upload Method Toggle */}
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => handleUploadMethodChange('file')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                uploadMethod === 'file'
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                            }`}
                                        >
                                            <FiUpload size={16} />
                                            Upload File
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUploadMethodChange('url')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                uploadMethod === 'url'
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                            }`}
                                        >
                                            <FiLink size={16} />
                                            Image URL
                                        </button>
                                    </div>

                                    {!imagePreview ? (
                                        <>
                                            {uploadMethod === 'file' ? (
                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 hover:border-purple-500/50 transition-all duration-200 group">
                                                    <FiUpload className="w-8 h-8 text-gray-500 group-hover:text-purple-400 mb-3 transition-colors" />
                                                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                                        Click to upload image
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        PNG, JPG, WEBP (Max 5MB)
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="url"
                                                        value={imageUrl}
                                                        onChange={handleUrlChange}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500"
                                                    />
                                                    {imageUrl && !imageUrl.startsWith('http') && (
                                                        <p className="text-xs text-red-400 mt-1">
                                                            Please enter a valid URL (starting with http:// or https://)
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700 group">
                                            <Image
                                                src={imagePreview}
                                                alt="preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-400 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                                >
                                                    <FiX className="inline mr-1" />
                                                    Remove
                                                </button>
                                                {uploadMethod === 'file' ? (
                                                    <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium cursor-pointer transition-all duration-200">
                                                        Change File
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setImageUrl('');
                                                            setUploadMethod('url');
                                                        }}
                                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                                    >
                                                        Change URL
                                                    </button>
                                                )}
                                            </div>
                                            <div className="absolute top-2 right-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5">
                                                <span className="text-xs text-emerald-400 font-medium">
                                                    {uploadMethod === 'file' ? '📁 File' : '🔗 URL'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus size={18} />
                                            Create Entry
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ================= RIGHT: LIST ================= */}
                    <div className="lg:col-span-7">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">

                            {/* Search & Header */}
                            <div className="p-4 sm:p-6 border-b border-slate-700/50">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <FiLayers className="text-purple-400" />
                                        All Entries
                                    </h2>

                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-64">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search entries..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* List Items */}
                            <div className="divide-y divide-slate-700/50 max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-purple-500 mb-4"></div>
                                        <p className="text-gray-400">Loading entries...</p>
                                    </div>
                                ) : filteredUplifts.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <FiLayers className="mx-auto text-5xl text-gray-600 mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            {searchTerm ? 'No matches found' : 'No entries yet'}
                                        </h3>
                                        <p className="text-gray-400">
                                            {searchTerm ? 'Try a different search term' : 'Create your first uplift entry'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredUplifts.map((item) => {
                                        const imageUrl = getImageUrl(item);
                                        return (
                                            <div
                                                key={item.id}
                                                className="group p-4 sm:p-6 hover:bg-slate-800/30 transition-all duration-200"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Thumbnail */}
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0">
                                                        {imageUrl ? (
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={item.title}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="80px"
                                                                    onError={(e) => {
                                                                        console.error('Image failed to load:', imageUrl);
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FiImage className="text-gray-600 text-2xl" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <FiClock size={12} />
                                                                ID: {item.id}
                                                            </span>
                                                            {item.created_at && (
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleEdit(item.id)}
                                                            className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <FiEdit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(item)}
                                                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all duration-200"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer Stats */}
                            {!loading && filteredUplifts.length > 0 && (
                                <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
                                    <p className="text-xs text-gray-500 text-center">
                                        Showing {filteredUplifts.length} of {uplifts.length} entries
                                        {searchTerm && ' (filtered)'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= DELETE MODAL ================= */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="text-red-400 text-2xl" />
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">
                                Delete Entry?
                            </h3>

                            <p className="text-gray-400 mb-1">
                                Are you sure you want to delete
                            </p>
                            <p className="text-white font-semibold mb-1">
                                "{deleteTarget.title}"
                            </p>
                            <p className="text-sm text-red-400/80 mb-6">
                                This action cannot be undone.
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Deleting...
                                        </span>
                                    ) : 'Delete Entry'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}