'use client';

import SectionPreview from '@/app/components/admin/SectionPreview';
import React from 'react';
import Image from 'next/image';

const SECTION_SCHEMAS = {
    navbar: { title: "", contactText: "" },
    footer: { title: "", description: "", whatsappNumber: "" },
    stats: [{ value: 0, suffix: "+", label: "", sub: "" }],
    about: {
        title: "", subtitle: "", description: [],
        mission: { title: "", text: "" },
        vision: { title: "", text: "" },
        highlights: [{ title: "", text: "" }],
        media: [{ url: "" }]
    },
    academy: { title: "", subtitle: "", description: "", buttonText: "" },
    digitalmedia: { title: "", subtitle: "", description: "" },
    hero: { title: "", subtitle: "", buttonText: "" },
    qoworking: {
        title: "", subtitle: "", description: "",
        features: [{ icon: "", text: "" }],
        spaces: [{ title: "", image: "", button: "", link: "", "Button Background Color": "", "Button Color": "" }]
    },
    uplifts: { title: "", subtitle: "", description: "" },
    brands: {
        sectionTitle: "",
        brandItem: [{
            name: "", nameColor: "", nameBackgroundColor: "", title: "", titleColor: "",
            description: "", descriptionColor: "", buttonText: "", buttonColor: "", link: "", image: ""
        }],
    }
};

// Sections that support global media uploads
const SECTIONS_WITH_MEDIA = ['hero', 'digitalmedia', 'digital-media', 'navbar', 'footer', 'about', 'academy'];
// ONLY Hero is a gallery (multiple images)
const SECTIONS_WITH_GALLERY = ['hero'];
// Sections with single image (logo or main image)
const SECTIONS_WITH_SINGLE_IMAGE = ['navbar', 'footer', 'about', 'academy', 'digitalmedia', 'digital-media'];
// Sections where each item in an array has its own image
const SECTIONS_WITH_ROW_IMAGES = ['brands', 'qoworking'];

const deepParse = (input) => {
    if (typeof input === 'string') {
        if (input.trim() === 'undefined') return undefined;
        if (input.trim() === 'null') return null;
        try {
            const parsed = JSON.parse(input);
            if (parsed !== input) return deepParse(parsed);
        } catch { return input; }
    }
    if (Array.isArray(input)) return input.map(deepParse);
    if (input && typeof input === 'object') {
        const out = {};
        for (const k in input) out[k] = deepParse(input[k]);
        return out;
    }
    return input;
};

// Sanitize function that converts empty objects to empty strings
const sanitize = (data) => {
    if (data === null || data === undefined) return data;
    if (typeof data === "function") return undefined;
    if (Array.isArray(data)) return data.map(sanitize).filter(v => v !== undefined);
    if (typeof data === "object") {
        // Check if it's an empty object
        if (Object.keys(data).length === 0) return "";
        
        const clean = {};
        for (const k in data) {
            const val = sanitize(data[k]);
            if (val !== undefined) clean[k] = val;
        }
        // Return empty string if all properties were stripped
        return Object.keys(clean).length > 0 ? clean : "";
    }
    return data;
};

const formatWhatsAppLink = (phone) => {
    if (!phone) return "";
    return `https://wa.me/${String(phone).replace(/\D/g, "")}`;
};

// Fixed getItemTemplate to never return empty objects
const getItemTemplate = (type, key) => {
    // Stats template
    if ((type === 'stats' || type === 'portfolio') && key === 'stats') {
        return { value: 0, suffix: "+", label: "", sub: "" };
    }

    if (type === 'brands' && key === 'brandItem') {
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

    if (type === 'qoworking' && key === 'spaces') {
        return {
            title: "",
            image: "",
            button: "",
            link: "",
            "Button Background Color": "",
            "Button Color": ""
        };
    }

    if (type === 'qoworking' && key === 'features') {
        return { icon: "", text: "" };
    }

    if (type === 'about' && key === 'highlights') {
        return { title: "", text: "" };
    }

    if (type === 'about' && key === 'description') {
        return "";
    }

    // Check schema for array templates
    const schemaTemplate = SECTION_SCHEMAS[type]?.[key];
    if (Array.isArray(schemaTemplate) && schemaTemplate[0] && typeof schemaTemplate[0] === 'object') {
        const template = {};
        Object.keys(schemaTemplate[0]).forEach(k => {
            template[k] = "";
        });
        return template;
    }

    // Return empty string instead of empty object
    return "";
};

// Custom Modal Component
const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
    if (!isOpen) return null;

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
            default:
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
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{styles.icon}</span>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
                <p className="text-gray-300 mb-6 whitespace-pre-line">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors"
                    >
                        {cancelText}
                    </button>
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

export default function EditSectionPage({ params }) {
    const { type } = React.use(params);

    const [formFields, setFormFields] = React.useState({
        content: {},
        media: [],
        isActive: true
    });

    const [sectionItemId, setSectionItemId] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState("");
    const [uploading, setUploading] = React.useState(false);
    const [deletingImage, setDeletingImage] = React.useState(false);

    const [showUrlInput, setShowUrlInput] = React.useState(false);
    const [urlValue, setUrlValue] = React.useState("");
    const [urlContext, setUrlContext] = React.useState({ scope: 'global', rowKey: null, rowIndex: null });

    // Modal states
    const [modalConfig, setModalConfig] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'warning',
        onConfirm: null
    });

    // Determine section capabilities
    const hasGlobalMedia = SECTIONS_WITH_MEDIA.includes(type);
    const isGallery = SECTIONS_WITH_GALLERY.includes(type);
    const isSingleImage = SECTIONS_WITH_SINGLE_IMAGE.includes(type);
    const hasRowImages = SECTIONS_WITH_ROW_IMAGES.includes(type);

    // Modal helper functions
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

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const showErrorAlert = (message) => {
        showModal('Error', message, 'danger', 'OK', 'Close');
    };

    const showSuccessAlert = (message) => {
        showModal('Success', message, 'success', 'OK', 'Close');
    };

    const showConfirmDialog = (title, message, onConfirm) => {
        showModal(title, message, 'warning', 'Yes, Delete', 'Cancel', onConfirm);
    };

    React.useEffect(() => {
        if (!type) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/sections/${type}`, { cache: "no-store" });
                const json = await res.json();

                if (json.success && json.section) {
                    setSectionItemId(json.section.sectionItemId || null);

                    const parsedContent = deepParse(json.section.content || {});

                    if (type === 'brands') {
                        if (!parsedContent.brandItem || !Array.isArray(parsedContent.brandItem)) {
                            parsedContent.brandItem = [];
                        }
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
                        if (!parsedContent.sectionTitle) {
                            parsedContent.sectionTitle = "Our Brands";
                        }
                    }

                    // Ensure qoworking spaces are properly formatted
                    if (type === 'qoworking') {
                        if (!parsedContent.spaces || !Array.isArray(parsedContent.spaces)) {
                            parsedContent.spaces = [];
                        }
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
                        if (!parsedContent.features || !Array.isArray(parsedContent.features)) {
                            parsedContent.features = [];
                        }
                    }

                    // Ensure stats array exists for stats/portfolio section
                    if (type === 'stats' || type === 'portfolio') {
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

                    setFormFields({
                        content: parsedContent,
                        media: Array.isArray(json.section.media) ? json.section.media : [],
                        isActive: json.section.isActive ?? true
                    });
                }
            } catch (err) {
                console.error(err);
                setSaveStatus("Failed to load section");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    const setValue = (key, value) => {
        setFormFields(prev => ({
            ...prev,
            content: { ...prev.content, [key]: value }
        }));
    };

    const setNestedValue = (parentKey, subKey, value) => {
        setFormFields(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [parentKey]: { ...prev.content[parentKey], [subKey]: value }
            }
        }));
    };

    const updateArrayItem = (key, index, value) => {
        const list = [...(formFields.content[key] || [])];
        list[index] = value;
        setValue(key, list);
    };

    // Add array item with proper template
    const addArrayItem = (key) => {
        const list = [...(formFields.content[key] || [])];
        const template = getItemTemplate(type, key);
        
        // If template is empty string, create appropriate default template
        if (typeof template === 'string' || Object.keys(template).length === 0) {
            if ((type === 'stats' || type === 'portfolio') && key === 'stats') {
                list.push({ value: 0, suffix: "+", label: "", sub: "" });
            } else if (type === 'about' && key === 'description') {
                list.push("");
            } else if (type === 'about' && key === 'highlights') {
                list.push({ title: "", text: "" });
            } else {
                list.push("");
            }
        } else {
            list.push({ ...template });
        }
        
        setValue(key, list);
    };

    const removeArrayItem = async (key, index) => {
        const list = [...(formFields.content[key] || [])];
        const item = list[index];

        // If the item has an image, delete it first
        if (item && typeof item === 'object' && item.image) {
            await deleteMediaFromServer(item.image);
        }

        list.splice(index, 1);
        setValue(key, list);
    };

    // ============ MEDIA UPLOAD FUNCTIONS ============

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

    // Delete media from server (file system + database)
    const deleteMediaFromServer = async (mediaUrl) => {
        if (!mediaUrl) return;

        try {
            console.log('🗑️ Deleting media from server:', mediaUrl);

            const res = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: mediaUrl })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete media");
            }

            console.log('✅ Media deleted successfully:', data);
            return true;
        } catch (err) {
            console.error('❌ Error deleting media:', err);
            throw err;
        }
    };

    // Global media - File upload
    const handleGlobalFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !sectionItemId) return;

        try {
            setUploading(true);
            const newAsset = await uploadToAPI(file, null, "section_item", sectionItemId);

            setFormFields(prev => ({
                ...prev,
                media: isSingleImage ? [newAsset] : [...prev.media, newAsset]
            }));
            e.target.value = '';
        } catch (err) {
            showErrorAlert("Upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Global media - URL upload
    const handleGlobalUrlUpload = async () => {
        if (!urlValue.trim() || !sectionItemId) return;

        try {
            setUploading(true);
            const newAsset = await uploadToAPI(null, urlValue.trim(), "section_item", sectionItemId);

            setFormFields(prev => ({
                ...prev,
                media: isSingleImage ? [newAsset] : [...prev.media, newAsset]
            }));

            setShowUrlInput(false);
            setUrlValue("");
        } catch (err) {
            showErrorAlert("URL upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Row item - File upload
    const handleRowFileUpload = async (e, key, index, currentItem) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const newAsset = await uploadToAPI(file, null, `row_${key}`, sectionItemId || "0");
            updateArrayItem(key, index, { ...currentItem, image: newAsset.url });
            e.target.value = '';
        } catch (err) {
            showErrorAlert("Row upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Row item - URL upload
    const handleRowUrlUpload = async () => {
        if (!urlValue.trim()) return;
        const { rowKey, rowIndex } = urlContext;
        const currentItem = formFields.content[rowKey]?.[rowIndex] || {};

        try {
            setUploading(true);
            const newAsset = await uploadToAPI(null, urlValue.trim(), `row_${rowKey}`, sectionItemId || "0");
            updateArrayItem(rowKey, rowIndex, { ...currentItem, image: newAsset.url });

            setShowUrlInput(false);
            setUrlValue("");
        } catch (err) {
            showErrorAlert("Row URL upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Delete media from row item or global media
    const handleDelete = async (mediaUrl, key, index, item) => {
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

                    if (key && index !== undefined && item) {
                        // Row item - clear the image field
                        updateArrayItem(key, index, { ...item, image: "" });
                    } else {
                        // Global media - remove from array
                        setFormFields(prev => ({
                            ...prev,
                            media: prev.media.filter(m => m.url !== mediaUrl)
                        }));
                    }

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

    // Save section
    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveStatus("");

            let contentToSave = { ...formFields.content };
            if (type === 'brands' && contentToSave.brandItem) {
                contentToSave.brandItem = contentToSave.brandItem.filter(item =>
                    typeof item === 'object' && item !== null
                );
            }

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

    // URL Input Modal
    const UrlModal = () => {
        if (!showUrlInput) return null;

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full max-w-md">
                    <h3 className="text-lg font-semibold text-white mb-4">Enter Image/Video URL</h3>
                    <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-2 bg-slate-700 rounded text-sm text-white border border-slate-600 outline-none mb-4"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                urlContext.scope === 'global' ? handleGlobalUrlUpload() : handleRowUrlUpload();
                            }
                        }}
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => { setShowUrlInput(false); setUrlValue(""); }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={urlContext.scope === 'global' ? handleGlobalUrlUpload : handleRowUrlUpload}
                            disabled={uploading}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded text-sm font-semibold text-black"
                        >
                            {uploading ? "Adding..." : "Add URL"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to render stat fields
    const renderStatFields = (item, key, index) => {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Value</label>
                        <input
                            className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                            type="number"
                            value={item.value ?? 0}
                            onChange={(e) => updateArrayItem(key, index, { ...item, value: parseInt(e.target.value) || 0 })}
                            placeholder="e.g. 500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Suffix</label>
                        <input
                            className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                            value={item.suffix ?? "+"}
                            onChange={(e) => updateArrayItem(key, index, { ...item, suffix: e.target.value })}
                            placeholder="e.g. +, %, K"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Label</label>
                    <input
                        className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                        value={item.label ?? ""}
                        onChange={(e) => updateArrayItem(key, index, { ...item, label: e.target.value })}
                        placeholder="e.g. Projects Completed"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Sub</label>
                    <input
                        className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                        value={item.sub ?? ""}
                        onChange={(e) => updateArrayItem(key, index, { ...item, sub: e.target.value })}
                        placeholder="e.g. Subtitle or description"
                    />
                </div>
            </div>
        );
    };

    // Helper function to render image controls for any item
    const renderImageControls = (item, key, index) => {
        if (!item || typeof item !== 'object' || !('image' in item)) return null;

        return (
            <div className="border-t border-slate-800 pt-2 mt-2">
                <label className="text-[10px] text-gray-500">Image</label>
                <div className="flex items-center gap-3 mt-1">
                    {item.image ? (
                        <div className="relative group w-16 h-16 rounded overflow-hidden">
                            <Image src={item.image} alt="Preview" fill className="object-cover" sizes="64px" />
                            <button
                                onClick={() => handleDelete(item.image, key, index, item)}
                                disabled={deletingImage}
                                className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                                title="Delete image from server"
                            >
                                {deletingImage ? '...' : '✕'}
                            </button>
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
                        <div className="w-16 h-16 bg-slate-800 rounded border border-dashed border-slate-700 flex items-center justify-center text-xs text-gray-600">
                            Empty
                        </div>
                    )}

                    <div className="flex gap-2">
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs border border-slate-700">
                            📁 File
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleRowFileUpload(e, key, index, item)}
                            />
                        </label>
                        <button
                            onClick={() => {
                                setUrlContext({ scope: 'row', rowKey: key, rowIndex: index });
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

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    let contentKeys = Object.keys(formFields.content || {});

    if (type === 'qoworking') {
        if (!contentKeys.includes('title')) contentKeys = ['title', 'subtitle', 'description', 'features', 'spaces'];
    }

    // For stats/portfolio section, explicitly define the order of fields
    if (type === 'stats' || type === 'portfolio') {
        const orderedKeys = ['title', 'subtitle', 'stats'];
        contentKeys = orderedKeys.filter(key => key in formFields.content);
    }

    const previewContent = {
        ...formFields.content,
        whatsappLink: formatWhatsAppLink(formFields.content.whatsappNumber)
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 min-h-screen bg-slate-950 text-white">
            {/* Main Modal */}
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

            <UrlModal />

            {/* Editor Panel */}
            <div className="lg:col-span-5 space-y-4">
                <h1 className="text-lg font-bold capitalize border-b border-slate-800 pb-2">Editing: {type}</h1>

                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                    {contentKeys.map(key => {
                        const value = formFields.content[key];

                        if (Array.isArray(value)) {
                            const firstItem = value[0];
                            // Check if items in this array have an image field
                            const hasImageField = firstItem && typeof firstItem === 'object' && 'image' in firstItem;
                            const isStats = type === 'stats' || type === 'portfolio';

                            return (
                                <div key={key} className="p-3 border border-slate-700 rounded space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                        <span className="text-xs text-gray-500">{value.length} items</span>
                                    </div>
                                    {value.map((item, i) => (
                                        <div key={`${key}-${i}`} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-cyan-400 font-semibold">#{i + 1}</span>
                                                <button
                                                    onClick={() => removeArrayItem(key, i)}
                                                    className="text-red-500 text-xs hover:underline"
                                                    disabled={deletingImage}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            {typeof item === 'object' ? (
                                                <>
                                                    {isStats ? (
                                                        renderStatFields(item, key, i)
                                                    ) : (
                                                        // Filter out 'image' field from text inputs
                                                        Object.entries(item)
                                                            .filter(([k]) => k !== 'image')
                                                            .map(([subKey, subVal]) => (
                                                                <div key={subKey}>
                                                                    <label className="text-[10px] text-gray-500 capitalize">
                                                                        {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                                                                    </label>
                                                                    {subKey === "description" || subKey === "text" || subKey === "sub" || subKey === "button" ? (
                                                                        <textarea
                                                                            className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700 resize-none"
                                                                            rows={2}
                                                                            value={subVal ?? ""}
                                                                            onChange={(e) => updateArrayItem(key, i, { ...item, [subKey]: e.target.value })}
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700"
                                                                            value={subVal ?? ""}
                                                                            onChange={(e) => updateArrayItem(key, i, { ...item, [subKey]: e.target.value })}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))
                                                    )}

                                                    {/* Show image controls for any item that has an image field */}
                                                    {hasImageField && renderImageControls(item, key, i)}
                                                </>
                                            ) : (
                                                <input
                                                    className="w-full p-2 bg-slate-800 rounded text-sm border border-slate-700"
                                                    value={item ?? ""}
                                                    onChange={(e) => updateArrayItem(key, i, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addArrayItem(key)}
                                        className="w-full border border-dashed border-slate-700 hover:border-cyan-500 p-2 rounded text-cyan-400 text-xs"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                            );
                        }

                        if (value && typeof value === 'object') {
                            return (
                                <div key={key} className="p-3 border border-slate-800 rounded space-y-2">
                                    <h3 className="text-xs font-bold text-cyan-400 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                    {Object.entries(value).map(([subKey, subVal]) => (
                                        <div key={subKey}>
                                            <label className="text-[10px] text-gray-500 capitalize">
                                                {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                                            </label>
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

                        return (
                            <div key={key}>
                                <label className="text-xs text-gray-400 capitalize">
                                    {key === 'whatsappNumber' ? 'WhatsApp Number' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                                </label>
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
                                        placeholder={key === 'whatsappNumber' ? '1234567890 (with country code)' : ''}
                                        value={value ?? ""}
                                        onChange={(e) => setValue(key, e.target.value)}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Global Media Section - Shown for hero, digitalmedia, navbar, footer, about, academy */}
                    {hasGlobalMedia && (
                        <div className="p-4 border border-slate-800 rounded space-y-3">
                            <h3 className="text-sm font-semibold text-gray-300">
                                {isGallery ? 'Media Gallery (Multiple Images)' : 
                                 isSingleImage ? (['navbar', 'footer'].includes(type) ? 'Logo' : 'Main Image') : 
                                 'Media'}
                            </h3>

                            {/* Hero Gallery - Multiple Images */}
                            {isGallery ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {formFields.media.map((item, i) => (
                                        <div key={i} className="relative group aspect-square bg-slate-900 rounded overflow-hidden">
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-cyan-400">🎥</div>
                                            ) : (
                                                <Image src={item.url} alt="Media" fill className="object-cover" sizes="100px" />
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.url)}
                                                disabled={deletingImage}
                                                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                                                title="Delete image from server"
                                            >
                                                {deletingImage ? '...' : 'Delete'}
                                            </button>
                                            {item.url.startsWith('/uploads/') && (
                                                <span className="absolute bottom-0 left-0 bg-green-500 text-[8px] text-white px-1">
                                                    Local
                                                </span>
                                            )}
                                        </div>
                                    ))}

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

                                    <button
                                        onClick={() => {
                                            setUrlContext({ scope: 'global', rowKey: null, rowIndex: null });
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
                                /* Single Image for navbar, footer, about, academy, digitalmedia */
                                <div className="flex items-center gap-4">
                                    {formFields.media?.[0]?.url ? (
                                        <div className="relative group w-24 h-24 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
                                            <Image
                                                src={formFields.media[0].url}
                                                alt="Media"
                                                fill
                                                className="object-contain"
                                                sizes="96px"
                                            />
                                            <button
                                                onClick={() => handleDelete(formFields.media[0].url)}
                                                disabled={deletingImage}
                                                className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                                                title="Delete image from server"
                                            >
                                                {deletingImage ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
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
                                            <button
                                                onClick={() => {
                                                    setUrlContext({ scope: 'global', rowKey: null, rowIndex: null });
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

                {/* Save button */}
                <div className="pt-4 border-t border-slate-800 flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-6 py-2 rounded text-sm font-semibold text-black"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    {saveStatus && <span className="text-sm text-emerald-400">{saveStatus}</span>}
                </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-7">
                <div className="lg:sticky lg:top-6 bg-slate-900/40 p-4 rounded-lg border border-slate-800 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                        <span className="text-xs uppercase text-slate-500">Live Preview</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <SectionPreview type={type} content={previewContent} media={formFields.media} />
                </div>
            </div>
        </div>
    );
}