'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiTrash2,
    FiEdit3,
    FiSearch,
    FiLayers,
    FiClock,
    FiImage,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';

export default function AdminUpliftsPage() {
    const router = useRouter();

    const [uplifts, setUplifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // DELETE MODAL
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ALERT
    const [alert, setAlert] = useState({ open: false, type: 'info', message: '' });

    const showAlert = (message, type = 'info') => {
        setAlert({ open: true, message, type });
        setTimeout(() => setAlert({ open: false, message: '', type: 'info' }), 3000);
    };

    // FETCH
    const fetchUplifts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/uplifts', { cache: 'no-store' });
            const response = await res.json();

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
            console.error(err);
            showAlert('Failed to load uplifts', 'error');
            setUplifts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUplifts();
    }, []);

    // DELETE
    const openDeleteModal = (item) => setDeleteTarget(item);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            setIsDeleting(true);

            if (deleteTarget.image_url) {
                await fetch('/api/media', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: deleteTarget.image_url })
                });
            }

            const res = await fetch(`/api/uplifts/${deleteTarget.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete');
            }

            setDeleteTarget(null);
            showAlert('Deleted successfully', 'success');
            fetchUplifts();
        } catch (err) {
            console.error(err);
            showAlert(err.message || 'Delete failed', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (id) => {
        router.push(`/admin/uplifts/items/${id}`);
    };

    const getImageUrl = (item) => item?.image_url || null;

    const filteredUplifts = uplifts.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* ALERT */}
            {alert.open && (
                <div className="fixed top-4 right-4 z-[100]">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border
                        ${alert.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {alert.type === 'success'
                            ? <FiCheckCircle />
                            : <FiAlertCircle />
                        }
                        {alert.message}
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FiLayers /> Uplifts
                    </h1>

                    <div className="flex items-center gap-2">
                        <FiSearch />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg"
                        />
                    </div>
                </div>

                {/* LIST */}
                {loading ? (
                    <p>Loading...</p>
                ) : filteredUplifts.length === 0 ? (
                    <p>No items found</p>
                ) : (
                    <div className="space-y-3">
                        {filteredUplifts.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-slate-900 rounded-xl">

                                {/* IMAGE */}
                                <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden">
                                    {getImageUrl(item) ? (
                                        <Image
                                            src={getImageUrl(item)}
                                            alt=""
                                            width={64}
                                            height={64}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiImage />
                                        </div>
                                    )}
                                </div>

                                {/* INFO */}
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        {item.description}
                                    </p>

                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        <FiClock size={12} />
                                        ID: {item.id}
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item.id)}
                                        className="p-2 bg-blue-500/10 rounded-lg"
                                    >
                                        <FiEdit3 />
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        className="p-2 bg-red-500/10 rounded-lg"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DELETE MODAL */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-lg font-bold mb-2">Delete?</h2>
                        <p className="mb-4">{deleteTarget.title}</p>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-red-400"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}