'use client';

import React from 'react';

export default function QuadMap() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/sections');
                const json = await res.json();

                const sections = json?.sections || [];

                const row = sections.find(
                    (item) => item.type === 'location'
                );

                if (!row) return;

                const content =
                    typeof row.content === 'string'
                        ? JSON.parse(row.content)
                        : row.content;

                setData(content);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    if (!data) return null;

    // ✅ SAFE MAP URL NORMALIZATION
    const mapUrl =
        typeof data.mapUrl === 'string' && data.mapUrl.trim() !== ''
            ? data.mapUrl.trim()
            : null;

    return (
        <section className="py-24 bg-white" id="location">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="mb-10">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        {data.title}
                    </h2>

                    <p className="text-gray-600 text-lg">
                        {data.subtitle}
                    </p>
                </div>

                {/* MAP */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">

                    {mapUrl ? (
                        <iframe
                            src={mapUrl}
                            width="100%"
                            height="500"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full"
                        />
                    ) : (
                        <div className="h-[500px] flex items-center justify-center text-gray-500 bg-gray-50">
                            Map URL is not configured
                        </div>
                    )}

                </div>

            </div>
        </section>
    );
}