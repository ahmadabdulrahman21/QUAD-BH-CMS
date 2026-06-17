'use client';

import SectionPreview from '@/app/components/admin/SectionPreview';
import React from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Section type constants to avoid magic strings throughout the codebase
 * Using constants makes refactoring easier and prevents typos
 */
const SECTION_TYPES = {
    QOWORKING: 'qoworking',
    BRANDS: 'brands',
    STATS: 'stats',
    PORTFOLIO: 'portfolio',
    ABOUT: 'about',
    ACADEMY: 'academy',
    DIGITAL_MEDIA: 'digitalmedia',
    DIGITAL_MEDIA_ALT: 'digital-media',
    HERO: 'hero',
    NAVBAR: 'navbar',
    FOOTER: 'footer',
    UPLIFTS: 'uplifts',
};

/**
 * Schema definitions for each section type
 * Defines the expected structure and default values for section content
 * Used for validation, initialization, and template generation
 */
const SECTION_SCHEMAS = {
    // Navigation bar section schema
    navbar: {
        title: "",
        contactText: ""
    },

    // Footer section schema
    footer: {
        title: "",
        description: "",
        whatsappNumber: ""
    },

    // Statistics/portfolio section schema (array of stat items)
    stats: [{
        value: 0,        // Numeric value to display
        suffix: "+",     // Suffix like +, %, K, M
        label: "",       // Main label/title
        sub: ""          // Subtitle or description
    }],

    // About section schema with nested objects for mission/vision
    about: {
        title: "",
        subtitle: "",
        description: [],     // Array of paragraph strings
        mission: {
            title: "",
            text: ""
        },
        vision: {
            title: "",
            text: ""
        },
        highlights: [{      // Key achievement highlights
            title: "",
            text: ""
        }],
        media: [{
            url: ""          // Media items for about section
        }]
    },

    // Academy section schema
    academy: {
        title: "",
        subtitle: "",
        description: "",
        buttonText: ""
    },

    // Digital media section schema
    digitalmedia: {
        title: "",
        subtitle: "",
        description: ""
    },

    // Hero section schema (main landing section)
    hero: {
        title: "",
        subtitle: "",
        buttonText: ""
    },

    // Co-working section schema with features and spaces
    qoworking: {
        title: "",
        subtitle: "",
        description: "",
        features: [{        // Key features list
            icon: "",       // Lucide icon name
            text: ""        // Feature description
        }],
        spaces: [{          // Co-working space listings
            title: "",
            image: "",
            button: "",
            link: "",
            "Button Background Color": "",  // Custom styling fields
            "Button Color": ""
        }]
    },

    // Uplifts section schema
    uplifts: {
        title: "",
        subtitle: "",
        description: ""
    },

    // Brands section schema with extensive branding options
    brands: {
        sectionTitle: "",
        brandItem: [{
            name: "",                    // Brand name
            nameColor: "",               // Brand name text color
            nameBackgroundColor: "",     // Brand name background color
            title: "",                   // Brand title/slogan
            titleColor: "",              // Title text color
            description: "",             // Brand description
            descriptionColor: "",        // Description text color
            buttonText: "",              // CTA button text
            buttonColor: "",             // Button color
            link: "",                    // CTA link URL
            image: ""                    // Brand image/logo
        }],
    }
};

/**
 * Section type categories for different media handling behaviors
 * These determine how media uploads are handled for each section type
 */
const SECTIONS_WITH_MEDIA = [
    SECTION_TYPES.HERO,
    SECTION_TYPES.DIGITAL_MEDIA,
    SECTION_TYPES.DIGITAL_MEDIA_ALT,
    SECTION_TYPES.NAVBAR,
    SECTION_TYPES.FOOTER,
    SECTION_TYPES.ABOUT,
    SECTION_TYPES.ACADEMY
];

const SECTIONS_WITH_GALLERY = [
    SECTION_TYPES.HERO
];

const SECTIONS_WITH_SINGLE_IMAGE = [
    SECTION_TYPES.NAVBAR,
    SECTION_TYPES.FOOTER,
    SECTION_TYPES.ABOUT,
    SECTION_TYPES.ACADEMY,
    SECTION_TYPES.DIGITAL_MEDIA,
    SECTION_TYPES.DIGITAL_MEDIA_ALT
];

const SECTIONS_WITH_ROW_IMAGES = [
    SECTION_TYPES.BRANDS,
    SECTION_TYPES.QOWORKING
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Recursively parses nested JSON strings within objects and arrays
 * Handles edge cases like 'undefined' and 'null' string values
 * 
 * @param {*} input - Any input value that might contain nested JSON strings
 * @returns {*} - Fully parsed and unwrapped value
 * 
 * @example
 * deepParse('{"key": "value"}') // Returns {key: "value"}
 * deepParse({a: '{"b": 1}'})   // Returns {a: {b: 1}}
 * deepParse([1, '{"x": 2}'])   // Returns [1, {x: 2}]
 */
const deepParse = (input) => {
    // Handle string inputs that might be JSON
    if (typeof input === 'string') {
        // Check for special string values from serialization
        if (input.trim() === 'undefined') return undefined;
        if (input.trim() === 'null') return null;

        // Attempt to parse as JSON
        try {
            const parsed = JSON.parse(input);
            // Only recurse if parsing changed the value (prevents infinite loops)
            if (parsed !== input) return deepParse(parsed);
        } catch {
            // Return original string if not valid JSON
            return input;
        }
    }

    // Recursively process array elements
    if (Array.isArray(input)) return input.map(deepParse);

    // Recursively process object properties
    if (input && typeof input === 'object') {
        const out = {};
        for (const k in input) {
            out[k] = deepParse(input[k]);
        }
        return out;
    }

    // Return primitives as-is
    return input;
};

/**
 * Recursively sanitizes data by removing functions and empty objects
 * Ensures data is safe for JSON serialization and API transmission
 * 
 * @param {*} data - Any data that needs sanitization
 * @returns {*} - Sanitized data safe for serialization
 * 
 * @example
 * sanitize({fn: () => {}, empty: {}}) // Returns {empty: ""}
 * sanitize([1, undefined, 3])         // Returns [1, 3]
 */
const sanitize = (data) => {
    // Return null/undefined as-is
    if (data === null || data === undefined) return data;

    // Remove functions (not serializable)
    if (typeof data === "function") return undefined;

    // Recursively sanitize arrays and filter out undefined values
    if (Array.isArray(data)) {
        return data.map(sanitize).filter(v => v !== undefined);
    }

    // Handle objects: convert empty objects to empty strings
    // This prevents issues with the API expecting string values
    if (typeof data === "object") {
        if (Object.keys(data).length === 0) return "";

        const clean = {};
        for (const k in data) {
            const val = sanitize(data[k]);
            if (val !== undefined) clean[k] = val;
        }
        return Object.keys(clean).length > 0 ? clean : "";
    }

    // Return primitives as-is
    return data;
};

/**
 * Formats a phone number into a WhatsApp URL
 * Strips all non-digit characters and constructs the proper WhatsApp link
 * 
 * @param {string|number} phone - Phone number with or without country code
 * @returns {string} - Formatted WhatsApp URL or empty string
 * 
 * @example
 * formatWhatsAppLink("+1 (234) 567-8900") // "https://wa.me/12345678900"
 * formatWhatsAppLink(null)                 // ""
 */
const formatWhatsAppLink = (phone) => {
    if (!phone) return "";
    // Remove all non-digit characters for WhatsApp URL
    return `https://wa.me/${String(phone).replace(/\D/g, "")}`;
};

/**
 * Gets the template/default value for a new item in an array
 * Based on section type and field key
 * 
 * @param {string} type - Section type (e.g., 'brands', 'stats')
 * @param {string} key - Field key within the section (e.g., 'brandItem', 'stats')
 * @returns {*} - Template object or default value for the item
 * 
 * @example
 * getItemTemplate('stats', 'stats')     // {value: 0, suffix: "+", label: "", sub: ""}
 * getItemTemplate('about', 'description') // ""
 */
const getItemTemplate = (type, key) => {
    // Stats/portfolio items template
    if ((type === SECTION_TYPES.STATS || type === SECTION_TYPES.PORTFOLIO) && key === 'stats') {
        return { value: 0, suffix: "+", label: "", sub: "" };
    }

    // Brand items template with all branding properties
    if (type === SECTION_TYPES.BRANDS && key === 'brandItem') {
        return {
            name: "",
            nameColor: "",
            nameBackgroundColor: "",
            title: "",
            titleColor: "",
            description: "",
            descriptionColor: "",
            buttonText: "",
            buttonColor: "",
            link: "",
            image: ""
        };
    }

    // Co-working space items template
    if (type === SECTION_TYPES.QOWORKING && key === 'spaces') {
        return {
            title: "",
            image: "",
            button: "",
            link: "",
            "Button Background Color": "",
            "Button Color": ""
        };
    }

    // Co-working features template
    if (type === SECTION_TYPES.QOWORKING && key === 'features') {
        return { icon: "", text: "" };
    }

    // About section highlights template
    if (type === SECTION_TYPES.ABOUT && key === 'highlights') {
        return { title: "", text: "" };
    }

    // About section description (array of strings)
    if (type === SECTION_TYPES.ABOUT && key === 'description') {
        return "";
    }

    // General case: try to get template from schema
    const schemaTemplate = SECTION_SCHEMAS[type]?.[key];
    if (Array.isArray(schemaTemplate) && schemaTemplate[0] && typeof schemaTemplate[0] === 'object') {
        // Create template with empty string values for each property
        const template = {};
        Object.keys(schemaTemplate[0]).forEach(k => {
            template[k] = "";
        });
        return template;
    }

    // Default to empty string for unknown types
    return "";
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * IconDropdown Component
 * 
 * A searchable dropdown for selecting Lucide icons
 * Features:
 * - Search/filter functionality
 * - Keyboard navigation
 * - Click outside to close
 * - Visual preview of selected icon
 * 
 * @param {Object} props
 * @param {string} props.value - Currently selected icon name
 * @param {function} props.onChange - Callback when icon is selected
 * @param {string} props.className - Additional CSS classes
 */
const IconDropdown = ({ value, onChange, className = "" }) => {
    // State for dropdown visibility and search
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const dropdownRef = React.useRef(null);

    /**
     * Memoized list of available icon names
     * Filters out non-icon exports from lucide-react
     * Sorted alphabetically for easier navigation
     */
    const iconNames = React.useMemo(() => {
        return Object.keys(LucideIcons)
            .filter(key => key !== 'default' && key !== 'createLucideIcon')
            .sort();
    }, []);

    /**
     * Filtered icons based on search term
     * Shows first 50 icons when no search, up to 100 when searching
     * Performance optimization to prevent rendering 1000+ icons
     */
    const filteredIcons = React.useMemo(() => {
        if (!searchTerm) return iconNames.slice(0, 50);
        return iconNames.filter(name =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 100);
    }, [iconNames, searchTerm]);

    /**
     * Click outside handler to close dropdown
     * Uses mousedown event for better responsiveness
     */
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get the actual icon component or fallback to HelpCircle
    const SelectedIcon = value && LucideIcons[value] ? LucideIcons[value] : LucideIcons.HelpCircle;

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Dropdown trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none flex items-center gap-2"
            >
                {/* Selected icon preview */}
                <SelectedIcon size={18} className="text-cyan-400" />
                {/* Selected icon name */}
                <span className="flex-1 text-left truncate">{value || "Select icon..."}</span>
                {/* Dropdown indicator */}
                <span className="text-gray-400">▼</span>
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-slate-700">
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1.5 bg-slate-700 rounded text-xs text-white border border-slate-600 focus:border-cyan-500 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Scrollable icon grid */}
                    <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-4 gap-1">
                        {filteredIcons.map((iconName) => {
                            const IconComponent = LucideIcons[iconName];
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => {
                                        onChange(iconName);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`p-2 rounded hover:bg-slate-700 flex flex-col items-center gap-0.5 transition-colors ${value === iconName ? 'bg-cyan-500/20 border border-cyan-500/50' : ''
                                        }`}
                                    title={iconName}
                                >
                                    {/* Icon preview */}
                                    <IconComponent
                                        size={20}
                                        className={`${value === iconName ? 'text-cyan-400' : 'text-gray-300'}`}
                                    />
                                    {/* Icon name (truncated) */}
                                    <span className="text-[8px] text-gray-400 truncate w-full text-center">
                                        {iconName}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Empty state */}
                        {filteredIcons.length === 0 && (
                            <div className="col-span-4 p-4 text-center text-gray-400 text-sm">
                                No icons found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Modal Component
 * 
 * A reusable modal dialog for confirmations, alerts, and messages
 * Supports different types: warning, danger, success, info
 * Handles backdrop click prevention via overlay
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback to close modal
 * @param {function} props.onConfirm - Callback for confirm action
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message content
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.type - Modal type (warning, danger, success, info)
 */
const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning"
}) => {
    // Don't render if not open
    if (!isOpen) return null;

    /**
     * Returns styling configuration based on modal type
     * Each type has distinct colors and icons for visual clarity
     */
    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: '⚠️',
                    confirmColor: 'bg-red-500 hover:bg-red-400',
                    borderColor: 'border-red-500/30'
                };
            case 'success':
                return {
                    icon: '✅',
                    confirmColor: 'bg-emerald-500 hover:bg-emerald-400',
                    borderColor: 'border-emerald-500/30'
                };
            case 'info':
                return {
                    icon: 'ℹ️',
                    confirmColor: 'bg-blue-500 hover:bg-blue-400',
                    borderColor: 'border-blue-500/30'
                };
            default: // warning
                return {
                    icon: '⚠️',
                    confirmColor: 'bg-yellow-500 hover:bg-yellow-400',
                    borderColor: 'border-yellow-500/30'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
            <div className={`bg-slate-800 rounded-lg border ${styles.borderColor} w-full max-w-md p-6 shadow-xl`}>
                {/* Header with icon and title */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{styles.icon}</span>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>

                {/* Message content (supports newlines) */}
                <p className="text-gray-300 mb-6 whitespace-pre-line">{message}</p>

                {/* Action buttons */}
                <div className="flex gap-3 justify-end">
                    {/* Cancel button */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors"
                    >
                        {cancelText}
                    </button>

                    {/* Confirm button with type-specific styling */}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded text-sm font-semibold text-white transition-colors ${styles.confirmColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * URL Input Modal Component
 * 
 * Modal for entering image/video URLs
 * Used for both global and row-level media uploads
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler for URL
 * @param {string} props.value - Current URL input value
 * @param {function} props.onChange - Input change handler
 * @param {boolean} props.isUploading - Upload in progress flag
 */
const UrlModal = ({ isOpen, onClose, onSubmit, value, onChange, isUploading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Enter Image/Video URL</h3>

                {/* URL input field */}
                <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 bg-slate-700 rounded text-sm text-white border border-slate-600 outline-none mb-4"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        // Allow Enter key to submit
                        if (e.key === 'Enter') onSubmit();
                    }}
                    autoFocus
                />

                {/* Action buttons */}
                <div className="flex gap-3 justify-end">
                    {/* Cancel button */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white"
                    >
                        Cancel
                    </button>

                    {/* Submit button with loading state */}
                    <button
                        onClick={onSubmit}
                        disabled={isUploading}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded text-sm font-semibold text-black"
                    >
                        {isUploading ? "Adding..." : "Add URL"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing modal state
 * Provides consistent interface for showing/hiding modals with configuration
 * 
 * @returns {Object} - Modal state and control functions
 */
const useModal = () => {
    const [modalConfig, setModalConfig] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'warning',
        onConfirm: null
    });

    /**
     * Shows a modal with specified configuration
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {string} type - Modal type (warning, danger, success, info)
     * @param {string} confirmText - Confirm button text
     * @param {string} cancelText - Cancel button text
     * @param {function} onConfirm - Optional confirm callback
     */
    const showModal = (title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm = null) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            confirmText,
            cancelText,
            onConfirm
        });
    };

    // Close the modal
    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // Convenience methods for common modal types
    const showErrorAlert = (message) => {
        showModal('Error', message, 'danger', 'OK', 'Close');
    };

    const showSuccessAlert = (message) => {
        showModal('Success', message, 'success', 'OK', 'Close');
    };

    const showConfirmDialog = (title, message, onConfirm) => {
        showModal(title, message, 'warning', 'Yes, Delete', 'Cancel', onConfirm);
    };

    return {
        modalConfig,
        showModal,
        closeModal,
        showErrorAlert,
        showSuccessAlert,
        showConfirmDialog
    };
};

/**
 * Custom hook for managing image/media operations
 * Handles upload, delete, and state management for media
 * 
 * @param {string} sectionItemId - ID of the section item for API calls
 * @param {Object} modalFunctions - Modal control functions
 * @returns {Object} - Media operation functions and state
 */
const useMediaOperations = (sectionItemId, { showErrorAlert, showSuccessAlert, showConfirmDialog }) => {
    const [uploading, setUploading] = React.useState(false);
    const [deletingImage, setDeletingImage] = React.useState(false);

    /**
     * Uploads media to the API
     * Supports both file uploads and URL-based uploads
     * 
     * @param {File|null} file - File object for upload
     * @param {string|null} url - URL string for URL-based upload
     * @param {string} ownerType - Type of owner (section_item, row_key, etc.)
     * @param {string} ownerId - ID of the owner
     * @returns {Promise<Object>} - Uploaded media object
     */
    const uploadToAPI = async (file, url, ownerType, ownerId) => {
        const formData = new FormData();
        if (file) formData.append("file", file);
        if (url) formData.append("url", url);
        formData.append("owner_type", ownerType);
        formData.append("owner_id", String(ownerId));

        const res = await fetch("/api/media", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        return data.media;
    };

    /**
     * Deletes media from the server
     * Sends DELETE request with media URL
     * 
     * @param {string} mediaUrl - URL of media to delete
     * @returns {Promise<boolean>} - Success indicator
     */
    const deleteMediaFromServer = async (mediaUrl) => {
        if (!mediaUrl) return false;

        try {
            console.log('Deleting media from server:', mediaUrl);

            const res = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: mediaUrl })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete media");
            }

            console.log('Media deleted successfully:', data);
            return true;
        } catch (err) {
            console.error('Error deleting media:', err);
            throw err;
        }
    };

    /**
     * Handles image deletion with confirmation
     * Determines if file is local or URL-based and shows appropriate message
     * 
     * @param {string} mediaUrl - URL of media to delete
     * @param {function} onDelete - Callback after successful deletion
     */
    const handleDelete = async (mediaUrl, onDelete) => {
        const isLocalFile = mediaUrl.startsWith('/uploads/');
        const confirmMessage = isLocalFile
            ? "This will permanently delete the file from the server and remove it from the database.\n\nAre you sure you want to continue?"
            : "This will remove the URL reference from the database.\n\nAre you sure you want to continue?";

        showConfirmDialog(
            'Delete Image',
            confirmMessage,
            async () => {
                try {
                    setDeletingImage(true);
                    await deleteMediaFromServer(mediaUrl);

                    // Execute the deletion callback
                    if (onDelete) onDelete();

                    showSuccessAlert(
                        isLocalFile
                            ? 'Image deleted successfully!\nFile removed from server and database.'
                            : 'URL reference removed from database.'
                    );
                } catch (err) {
                    showErrorAlert("Failed to delete image: " + err.message);
                } finally {
                    setDeletingImage(false);
                }
            }
        );
    };

    return {
        uploading,
        setUploading,
        deletingImage,
        setDeletingImage,
        uploadToAPI,
        deleteMediaFromServer,
        handleDelete
    };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EditSectionPage Component
 * 
 * Main component for editing section content in the admin panel
 * Features:
 * - Dynamic form generation based on section type
 * - Media management (upload, delete, URL-based)
 * - Live preview of section content
 * - Nested content editing (objects and arrays)
 * - Auto-save functionality
 * 
 * @param {Object} props
 * @param {Object} props.params - Route parameters containing section type
 */
export default function EditSectionPage({ params }) {
    // Extract section type from route parameters
    const { type } = React.use(params);

    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================

    // Form state for section content, media, and active status
    const [formFields, setFormFields] = React.useState({
        content: {},
        media: [],
        isActive: true
    });

    // Section metadata state
    const [sectionItemId, setSectionItemId] = React.useState(null);

    // Loading states for various operations
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState("");

    // URL input modal state
    const [showUrlInput, setShowUrlInput] = React.useState(false);
    const [urlValue, setUrlValue] = React.useState("");
    const [urlContext, setUrlContext] = React.useState({
        scope: 'global',    // 'global' or 'row'
        rowKey: null,       // Key for row-level uploads
        rowIndex: null      // Index for row-level uploads
    });

    // ========================================================================
    // HOOKS
    // ========================================================================

    // Modal management hook
    const {
        modalConfig,
        closeModal,
        showErrorAlert,
        showSuccessAlert,
        showConfirmDialog
    } = useModal();

    // Media operations hook
    const {
        uploading,
        setUploading,
        deletingImage,
        setDeletingImage,
        uploadToAPI,
        deleteMediaFromServer,
        handleDelete
    } = useMediaOperations(sectionItemId, {
        showErrorAlert,
        showSuccessAlert,
        showConfirmDialog
    });

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================

    // Determine media handling capabilities for current section type
    const hasGlobalMedia = SECTIONS_WITH_MEDIA.includes(type);
    const isGallery = SECTIONS_WITH_GALLERY.includes(type);
    const isSingleImage = SECTIONS_WITH_SINGLE_IMAGE.includes(type);
    const hasRowImages = SECTIONS_WITH_ROW_IMAGES.includes(type);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    /**
     * Fetches section data on mount and when type changes
     * Parses and normalizes content based on section type
     */
    React.useEffect(() => {
        if (!type) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch section data from API (no cache for real-time editing)
                const res = await fetch(`/api/sections/${type}`, { cache: "no-store" });
                const json = await res.json();

                if (json.success && json.section) {
                    setSectionItemId(json.section.sectionItemId || null);

                    // Parse and normalize content
                    const parsedContent = deepParse(json.section.content || {});

                    // Normalize brands section content
                    if (type === SECTION_TYPES.BRANDS) {
                        // Ensure brandItem is always an array
                        if (!parsedContent.brandItem || !Array.isArray(parsedContent.brandItem)) {
                            parsedContent.brandItem = [];
                        }

                        // Normalize each brand item with defaults
                        parsedContent.brandItem = parsedContent.brandItem.map(item => {
                            if (typeof item === 'object') {
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
                            return item;
                        });

                        // Set default section title
                        if (!parsedContent.sectionTitle) {
                            parsedContent.sectionTitle = "Our Brands";
                        }
                    }

                    // Normalize qoworking section content
                    if (type === SECTION_TYPES.QOWORKING) {
                        // Ensure spaces is always an array
                        if (!parsedContent.spaces || !Array.isArray(parsedContent.spaces)) {
                            parsedContent.spaces = [];
                        }

                        // Normalize each space with defaults
                        parsedContent.spaces = parsedContent.spaces.map(space => {
                            if (typeof space === 'object') {
                                return {
                                    title: space.title || "",
                                    image: space.image || "",
                                    button: space.button || "",
                                    link: space.link || "",
                                    "Button Background Color": space["Button Background Color"] || "",
                                    "Button Color": space["Button Color"] || ""
                                };
                            }
                            return space;
                        });

                        // Ensure features is always an array
                        if (!parsedContent.features || !Array.isArray(parsedContent.features)) {
                            parsedContent.features = [];
                        }
                    }

                    // Normalize stats/portfolio section content
                    if (type === SECTION_TYPES.STATS || type === SECTION_TYPES.PORTFOLIO) {
                        if (!parsedContent.stats || !Array.isArray(parsedContent.stats)) {
                            parsedContent.stats = [];
                        }
                        if (!parsedContent.title) {
                            parsedContent.title = "Our Impact in Numbers";
                        }
                        if (!parsedContent.subtitle) {
                            parsedContent.subtitle = "A quick look at what we've achieved so far";
                        }
                    }

                    // Update form state with parsed content
                    setFormFields({
                        content: parsedContent,
                        media: Array.isArray(json.section.media) ? json.section.media : [],
                        isActive: json.section.isActive ?? true
                    });
                }
            } catch (err) {
                console.error('Error loading section:', err);
                setSaveStatus("Failed to load section");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    // ========================================================================
    // FORM VALUE SETTERS
    // ========================================================================

    /**
     * Sets a top-level content value
     * Used for simple key-value pairs in the content object
     * 
     * @param {string} key - Content key to update
     * @param {*} value - New value
     */
    const setValue = (key, value) => {
        setFormFields(prev => ({
            ...prev,
            content: { ...prev.content, [key]: value }
        }));
    };

    /**
     * Sets a nested content value (for objects within content)
     * Used for mission, vision, and other nested objects
     * 
     * @param {string} parentKey - Parent object key
     * @param {string} subKey - Nested property key
     * @param {*} value - New value
     */
    const setNestedValue = (parentKey, subKey, value) => {
        setFormFields(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [parentKey]: { ...prev.content[parentKey], [subKey]: value }
            }
        }));
    };

    /**
     * Updates an item in an array field
     * Used for stats, features, spaces, brand items, etc.
     * 
     * @param {string} key - Array field key
     * @param {number} index - Index in the array
     * @param {*} value - New item value
     */
    const updateArrayItem = (key, index, value) => {
        const list = [...(formFields.content[key] || [])];
        list[index] = value;
        setValue(key, list);
    };

    /**
     * Adds a new item to an array field
     * Uses template generator to create default item structure
     * 
     * @param {string} key - Array field key
     */
    const addArrayItem = (key) => {
        const list = [...(formFields.content[key] || [])];
        const template = getItemTemplate(type, key);

        // Handle special cases for template types
        if (typeof template === 'string' || Object.keys(template).length === 0) {
            if ((type === SECTION_TYPES.STATS || type === SECTION_TYPES.PORTFOLIO) && key === 'stats') {
                list.push({ value: 0, suffix: "+", label: "", sub: "" });
            } else if (type === SECTION_TYPES.ABOUT && key === 'description') {
                list.push("");
            } else if (type === SECTION_TYPES.ABOUT && key === 'highlights') {
                list.push({ title: "", text: "" });
            } else {
                list.push("");
            }
        } else {
            // Use template for object items
            list.push({ ...template });
        }

        setValue(key, list);
    };

    /**
     * Removes an item from an array field
     * If the item has an image, deletes it from server first
     * 
     * @param {string} key - Array field key
     * @param {number} index - Index to remove
     */
    const removeArrayItem = async (key, index) => {
        const list = [...(formFields.content[key] || [])];
        const item = list[index];

        // Delete associated image if exists
        if (item && typeof item === 'object' && item.image) {
            await deleteMediaFromServer(item.image);
        }

        list.splice(index, 1);
        setValue(key, list);
    };

    // ========================================================================
    // MEDIA HANDLERS
    // ========================================================================

    /**
     * Handles global file upload (for section-level media)
     * Used for hero images, logos, etc.
     * 
     * @param {Event} e - File input change event
     */
    const handleGlobalFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !sectionItemId) return;

        try {
            setUploading(true);
            // Upload to API
            const newAsset = await uploadToAPI(file, null, "section_item", sectionItemId);

            // Update media array
            setFormFields(prev => ({
                ...prev,
                // For single image sections, replace; for galleries, append
                media: isSingleImage ? [newAsset] : [...prev.media, newAsset]
            }));
            e.target.value = '';
        } catch (err) {
            showErrorAlert("Upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Handles global URL upload (for section-level media)
     * Opens URL input modal
     */
    const handleGlobalUrlUpload = async () => {
        if (!urlValue.trim() || !sectionItemId) return;

        try {
            setUploading(true);
            const newAsset = await uploadToAPI(null, urlValue.trim(), "section_item", sectionItemId);

            setFormFields(prev => ({
                ...prev,
                media: isSingleImage ? [newAsset] : [...prev.media, newAsset]
            }));

            // Close URL modal
            setShowUrlInput(false);
            setUrlValue("");
        } catch (err) {
            showErrorAlert("URL upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Handles file upload for array items (brand images, space images)
     * 
     * @param {Event} e - File input change event
     * @param {string} key - Array field key
     * @param {number} index - Item index
     * @param {Object} currentItem - Current item being edited
     */
    const handleRowFileUpload = async (e, key, index, currentItem) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            // Upload with row-specific owner info
            const newAsset = await uploadToAPI(file, null, `row_${key}`, sectionItemId || "0");
            updateArrayItem(key, index, { ...currentItem, image: newAsset.url });
            e.target.value = '';
        } catch (err) {
            showErrorAlert("Row upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Handles URL upload for array items
     */
    const handleRowUrlUpload = async () => {
        if (!urlValue.trim()) return;
        const { rowKey, rowIndex } = urlContext;
        const currentItem = formFields.content[rowKey]?.[rowIndex] || {};

        try {
            setUploading(true);
            const newAsset = await uploadToAPI(null, urlValue.trim(), `row_${rowKey}`, sectionItemId || "0");
            updateArrayItem(rowKey, rowIndex, { ...currentItem, image: newAsset.url });

            // Close URL modal
            setShowUrlInput(false);
            setUrlValue("");
        } catch (err) {
            showErrorAlert("Row URL upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // ========================================================================
    // SAVE HANDLER
    // ========================================================================

    /**
     * Saves section content to the API
     * Sanitizes data before sending to ensure valid JSON
     * Filters out empty brand items
     */
    const handleSave = async () => {
        // Prevent double submission
        if (saving) return;

        try {
            setSaving(true);
            setSaveStatus("");

            // Prepare content for saving
            let contentToSave = { ...formFields.content };

            // Filter out invalid brand items (non-objects)
            if (type === SECTION_TYPES.BRANDS && contentToSave.brandItem) {
                contentToSave.brandItem = contentToSave.brandItem.filter(item =>
                    typeof item === 'object' && item !== null
                );
            }

            // Send update request
            const res = await fetch(`/api/sections/${type}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: sanitize(contentToSave),
                    media: formFields.media,
                    isActive: formFields.isActive
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Save failed");

            setSaveStatus("Saved successfully ✅");
        } catch (err) {
            setSaveStatus("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // ========================================================================
    // RENDERER HELPERS
    // ========================================================================

    /**
     * Renders stat item fields (value, suffix, label, sub)
     * Used for both stats and portfolio sections
     * 
     * @param {Object} item - Stat item data
     * @param {string} key - Field key
     * @param {number} index - Item index
     * @returns {JSX} - Stat fields JSX
     */
    const renderStatFields = (item, key, index) => {
        return (
            <div className="space-y-3">
                {/* Value and Suffix row */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Value input */}
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                            Value
                        </label>
                        <input
                            className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                            type="number"
                            value={item.value ?? 0}
                            onChange={(e) => updateArrayItem(key, index, {
                                ...item,
                                value: parseInt(e.target.value) || 0
                            })}
                            placeholder="e.g. 500"
                        />
                    </div>

                    {/* Suffix input */}
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                            Suffix
                        </label>
                        <input
                            className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                            value={item.suffix ?? "+"}
                            onChange={(e) => updateArrayItem(key, index, {
                                ...item,
                                suffix: e.target.value
                            })}
                            placeholder="e.g. +, %, K"
                        />
                    </div>
                </div>

                {/* Label input */}
                <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                        Label
                    </label>
                    <input
                        className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                        value={item.label ?? ""}
                        onChange={(e) => updateArrayItem(key, index, {
                            ...item,
                            label: e.target.value
                        })}
                        placeholder="e.g. Projects Completed"
                    />
                </div>

                {/* Sub text input */}
                <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                        Sub
                    </label>
                    <input
                        className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                        value={item.sub ?? ""}
                        onChange={(e) => updateArrayItem(key, index, {
                            ...item,
                            sub: e.target.value
                        })}
                        placeholder="e.g. Subtitle or description"
                    />
                </div>
            </div>
        );
    };

    /**
     * Renders image controls for array items
     * Shows preview, upload buttons, and delete functionality
     * 
     * @param {Object} item - Item with image field
     * @param {string} key - Array field key
     * @param {number} index - Item index
     * @returns {JSX|null} - Image controls JSX or null if no image field
     */
    const renderImageControls = (item, key, index) => {
        // Only render if item has an image field
        if (!item || typeof item !== 'object' || !('image' in item)) return null;

        return (
            <div className="border-t border-slate-800 pt-2 mt-2">
                <label className="text-[10px] text-gray-500">Image</label>
                <div className="flex items-center gap-3 mt-1">
                    {/* Image preview */}
                    {item.image ? (
                        <div className="relative group w-16 h-16 rounded overflow-hidden">
                            <Image
                                src={item.image}
                                alt="Preview"
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                            {/* Delete overlay on hover */}
                            <button
                                onClick={() => handleDelete(item.image, () => {
                                    updateArrayItem(key, index, { ...item, image: "" });
                                })}
                                disabled={deletingImage}
                                className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                                title="Delete image from server"
                            >
                                {deletingImage ? '...' : '✕'}
                            </button>
                            {/* File type indicator */}
                            {item.image.startsWith('/uploads/') && (
                                <span className="absolute bottom-0 left-0 bg-green-500 text-[8px] text-white px-1">
                                    Local
                                </span>
                            )}
                            {!item.image.startsWith('/uploads/') && item.image.startsWith('http') && (
                                <span className="absolute bottom-0 left-0 bg-blue-500 text-[8px] text-white px-1">
                                    URL
                                </span>
                            )}
                        </div>
                    ) : (
                        // Empty state placeholder
                        <div className="w-16 h-16 bg-slate-800 rounded border border-dashed border-slate-700 flex items-center justify-center text-xs text-gray-600">
                            Empty
                        </div>
                    )}

                    {/* Upload controls */}
                    <div className="flex gap-2">
                        {/* File upload button */}
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs border border-slate-700">
                            📁 File
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleRowFileUpload(e, key, index, item)}
                            />
                        </label>

                        {/* URL upload button */}
                        <button
                            onClick={() => {
                                setUrlContext({
                                    scope: 'row',
                                    rowKey: key,
                                    rowIndex: index
                                });
                                setShowUrlInput(true);
                                setUrlValue("");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs border border-slate-700"
                        >
                            🔗 URL
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    // Show loading state
    if (loading) {
        return (
            <div className="p-10 text-white flex items-center justify-center min-h-screen bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⚙️</div>
                    <p className="text-gray-400">Loading section data...</p>
                </div>
            </div>
        );
    }

    // Determine content keys to display
    // Order matters for certain section types
    let contentKeys = Object.keys(formFields.content || {});

    // Ensure proper order for qoworking section
    if (type === SECTION_TYPES.QOWORKING) {
        if (!contentKeys.includes('title')) {
            contentKeys = ['title', 'subtitle', 'description', 'features', 'spaces'];
        }
    }

    // Ensure proper order for stats/portfolio section
    if (type === SECTION_TYPES.STATS || type === SECTION_TYPES.PORTFOLIO) {
        const orderedKeys = ['title', 'subtitle', 'stats'];
        contentKeys = orderedKeys.filter(key => key in formFields.content);
    }

    // Prepare preview content with computed values
    const previewContent = {
        ...formFields.content,
        // Add formatted WhatsApp link for preview
        whatsappLink: formatWhatsAppLink(formFields.content.whatsappNumber)
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 min-h-screen bg-slate-950 text-white">
            {/* Modal for confirmations and alerts */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                type={modalConfig.type}
            />

            {/* URL input modal */}
            <UrlModal
                isOpen={showUrlInput}
                onClose={() => {
                    setShowUrlInput(false);
                    setUrlValue("");
                }}
                onSubmit={urlContext.scope === 'global' ? handleGlobalUrlUpload : handleRowUrlUpload}
                value={urlValue}
                onChange={setUrlValue}
                isUploading={uploading}
            />

            {/* ============================================================ */}
            {/* EDITOR PANEL (Left side) */}
            {/* ============================================================ */}
            <div className="lg:col-span-5 space-y-4">
                {/* Header */}
                <h1 className="text-lg font-bold capitalize border-b border-slate-800 pb-2">
                    Editing: {type}
                </h1>

                {/* Scrollable content area */}
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                    {contentKeys.map(key => {
                        const value = formFields.content[key];

                        // Render array fields
                        if (Array.isArray(value)) {
                            const firstItem = value[0];
                            const hasImageField = firstItem && typeof firstItem === 'object' && 'image' in firstItem;
                            const isStats = type === SECTION_TYPES.STATS || type === SECTION_TYPES.PORTFOLIO;
                            const isFeatures = type === SECTION_TYPES.QOWORKING && key === 'features';

                            return (
                                <div key={key} className="p-3 border border-slate-700 rounded space-y-3">
                                    {/* Array header */}
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-400 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </h3>
                                        <span className="text-xs text-gray-500">{value.length} items</span>
                                    </div>

                                    {/* Array items */}
                                    {value.map((item, i) => (
                                        <div key={`${key}-${i}`} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                                            {/* Item header with remove button */}
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-cyan-400 font-semibold">
                                                    #{i + 1}
                                                </span>
                                                <button
                                                    onClick={() => removeArrayItem(key, i)}
                                                    className="text-red-500 text-xs hover:underline"
                                                    disabled={deletingImage}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Item fields */}
                                            {typeof item === 'object' ? (
                                                <>
                                                    {/* Special rendering for stats items */}
                                                    {isStats ? (
                                                        renderStatFields(item, key, i)
                                                    ) : (
                                                        // General object field rendering
                                                        Object.entries(item)
                                                            .filter(([k]) => k !== 'image') // Exclude image (rendered separately)
                                                            .map(([subKey, subVal]) => (
                                                                <div key={subKey}>
                                                                    <label className="text-[10px] text-gray-500 capitalize">
                                                                        {subKey
                                                                            .replace(/([A-Z])/g, ' $1')
                                                                            .replace(/^./, str => str.toUpperCase())
                                                                            .trim()
                                                                        }
                                                                    </label>

                                                                    {/* Use IconDropdown for icon fields */}
                                                                    {isFeatures && subKey === 'icon' ? (
                                                                        <IconDropdown
                                                                            value={subVal ?? ""}
                                                                            onChange={(newValue) =>
                                                                                updateArrayItem(key, i, {
                                                                                    ...item,
                                                                                    [subKey]: newValue
                                                                                })
                                                                            }
                                                                        />
                                                                    ) :
                                                                        /* Textarea for longer text fields */
                                                                        subKey === "description" ||
                                                                            subKey === "text" ||
                                                                            subKey === "sub" ||
                                                                            subKey === "button" ? (
                                                                            <textarea
                                                                                className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 resize-none"
                                                                                rows={2}
                                                                                value={subVal ?? ""}
                                                                                onChange={(e) =>
                                                                                    updateArrayItem(key, i, {
                                                                                        ...item,
                                                                                        [subKey]: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            /* Default input for other fields */
                                                                            <input
                                                                                className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700"
                                                                                value={subVal ?? ""}
                                                                                onChange={(e) =>
                                                                                    updateArrayItem(key, i, {
                                                                                        ...item,
                                                                                        [subKey]: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        )}
                                                                </div>
                                                            ))
                                                    )}

                                                    {/* Image controls for items with image field */}
                                                    {hasImageField && renderImageControls(item, key, i)}
                                                </>
                                            ) : (
                                                /* Simple string array items */
                                                <input
                                                    className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700"
                                                    value={item ?? ""}
                                                    onChange={(e) => updateArrayItem(key, i, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* Add item button */}
                                    <button
                                        onClick={() => addArrayItem(key)}
                                        className="w-full border border-dashed border-slate-700 hover:border-cyan-500 p-2 rounded text-cyan-400 text-xs"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                            );
                        }

                        // Render nested objects (mission, vision, etc.)
                        if (value && typeof value === 'object') {
                            return (
                                <div key={key} className="p-3 border border-slate-800 rounded space-y-2">
                                    <h3 className="text-xs font-bold text-cyan-400 uppercase">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </h3>

                                    {/* Render each property of the nested object */}
                                    {Object.entries(value).map(([subKey, subVal]) => (
                                        <div key={subKey}>
                                            <label className="text-[10px] text-gray-500 capitalize">
                                                {subKey
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .replace(/^./, str => str.toUpperCase())
                                                    .trim()
                                                }
                                            </label>

                                            {/* Textarea for longer text */}
                                            {subKey === "description" || subKey === "text" ? (
                                                <textarea
                                                    className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 resize-none"
                                                    rows={3}
                                                    value={subVal ?? ""}
                                                    onChange={(e) => setNestedValue(key, subKey, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700"
                                                    value={subVal ?? ""}
                                                    onChange={(e) => setNestedValue(key, subKey, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        // Render simple key-value pairs
                        return (
                            <div key={key}>
                                <label className="text-xs text-gray-400 capitalize">
                                    {key === 'whatsappNumber'
                                        ? 'WhatsApp Number'
                                        : key.replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, str => str.toUpperCase())
                                            .trim()
                                    }
                                </label>

                                {/* Textarea for description/subtitle */}
                                {key === "description" || key === "subtitle" ? (
                                    <textarea
                                        className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 resize-none"
                                        rows={3}
                                        value={value ?? ""}
                                        onChange={(e) => setValue(key, e.target.value)}
                                    />
                                ) : (
                                    <input
                                        className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700"
                                        placeholder={key === 'whatsappNumber'
                                            ? '1234567890 (with country code)'
                                            : ''
                                        }
                                        value={value ?? ""}
                                        onChange={(e) => setValue(key, e.target.value)}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Global Media Section */}
                    {hasGlobalMedia && (
                        <div className="p-4 border border-slate-800 rounded space-y-3">
                            <h3 className="text-sm font-semibold text-gray-300">
                                {isGallery
                                    ? 'Media Gallery (Multiple Images)'
                                    : isSingleImage
                                        ? (['navbar', 'footer'].includes(type) ? 'Logo' : 'Main Image')
                                        : 'Media'
                                }
                            </h3>

                            {/* Gallery view (multiple images) */}
                            {isGallery ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Existing media items */}
                                    {formFields.media.map((item, i) => (
                                        <div key={i} className="relative group aspect-square bg-slate-900 rounded overflow-hidden">
                                            {/* Video indicator */}
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-cyan-400">
                                                    🎥
                                                </div>
                                            ) : (
                                                <Image
                                                    src={item.url}
                                                    alt="Media"
                                                    fill
                                                    className="object-cover"
                                                    sizes="100px"
                                                />
                                            )}

                                            {/* Delete button (visible on hover) */}
                                            <button
                                                onClick={() => handleDelete(item.url, () => {
                                                    setFormFields(prev => ({
                                                        ...prev,
                                                        media: prev.media.filter(m => m.url !== item.url)
                                                    }));
                                                })}
                                                disabled={deletingImage}
                                                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                                                title="Delete image from server"
                                            >
                                                {deletingImage ? '...' : 'Delete'}
                                            </button>

                                            {/* File type indicator */}
                                            {item.url.startsWith('/uploads/') && (
                                                <span className="absolute bottom-0 left-0 bg-green-500 text-[8px] text-white px-1">
                                                    Local
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {/* File upload button */}
                                    <label className="aspect-square rounded border border-dashed border-slate-700 hover:border-cyan-500 cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center">
                                        <span className="text-lg">📁</span>
                                        <span className="text-[10px] mt-1">File</span>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={handleGlobalFileUpload}
                                        />
                                    </label>

                                    {/* URL upload button */}
                                    <button
                                        onClick={() => {
                                            setUrlContext({
                                                scope: 'global',
                                                rowKey: null,
                                                rowIndex: null
                                            });
                                            setShowUrlInput(true);
                                            setUrlValue("");
                                        }}
                                        className="aspect-square rounded border border-dashed border-slate-700 hover:border-cyan-500 cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center"
                                    >
                                        <span className="text-lg">🔗</span>
                                        <span className="text-[10px] mt-1">URL</span>
                                    </button>
                                </div>
                            ) : (
                                /* Single image view (logo, main image) */
                                <div className="flex items-center gap-4">
                                    {formFields.media?.[0]?.url ? (
                                        /* Existing image preview */
                                        <div className="relative group w-24 h-24 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
                                            <Image
                                                src={formFields.media[0].url}
                                                alt="Media"
                                                fill
                                                className="object-contain"
                                                sizes="96px"
                                            />
                                            {/* Delete overlay */}
                                            <button
                                                onClick={() => handleDelete(formFields.media[0].url, () => {
                                                    setFormFields(prev => ({
                                                        ...prev,
                                                        media: []
                                                    }));
                                                })}
                                                disabled={deletingImage}
                                                className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                                                title="Delete image from server"
                                            >
                                                {deletingImage ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    ) : (
                                        /* Upload options for empty state */
                                        <div className="flex gap-3">
                                            {/* File upload */}
                                            <label className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500 cursor-pointer bg-slate-900/50 text-slate-400">
                                                <span className="text-lg">📁</span>
                                                <span className="text-[10px] mt-1">Upload</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploading}
                                                    onChange={handleGlobalFileUpload}
                                                />
                                            </label>

                                            {/* URL upload */}
                                            <button
                                                onClick={() => {
                                                    setUrlContext({
                                                        scope: 'global',
                                                        rowKey: null,
                                                        rowIndex: null
                                                    });
                                                    setShowUrlInput(true);
                                                    setUrlValue("");
                                                }}
                                                className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500 cursor-pointer bg-slate-900/50 text-slate-400"
                                            >
                                                <span className="text-lg">🔗</span>
                                                <span className="text-[10px] mt-1">URL</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Save button and status */}
                <div className="pt-4 border-t border-slate-800 flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-6 py-2 rounded text-sm font-semibold text-black"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    {saveStatus && (
                        <span className={`text-sm ${saveStatus.includes('Error') ? 'text-red-400' : 'text-emerald-400'
                            }`}>
                            {saveStatus}
                        </span>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* PREVIEW PANEL (Right side) */}
            {/* ============================================================ */}
            <div className="lg:col-span-7">
                <div className="lg:sticky lg:top-6 bg-slate-900/40 p-4 rounded-lg border border-slate-800 max-h-[90vh] overflow-y-auto">
                    {/* Preview header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                        <span className="text-xs uppercase text-slate-500">Live Preview</span>
                        {/* Live indicator */}
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    {/* Section preview component */}
                    <SectionPreview
                        type={type}
                        content={previewContent}
                        media={formFields.media}
                    />
                </div>
            </div>
        </div>
    );
}