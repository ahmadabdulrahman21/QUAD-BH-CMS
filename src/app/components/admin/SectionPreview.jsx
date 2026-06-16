'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';

// Sections
import Navbar from '../sections/Navbar';
import Hero from '../sections/Hero';
import WhatIsQuad from '../sections/WhatIsQuad';
import PortfolioStats from '../sections/PortfolioStats';
import Brands from '../sections/Brands';
import Qoworking from '../sections/Qoworking';
import Uplifts from '../sections/Uplifts';
import QuadAcademy from '../sections/QuadAcademy';
import DigitalMedia from '../sections/DigitalMedia';
import QuadMap from '../sections/QuadMap';
import ContactForm from '../sections/ContactForm';
import Footer from '../sections/Footer';

const SECTION_REGISTRY = {
    navbar: Navbar,
    hero: Hero,
    about: WhatIsQuad,
    portfolio: PortfolioStats,
    brands: Brands,
    qoworking: Qoworking,
    uplifts: Uplifts,
    academy: QuadAcademy,
    digitalmedia: DigitalMedia,
    'digital-media': DigitalMedia,
    location: QuadMap,
    contact: ContactForm,
    footer: Footer,
};

// Dark sections (controls preview theme)
const DARK_SECTIONS = new Set([
    'navbar',
    'hero',
    'footer'
]);

/**
 * Recursively sanitizes data to ensure no empty objects are passed to React components
 * Replaces empty objects with empty strings to prevent "Objects are not valid as a React child" errors
 */
const sanitizeForReact = (data) => {
    if (data === null || data === undefined) return data;
    
    if (typeof data === 'function') return undefined;
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeForReact(item));
    }
    
    if (typeof data === 'object') {
        // Convert empty objects to empty strings
        if (Object.keys(data).length === 0) return "";
        
        const cleaned = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = sanitizeForReact(data[key]);
                // Skip undefined values
                if (value !== undefined) {
                    cleaned[key] = value;
                }
            }
        }
        
        // If after cleaning the object is empty, return empty string
        return Object.keys(cleaned).length > 0 ? cleaned : "";
    }
    
    return data;
};

class PreviewErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Preview Render Error Catch:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 text-red-600 text-xs border border-red-200 bg-red-50 rounded font-mono whitespace-pre-wrap">
                    <strong>Render Error inside {this.props.sectionType}:</strong>
                    <br />
                    {this.state.error?.toString()}
                </div>
            );
        }

        return this.props.children;
    }
}

export default function SectionPreview({ type, content, media }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const rafRef = useRef(null);
    const observerRef = useRef(null);

    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState('auto');
    const [isMounted, setIsMounted] = useState(false);

    const normalizedType = type?.toLowerCase().split('-copy')[0];
    const TargetComponent = SECTION_REGISTRY[normalizedType];

    const isDark = DARK_SECTIONS.has(normalizedType);

    // Sanitize content and media to prevent empty objects
    const sanitizedContent = useMemo(() => {
        return sanitizeForReact(content || {});
    }, [content]);

    const sanitizedMedia = useMemo(() => {
        return sanitizeForReact(media || []);
    }, [media]);

    // Memoize the calculation function with proper null checks
    const calculateScale = useCallback(() => {
        // Check if refs exist and are mounted
        if (!containerRef.current || !contentRef.current || !isMounted) {
            return;
        }

        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        // Use requestAnimationFrame to throttle updates
        rafRef.current = requestAnimationFrame(() => {
            // Re-check refs inside the animation frame
            if (!containerRef.current || !contentRef.current) {
                rafRef.current = null;
                return;
            }

            try {
                const parentWidth = containerRef.current.offsetWidth;

                // Check if parentWidth is valid
                if (!parentWidth || parentWidth === 0) {
                    rafRef.current = null;
                    return;
                }

                const newScale = Math.min(parentWidth / 1280, 1); // Cap at 1 to prevent zooming in

                setScale((prev) => {
                    // Only update if difference is significant (more than 0.001)
                    return Math.abs(prev - newScale) > 0.001 ? newScale : prev;
                });

                const rawHeight = contentRef.current.offsetHeight;

                // Check if rawHeight is valid
                if (rawHeight && rawHeight > 0) {
                    setContainerHeight(`${rawHeight * newScale}px`);
                }
            } catch (error) {
                console.warn('Error calculating scale:', error);
            } finally {
                rafRef.current = null;
            }
        });
    }, [isMounted]);

    // Debounced resize handler
    const handleResize = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        calculateScale();
    }, [calculateScale]);

    // Setup resize observer and mutation observer
    useEffect(() => {
        // Set mounted state
        setIsMounted(true);

        // Small delay to ensure DOM is ready
        const initialTimeout = setTimeout(() => {
            if (containerRef.current && contentRef.current) {
                calculateScale();
            }
        }, 100);

        // Use ResizeObserver for more efficient resize detection
        let resizeObserver = null;
        try {
            resizeObserver = new ResizeObserver(() => {
                handleResize();
            });

            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }
        } catch (error) {
            console.warn('ResizeObserver not supported:', error);
        }

        // Use MutationObserver with throttling
        if (contentRef.current) {
            try {
                observerRef.current = new MutationObserver(() => {
                    // Debounce mutation updates
                    if (rafRef.current) {
                        cancelAnimationFrame(rafRef.current);
                        rafRef.current = null;
                    }
                    rafRef.current = requestAnimationFrame(() => {
                        calculateScale();
                        rafRef.current = null;
                    });
                });

                observerRef.current.observe(contentRef.current, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true,
                });
            } catch (error) {
                console.warn('MutationObserver not supported:', error);
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            setIsMounted(false);
            clearTimeout(initialTimeout);

            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (observerRef.current) {
                try {
                    observerRef.current.disconnect();
                } catch (error) {
                    // Ignore disconnect errors
                }
                observerRef.current = null;
            }
            if (resizeObserver) {
                try {
                    resizeObserver.disconnect();
                } catch (error) {
                    // Ignore disconnect errors
                }
                resizeObserver = null;
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [calculateScale, handleResize]);

    // Memoize the content fingerprint to prevent unnecessary re-renders
    const contentFingerprint = useMemo(() => {
        if (!sanitizedContent) return 'empty';

        // Only check specific keys that affect the UI
        const relevantKeys = ['brandItem', 'spaces', 'features', 'stats', 'title', 'subtitle', 'description'];
        const fingerprint = relevantKeys.map(key => {
            const val = sanitizedContent[key];
            if (Array.isArray(val)) {
                return `${key}:${val.length}`;
            }
            if (typeof val === 'string') {
                return `${key}:${val.length}`;
            }
            return `${key}:${typeof val}`;
        }).join('|');

        return fingerprint;
    }, [sanitizedContent]);

    // Memoize the media fingerprint
    const mediaFingerprint = useMemo(() => {
        if (!sanitizedMedia || !Array.isArray(sanitizedMedia)) return 'empty';
        return sanitizedMedia.map(item => item?.url || '').join('|');
    }, [sanitizedMedia]);

    // Memoize the serialization key
    const serializationKey = useMemo(() => {
        return `${type}_${contentFingerprint}_${mediaFingerprint}`;
    }, [type, contentFingerprint, mediaFingerprint]);

    // Memoize the final props to prevent unnecessary re-renders
    const finalProps = useMemo(() => {
        if (!type) return { data: { content: {}, media: [], type } };

        let props = { data: { content: sanitizedContent, media: sanitizedMedia, type } };

        // Special handling for specific sections
        if (normalizedType === 'hero') {
            props = {
                liveContent: sanitizedContent,
                liveMedia: sanitizedMedia,
            };
        } else if (normalizedType === 'navbar') {
            props = {
                data: { 
                    content: sanitizedContent, 
                    media: sanitizedMedia, 
                    type 
                },
            };
        } else if (normalizedType === 'brands' || normalizedType === 'qoworking') {
            // For brands and qoworking, ensure proper data structure
            const contentToPass = { ...sanitizedContent };

            // Ensure brandItem is properly formatted for brands
            if (normalizedType === 'brands') {
                if (!contentToPass.brandItem || !Array.isArray(contentToPass.brandItem)) {
                    contentToPass.brandItem = [];
                }

                contentToPass.brandItem = contentToPass.brandItem.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            name: item.name || "",
                            nameColor: item.nameColor || "#ffffff",
                            nameBackgroundColor: item.nameBackgroundColor || "#00B2A9",
                            title: item.title || "",
                            titleColor: item.titleColor || "#00B2A9",
                            description: item.description || "",
                            descriptionColor: item.descriptionColor || "#6B7280",
                            buttonText: item.buttonText || "",
                            buttonColor: item.buttonColor || "#00B2A9",
                            link: item.link || "",
                            image: item.image || ""
                        };
                    }
                    // If item is not an object (string, number, etc.), create default object
                    return {
                        name: "",
                        nameColor: "#ffffff",
                        nameBackgroundColor: "#00B2A9",
                        title: "",
                        titleColor: "#00B2A9",
                        description: "",
                        descriptionColor: "#6B7280",
                        buttonText: "",
                        buttonColor: "#00B2A9",
                        link: "",
                        image: ""
                    };
                });
            }

            // Ensure spaces is properly formatted for qoworking
            if (normalizedType === 'qoworking') {
                if (!contentToPass.spaces || !Array.isArray(contentToPass.spaces)) {
                    contentToPass.spaces = [];
                }

                contentToPass.spaces = contentToPass.spaces.map(space => {
                    if (typeof space === 'object' && space !== null) {
                        return {
                            title: space.title || "",
                            image: space.image || "",
                            button: space.button || "",
                            link: space.link || "",
                            "Button Background Color": space["Button Background Color"] || "",
                            "Button Color": space["Button Color"] || ""
                        };
                    }
                    return {
                        title: "",
                        image: "",
                        button: "",
                        link: "",
                        "Button Background Color": "",
                        "Button Color": ""
                    };
                });

                if (!contentToPass.features || !Array.isArray(contentToPass.features)) {
                    contentToPass.features = [];
                }
            }

            props = {
                data: {
                    content: JSON.stringify(contentToPass),
                    media: sanitizedMedia,
                    type
                }
            };
        } else if (normalizedType === 'portfolio' || normalizedType === 'stats') {
            // For portfolio/stats, ensure the stats array is properly formatted
            const contentToPass = { ...sanitizedContent };
            
            // Ensure stats is an array
            if (!contentToPass.stats || !Array.isArray(contentToPass.stats)) {
                contentToPass.stats = [];
            }
            
            // Ensure each stat has the required fields
            contentToPass.stats = contentToPass.stats.map(stat => {
                if (typeof stat === 'object' && stat !== null) {
                    return {
                        value: stat.value || 0,
                        suffix: stat.suffix || "+",
                        label: stat.label || "",
                        sub: stat.sub || ""
                    };
                }
                // If stat is not an object, create default
                return { value: 0, suffix: "+", label: "", sub: "" };
            });

            // Ensure title and subtitle exist
            if (!contentToPass.title || typeof contentToPass.title !== 'string') {
                contentToPass.title = "Our Impact in Numbers";
            }
            if (!contentToPass.subtitle || typeof contentToPass.subtitle !== 'string') {
                contentToPass.subtitle = "A quick look at what we've achieved so far";
            }

            props = {
                data: {
                    content: contentToPass,
                    media: sanitizedMedia,
                    type
                }
            };
        } else if (normalizedType === 'about') {
            // Ensure about section has proper structure
            const contentToPass = { ...sanitizedContent };
            
            // Ensure description is an array
            if (!contentToPass.description || !Array.isArray(contentToPass.description)) {
                contentToPass.description = [];
            }
            
            // Ensure highlights is an array
            if (!contentToPass.highlights || !Array.isArray(contentToPass.highlights)) {
                contentToPass.highlights = [];
            }
            
            // Ensure mission and vision are objects
            if (!contentToPass.mission || typeof contentToPass.mission !== 'object') {
                contentToPass.mission = { title: "", text: "" };
            }
            if (!contentToPass.vision || typeof contentToPass.vision !== 'object') {
                contentToPass.vision = { title: "", text: "" };
            }

            props = {
                data: {
                    content: contentToPass,
                    media: sanitizedMedia,
                    type
                }
            };
        }

        return props;
    }, [type, sanitizedContent, sanitizedMedia, normalizedType]);

    // Don't render if not mounted yet
    if (!isMounted) {
        return (
            <div className="p-4 text-sm text-gray-500 border rounded bg-slate-900">
                Loading preview...
            </div>
        );
    }

    if (!type) return null;

    if (!TargetComponent) {
        return (
            <div className="p-4 text-sm text-gray-500 border rounded">
                No preview configuration mapped for component: {type}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full border rounded overflow-hidden shadow-sm ${isDark ? 'bg-black' : 'bg-white'
                }`}
            style={{
                height: containerHeight,
                minHeight: isDark ? 120 : 100,
                contentVisibility: 'auto',
            }}
        >
            <div
                ref={contentRef}
                className={isDark ? 'text-white' : 'text-black'}
                style={{
                    width: '1280px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    willChange: 'transform', // Hint for browser optimization
                }}
            >
                <PreviewErrorBoundary
                    key={serializationKey}
                    sectionType={type}
                >
                    {normalizedType === 'navbar' ? (
                        <div className="bg-black min-h-[120px]">
                            <TargetComponent {...finalProps} />
                        </div>
                    ) : (
                        <TargetComponent {...finalProps} />
                    )}
                </PreviewErrorBoundary>
            </div>

            <div className="absolute top-2 right-2 bg-black/70 text-white font-mono text-[10px] px-2 py-1 rounded shadow pointer-events-none select-none z-50">
                {type}
            </div>
        </div>
    );
}