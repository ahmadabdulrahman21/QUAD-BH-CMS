'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function QuadAcademy({ data = {} }) {
    const [content, setContent] = useState({});

    useEffect(() => {
        if (!data?.content) return;

        try {
            const parsed =
                typeof data.content === 'string'
                    ? JSON.parse(data.content)
                    : data.content;

            setContent(parsed || {});
        } catch (error) {
            console.error('QuadAcademy JSON error:', error);
            setContent({});
        }
    }, [data]);

    const {
        tag,
        title,
        description,
        learningTitle,
        lessons = [],
        buttonText,
        buttonLink
    } = content;

    const imageUrl = data?.media?.[0]?.url;

    return (
        <section id="academy" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="mb-16"
                >
                    {tag && (
                        <span className="text-pink-500 font-semibold uppercase tracking-wider">
                            {tag}
                        </span>
                    )}

                    {title && (
                        <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
                            {title}
                        </h2>
                    )}

                    {description && (
                        <p className="text-gray-600 max-w-2xl text-lg leading-relaxed">
                            {description}
                        </p>
                    )}
                </motion.div>

                {/* GRID */}
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* TEXT (Sliding from left to match reference) */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        {learningTitle && (
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                {learningTitle}
                            </h3>
                        )}

                        {lessons.length > 0 && (
                            <ul className="space-y-4 text-gray-600">
                                {lessons.map((lesson, index) => (
                                    <li key={index}>• {lesson}</li>
                                ))}
                            </ul>
                        )}

                        {buttonText && buttonLink && (
                            <div className="mt-10">
                                <Link href={buttonLink} target="_blank">
                                    <button className="cursor-pointer bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition">
                                        {buttonText}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* IMAGE (Sliding from right to match reference) */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative h-[420px] rounded-3xl overflow-hidden bg-gray-50 shadow-xl"
                    >
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={title || 'QUAD Academy'}
                                fill
                                className="object-contain"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image uploaded
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}