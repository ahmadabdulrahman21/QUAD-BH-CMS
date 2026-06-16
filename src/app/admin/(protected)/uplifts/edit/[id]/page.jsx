'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiArrowLeft,
    FiUpload,
    FiTrash2,
    FiSave,
    FiX,
    FiImage,
    FiAlertCircle,
    FiCheckCircle,
    FiRefreshCw,
    FiEdit3,
    FiEye,
    FiFileText,
    FiLink
} from 'react-icons/fi';

export default function EditUpliftPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    const [urlInput, setUrlInput] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        image_url: '',
    });

    const [mediaId, setMediaId] = useState(null);
    const [alert, setAlert] = useState({ open: false, type: 'info', message: '' });

    const showAlert = (message, type = 'info') => {
        setAlert({ open: true, message, type });
        setTimeout(() => setAlert({ open: false, message: '', type: 'info' }), 3000);
    };

    // =========================
    // FETCH INITIAL DATA
    // =========================
    useEffect(() => {
        if (!id) return;

        const fetchUplift = async () => {
            try {
                setLoading(true);
                setError('');
                setImageError(false);

                const res = await fetch(`/api/uplifts/${id}`);
                const text = await res.text();

                let data;
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error('API returned invalid JSON response');
                }

                if (!res.ok || !data.success) {
                    throw new Error(data?.message || 'Failed to fetch uplift');
                }

                setForm({
                    title: data.data?.title || '',
                    description: data.data?.description || '',
                    image_url: data.data?.image_url || '',
                });

                setMediaId(data.data?.media_id || null);

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUplift();
    }, [id]);

    // =========================
    // INPUT HANDLER
    // =========================
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // =========================
    // MEDIA ASSET UPLOAD HANDLER (FILE)
    // =========================
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
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

        if (!id) {
            showAlert('Cannot upload media: Missing target ID', 'error');
            return;
        }

        try {
            setUploading(true);
            setImageError(false);

            // Clean up existing image if present
            if (mediaId || form.image_url) {
                try {
                    await fetch('/api/media', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            media_id: mediaId,
                            image_url: form.image_url
                        }),
                    });
                } catch (purgeErr) {
                    console.error("Failed to clear previous asset:", purgeErr);
                }
            }

            // Upload new image
            const formData = new FormData();
            formData.append('file', file);
            formData.append('owner_type', 'uplift');
            formData.append('owner_id', id.toString());

            const res = await fetch('/api/media', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data?.error || 'Failed to upload media');
            }

            setForm((prev) => ({
                ...prev,
                image_url: data.media?.url || '',
            }));
            setMediaId(data.media?.id || null);
            setUrlInput('');
            showAlert('Image uploaded successfully', 'success');

        } catch (err) {
            console.error(err);
            showAlert(`Upload failed: ${err.message}`, 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // =========================
    // MEDIA ASSET UPLOAD HANDLER (URL)
    // =========================
    const handleUrlUpload = async () => {
        if (!urlInput.trim()) {
            showAlert('Please enter an image URL', 'error');
            return;
        }

        // Validate URL
        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            showAlert('Please enter a valid URL (starting with http:// or https://)', 'error');
            return;
        }

        if (!id) {
            showAlert('Cannot upload media: Missing target ID', 'error');
            return;
        }

        try {
            setUploading(true);
            setImageError(false);

            // Clean up existing image if present
            if (mediaId || form.image_url) {
                try {
                    await fetch('/api/media', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            media_id: mediaId,
                            image_url: form.image_url
                        }),
                    });
                } catch (purgeErr) {
                    console.error("Failed to clear previous asset:", purgeErr);
                }
            }

            // Upload URL
            const formData = new FormData();
            formData.append('url', urlInput.trim());
            formData.append('owner_type', 'uplift');
            formData.append('owner_id', id.toString());

            const res = await fetch('/api/media', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data?.error || 'Failed to upload media URL');
            }

            setForm((prev) => ({
                ...prev,
                image_url: data.media?.url || '',
            }));
            setMediaId(data.media?.id || null);
            setUrlInput('');
            showAlert('Image URL added successfully', 'success');

        } catch (err) {
            console.error(err);
            showAlert(`URL upload failed: ${err.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    // =========================
    // DELETE IMAGE HANDLER
    // =========================
    const handleDeleteImage = async () => {
        if (!mediaId && !form.image_url) {
            showAlert('No image to delete', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this image?\n\nThis action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);

            const payload = {};

            if (mediaId) {
                payload.media_id = mediaId;
            }
            if (form.image_url) {
                payload.image_url = form.image_url;
                payload.url = form.image_url;
            }

            const res = await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data?.error || data?.message || 'Failed to delete image');
            }

            setForm((prev) => ({ ...prev, image_url: '' }));
            setMediaId(null);
            setImageError(false);
            setUrlInput('');
            showAlert('Image deleted successfully', 'success');

        } catch (err) {
            console.error('Delete error:', err);
            showAlert(`Delete failed: ${err.message}`, 'error');
        } finally {
            setDeleting(false);
        }
    };

    // =========================
    // UPDATE HANDLER
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id) {
            showAlert('Missing ID parameter', 'error');
            return;
        }

        if (!form.title.trim() || !form.description.trim()) {
            showAlert('Title and description are required', 'error');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: form.title,
                description: form.description,
                media_id: mediaId,
                image_url: form.image_url
            };

            const res = await fetch(`/api/uplifts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Update failed');
            }

            showAlert('Uplift updated successfully', 'success');
            setTimeout(() => router.push('/admin/uplifts'), 1500);

        } catch (err) {
            console.error(err);
            showAlert(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-purple-500 mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading uplift data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="text-red-400 text-2xl" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Error Loading Data</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200"
                    >
                        <FiArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const hasValidImage = form.image_url && form.image_url !== '' && !form.image_url.includes('No active image');

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

            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Edit Uplift</h1>
                            <p className="text-xs text-gray-500">Modify record #{id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        <span className="text-xs font-medium text-purple-400">Editing Mode</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* ================= LEFT: EDIT FORM ================= */}
                    <div className="lg:col-span-7">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <FiEdit3 className="text-purple-400 text-lg" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Edit Details</h2>
                                    <p className="text-sm text-gray-400">Update uplift information</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                                        <FiFileText size={14} />
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter uplift title..."
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                                        <FiFileText size={14} />
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Enter uplift description..."
                                        rows={6}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Image Section - UPDATED */}
                                <div className="border-t border-slate-700/50 pt-6">
                                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                        <FiImage size={14} />
                                        Image
                                    </label>

                                    <div className="space-y-4">
                                        {/* Upload Method Toggle */}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setUploadMethod('file')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${uploadMethod === 'file'
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                                    }`}
                                            >
                                                <FiUpload size={16} />
                                                Upload File
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadMethod('url')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${uploadMethod === 'url'
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                                    }`}
                                            >
                                                <FiLink size={16} />
                                                Image URL
                                            </button>
                                        </div>

                                        {/* File Upload */}
                                        {uploadMethod === 'file' && (
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={uploading || saving || deleting}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <FiRefreshCw className="animate-spin" size={16} />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiUpload size={16} />
                                                            {hasValidImage ? 'Replace Image' : 'Upload Image'}
                                                        </>
                                                    )}
                                                </button>
                                                <span className="text-xs text-gray-500">PNG, JPG, WEBP (Max 5MB)</span>
                                            </div>
                                        )}

                                        {/* URL Upload */}
                                        {uploadMethod === 'url' && (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="url"
                                                    value={urlInput}
                                                    onChange={(e) => setUrlInput(e.target.value)}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white placeholder-gray-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleUrlUpload}
                                                    disabled={uploading || saving || deleting || !urlInput.trim()}
                                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <FiRefreshCw className="animate-spin" size={16} />
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiLink size={16} />
                                                            Add URL
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Image Preview or Empty State */}
                                        {hasValidImage ? (
                                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                                                        {!imageError ? (
                                                            <Image
                                                                src={form.image_url}
                                                                alt="Preview"
                                                                width={96}
                                                                height={96}
                                                                className="w-full h-full object-cover"
                                                                onError={() => setImageError(true)}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FiAlertCircle className="text-red-400 text-2xl" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-white mb-1">
                                                            {imageError ? 'Invalid Image URL' : 'Current Image'}
                                                        </h4>
                                                        {mediaId && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 mb-2">
                                                                <FiLink size={10} />
                                                                ID: {mediaId}
                                                            </span>
                                                        )}
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {form.image_url}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            disabled={uploading || saving || deleting}
                                                            onClick={handleDeleteImage}
                                                            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {deleting ? (
                                                                <>
                                                                    <FiRefreshCw className="animate-spin" size={12} />
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FiTrash2 size={12} />
                                                                    Remove Image
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                                                <FiImage className="mx-auto text-4xl text-gray-600 mb-3" />
                                                <p className="text-sm text-gray-500">No image uploaded</p>
                                                <p className="text-xs text-gray-600 mt-1">Upload an image or enter a URL to enhance your uplift</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-slate-700/50 pt-6">
                                    <button
                                        type="submit"
                                        disabled={saving || uploading || deleting || !form.title || !form.description}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                                    >
                                        {saving ? (
                                            <>
                                                <FiRefreshCw className="animate-spin" size={18} />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave size={18} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-xl font-medium transition-all duration-200"
                                    >
                                        <FiX size={18} />
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ================= RIGHT: LIVE PREVIEW ================= */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <FiEye className="text-cyan-400" size={16} />
                                    <h3 className="text-sm font-semibold text-white">Live Preview</h3>
                                    <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Live
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                                    {/* Card Image */}
                                    <div className="h-56 relative overflow-hidden bg-gray-100">
                                        {hasValidImage && !imageError ? (
                                            <Image
                                                src={form.image_url}
                                                alt={form.title || "Preview"}
                                                fill
                                                className="object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiImage className="text-gray-400 text-4xl" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6">
                                        <h4 className={`text-lg font-bold mb-2 ${!form.title ? 'text-gray-300 italic' : 'text-gray-900'}`}>
                                            {form.title || 'Untitled Uplift'}
                                        </h4>
                                        <p className={`text-sm leading-relaxed ${!form.description ? 'text-gray-300 italic' : 'text-gray-600'}`}>
                                            {form.description || 'Description will appear here...'}
                                        </p>
                                        <div className="mt-4">
                                            <button className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold">
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}