'use client';

import React from 'react';

export default function PortfolioStats({ data = {} }) {
  // -----------------------------
  // SAFE PARSE
  // -----------------------------
  const content = React.useMemo(() => {
    try {
      if (!data?.content) return {};

      const parsed =
        typeof data.content === 'string'
          ? JSON.parse(data.content)
          : data.content;

      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch {
      return {};
    }
  }, [data]);

  const title = content?.title || "Portfolio";
  const subtitle = content?.subtitle || "";
  const description = content?.description || "";

  const stats = React.useMemo(() => {
    if (!Array.isArray(content?.stats)) return [];
    return content.stats;
  }, [content]);

  // -----------------------------
  // ANIMATION
  // -----------------------------
  const [counts, setCounts] = React.useState([]);
  const [start, setStart] = React.useState(false);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    setCounts(stats.map(() => 0));
  }, [stats]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStart(true);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!start || stats.length === 0) return;

    let startTime = null;
    const duration = 1500;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCounts(
        stats.map((s) => Math.floor(progress * (Number(s.value) || 0)))
      );

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [start, stats]);

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER (MATCHED STYLE) */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-4">
            {title}
          </h2>

          {subtitle && (
            <p className="text-gray-500 max-w-lg mb-4">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-gray-600 max-w-2xl text-lg">
              {description}
            </p>
          )}
        </div>

        {/* STATS */}
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((s, i) => {
              // Ensure suffix is a string, not a function
              const suffix = typeof s.suffix === 'function' ? '' : (s.suffix || '');
              const label = typeof s.label === 'function' ? '' : (s.label || '');
              const sub = typeof s.sub === 'function' ? '' : (s.sub || '');

              return (
                <div
                  key={i}
                  className="border-l-2 border-pink-500 pl-6 group hover:border-cyan-500 transition-colors"
                >
                  <div className="text-4xl font-bold text-pink-600 mb-2 group-hover:text-cyan-600 transition-colors">
                    {(counts[i] || 0)}{suffix}
                  </div>

                  <div className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {label}
                  </div>

                  <div className="text-xs text-gray-500">
                    {sub}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No stats found</p>
        )}

      </div>
    </section>
  );
}