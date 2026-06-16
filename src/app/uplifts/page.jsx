'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Uplifts() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUplifts = async () => {
            try {
                const res = await fetch('/api/uplifts', { cache: 'no-store' });
                const result = await res.json();

                const rawList = Array.isArray(result) ? result : (result?.data || []);
                const validList = rawList.filter(item => item && typeof item === 'object' && 'id' in item);

                setCards(validList);
            } catch (err) {
                console.error('Failed to load uplifts:', err);
                setCards([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUplifts();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const card = {
        hidden: { opacity: 0, y: 60, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16"
                >
                    <div className="max-w-2xl">

                        {/* ✅ BACK BUTTON ADDED */}
                        <Link
                            href="/"
                            className="cursor-pointer inline-flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4 transition"
                        >
                            ← Back to Home
                        </Link>

                        <h2 className="text-4xl font-bold mb-4">Uplifts</h2>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">
                            Events, Workshops & Initiatives
                        </h3>
                        <p className="text-gray-500">
                            Bringing entrepreneurs, creators, and innovators together.
                        </p>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading uplifts...</div>
                ) : cards.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No uplifts found</div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid md:grid-cols-3 gap-8 items-stretch"
                    >
                        {cards.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={card}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full"
                            >
                                <div className="h-64 relative overflow-hidden flex-shrink-0">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.title || 'Event image'}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-gray-600 font-medium leading-relaxed">{item.description}</p>

                                    <div className="mt-auto pt-6">
                                        <Link
                                            href={`/uplifts/${item.id}`}
                                            className="inline-block bg-slate-700 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
                                        >
                                            Read More...
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}