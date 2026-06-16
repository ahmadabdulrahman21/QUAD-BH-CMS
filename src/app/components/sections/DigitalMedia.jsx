'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DigitalMedia({ data = {} }) {
    const [content, setContent] = useState({});

    useEffect(() => {
        if (!data?.content) return;

        try {
            const parsed =
                typeof data.content === 'string'
                    ? JSON.parse(data.content)
                    : data.content;

            setContent(parsed || {});
        } catch (err) {
            console.error('DigitalMedia JSON error:', err);
            setContent({});
        }
    }, [data]);

    const {
        span,
        title,
        subtitle,
        sectionTitle,
        features = [],
        buttonText,
        link
    } = content;

    const imageUrl = data?.media?.[0]?.url;

    return (
        <section id="digital-media" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="mb-16"
                >
                    {span && (
                        <span className="text-cyan-600 font-semibold uppercase tracking-wider">
                            {span}
                        </span>
                    )}

                    {title && (
                        <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="text-gray-600 max-w-2xl text-lg">
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                {/* GRID */}
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative h-[420px] rounded-3xl overflow-hidden bg-gray-50 shadow-xl"
                    >
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={title || 'Digital Media'}
                                fill
                                className="object-contain"
                                loading='lazy'
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image uploaded
                            </div>
                        )}
                    </motion.div>

                    {/* TEXT */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        {sectionTitle && (
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                {sectionTitle}
                            </h3>
                        )}

                        {features.length > 0 && (
                            <ul className="space-y-4 text-gray-600">
                                {features.map((f, i) => (
                                    <li key={i}>• {f}</li>
                                ))}
                            </ul>
                        )}

                        {buttonText && link && (
                            <div className="mt-10">
                                <Link href={link} target="_blank">
                                    <button className="cursor-pointer bg-media text-white px-8 py-3 rounded-full hover:bg-cyan-700 transition">
                                        {buttonText}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}