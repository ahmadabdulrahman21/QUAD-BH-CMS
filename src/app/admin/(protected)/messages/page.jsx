'use client';

import React from 'react';
import { Search, Mail, Trash2, ChevronDown, ChevronUp, Calendar, User, Clock } from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Messages per page for pagination
 * Adjust based on your performance requirements
 */
const MESSAGES_PER_PAGE = 10;

/**
 * Sort options for messages
 */
const SORT_OPTIONS = {
    NEWEST_FIRST: 'newest',
    OLDEST_FIRST: 'oldest',
    NAME_ASC: 'name_asc',
    NAME_DESC: 'name_desc',
    EMAIL_ASC: 'email_asc',
    EMAIL_DESC: 'email_desc',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats a date string into a human-readable format
 * Handles relative dates for recent messages
 * 
 * @param {string} dateString - ISO date string from database
 * @returns {string} - Formatted date string
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z') // "January 15, 2024 at 10:30 AM"
 * formatDate(new Date().toISOString()) // "Just now"
 */
const formatDate = (dateString) => {
    if (!dateString) return 'No date';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Relative time for recent messages
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    // Full date for older messages
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Truncates text to a specified length with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis
 * 
 * @example
 * truncateText("Hello World", 5) // "Hello..."
 */
const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Validates if a string is a valid email format
 * 
 * @param {string} email - Email string to validate
 * @returns {boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing modal state
 * Provides consistent interface for showing/hiding modals
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

    const showConfirmDialog = (title, message, onConfirm) => {
        showModal(title, message, 'danger', 'Yes, Delete', 'Cancel', onConfirm);
    };

    return {
        modalConfig,
        showModal,
        closeModal,
        showConfirmDialog
    };
};

/**
 * Custom hook for managing messages data
 * Handles fetching, filtering, sorting, and pagination
 * 
 * @returns {Object} - Messages data and control functions
 */
const useMessages = () => {
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortBy, setSortBy] = React.useState(SORT_OPTIONS.NEWEST_FIRST);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedMessage, setSelectedMessage] = React.useState(null);
    const [deleting, setDeleting] = React.useState(false);

    /**
     * Fetches messages from the API
     * Includes error handling and loading states
     */
    const fetchMessages = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch messages from API (no cache for real-time data)
            const response = await fetch('/api/messages', {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch messages: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different API response formats
            const messagesList = data.messages || data.data || data;
            setMessages(Array.isArray(messagesList) ? messagesList : []);

        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages on mount
    React.useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    /**
     * Filters messages based on search term
     * Searches across name, email, and message fields
     */
    const filteredMessages = React.useMemo(() => {
        if (!searchTerm.trim()) return messages;

        const searchLower = searchTerm.toLowerCase();
        return messages.filter(msg =>
            msg.name?.toLowerCase().includes(searchLower) ||
            msg.email?.toLowerCase().includes(searchLower) ||
            msg.message?.toLowerCase().includes(searchLower)
        );
    }, [messages, searchTerm]);

    /**
     * Sorts messages based on selected sort option
     */
    const sortedMessages = React.useMemo(() => {
        const sorted = [...filteredMessages];

        switch (sortBy) {
            case SORT_OPTIONS.NEWEST_FIRST:
                return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case SORT_OPTIONS.OLDEST_FIRST:
                return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case SORT_OPTIONS.NAME_ASC:
                return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case SORT_OPTIONS.NAME_DESC:
                return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            case SORT_OPTIONS.EMAIL_ASC:
                return sorted.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
            case SORT_OPTIONS.EMAIL_DESC:
                return sorted.sort((a, b) => (b.email || '').localeCompare(a.email || ''));
            default:
                return sorted;
        }
    }, [filteredMessages, sortBy]);

    /**
     * Paginates messages
     * Calculates total pages and current page messages
     */
    const paginatedMessages = React.useMemo(() => {
        const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE;
        const endIndex = startIndex + MESSAGES_PER_PAGE;
        return sortedMessages.slice(startIndex, endIndex);
    }, [sortedMessages, currentPage]);

    /**
     * Total number of pages based on filtered/sorted messages
     */
    const totalPages = Math.ceil(sortedMessages.length / MESSAGES_PER_PAGE);

    /**
     * Deletes a single message by ID
     * 
     * @param {number|string} id - Message ID to delete
     */
    const deleteMessage = async (id) => {
        try {
            setDeleting(true);

            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            // Remove message from state
            setMessages(prev => prev.filter(msg => msg.id !== id));

            // Close detail view if deleted message was selected
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }

            // Adjust current page if necessary
            if (paginatedMessages.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }

            return true;
        } catch (err) {
            console.error('Error deleting message:', err);
            throw err;
        } finally {
            setDeleting(false);
        }
    };

    /**
     * Deletes all messages
     */
    const deleteAllMessages = async () => {
        try {
            setDeleting(true);

            const response = await fetch('/api/messages', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete all messages');
            }

            // Clear all messages
            setMessages([]);
            setSelectedMessage(null);
            setCurrentPage(1);

            return true;
        } catch (err) {
            console.error('Error deleting all messages:', err);
            throw err;
        } finally {
            setDeleting(false);
        }
    };

    return {
        messages: paginatedMessages,
        allMessages: sortedMessages,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        totalPages,
        totalMessages: sortedMessages.length,
        selectedMessage,
        setSelectedMessage,
        deleting,
        deleteMessage,
        deleteAllMessages,
        refreshMessages: fetchMessages,
    };
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Modal Component
 * Reusable modal for confirmations and alerts
 */
const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: '⚠️',
                    confirmColor: 'bg-red-500 hover:bg-red-600',
                    borderColor: 'border-red-500/30'
                };
            case 'success':
                return {
                    icon: '✅',
                    confirmColor: 'bg-emerald-500 hover:bg-emerald-600',
                    borderColor: 'border-emerald-500/30'
                };
            case 'info':
                return {
                    icon: 'ℹ️',
                    confirmColor: 'bg-blue-500 hover:bg-blue-600',
                    borderColor: 'border-blue-500/30'
                };
            default:
                return {
                    icon: '⚠️',
                    confirmColor: 'bg-yellow-500 hover:bg-yellow-600',
                    borderColor: 'border-yellow-500/30'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
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

/**
 * Loading Skeleton Component
 * Shows animated placeholders while data is loading
 */
const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                        </div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded w-3/4 mt-3"></div>
                </div>
            </div>
        ))}
    </div>
);

/**
 * Empty State Component
 * Shown when no messages exist
 */
const EmptyState = ({ onRefresh }) => (
    <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Messages Yet</h3>
        <p className="text-gray-400 mb-4">
            When visitors submit the contact form, their messages will appear here.
        </p>
        <button
            onClick={onRefresh}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded text-sm font-semibold text-black transition-colors"
        >
            Check for new messages
        </button>
    </div>
);

/**
 * Error State Component
 * Shown when there's an error loading messages
 */
const ErrorState = ({ message, onRetry }) => (
    <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Messages</h3>
        <p className="text-gray-400 mb-4">{message}</p>
        <button
            onClick={onRetry}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded text-sm font-semibold text-black transition-colors"
        >
            Try Again
        </button>
    </div>
);

/**
 * SearchBar Component
 * Search input with icon for filtering messages
 */
const SearchBar = ({ value, onChange }) => (
    <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
            type="text"
            placeholder="Search messages by name, email, or content..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-lg text-sm border border-slate-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
        />
        {value && (
            <button
                onClick={() => onChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
                ✕
            </button>
        )}
    </div>
);

/**
 * SortDropdown Component
 * Dropdown for selecting sort order
 */
const SortDropdown = ({ value, onChange }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 bg-slate-800 rounded-lg text-sm border border-slate-700 text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
    >
        <option value={SORT_OPTIONS.NEWEST_FIRST}>Newest First</option>
        <option value={SORT_OPTIONS.OLDEST_FIRST}>Oldest First</option>
        <option value={SORT_OPTIONS.NAME_ASC}>Name (A-Z)</option>
        <option value={SORT_OPTIONS.NAME_DESC}>Name (Z-A)</option>
        <option value={SORT_OPTIONS.EMAIL_ASC}>Email (A-Z)</option>
        <option value={SORT_OPTIONS.EMAIL_DESC}>Email (Z-A)</option>
    </select>
);

/**
 * Pagination Component
 * Page navigation with numbers and prev/next buttons
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    /**
     * Generates an array of page numbers to display
     * Shows first, last, and pages around current page
     */
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Maximum visible page numbers

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate range around current page
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust range for edge cases
            if (currentPage <= 2) {
                end = 4;
            } else if (currentPage >= totalPages - 1) {
                start = totalPages - 3;
            }

            // Add ellipsis after first page if needed
            if (start > 2) {
                pages.push('...');
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis before last page if needed
            if (end < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            {/* Previous button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
                ← Prev
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${page === currentPage
                        ? 'bg-cyan-500 border-cyan-500 text-black font-semibold'
                        : page === '...'
                            ? 'bg-transparent border-transparent text-gray-500 cursor-default'
                            : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Next button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
                Next →
            </button>
        </div>
    );
};

/**
 * MessageCard Component
 * Individual message card for the list view
 */
const MessageCard = ({ message, isSelected, onClick, onDelete }) => {
    /**
     * Opens Gmail compose window with pre-filled recipient and context
     */
    const handleReplyViaGmail = (e) => {
        e.stopPropagation();

        const email = message.email || '';
        const subject = encodeURIComponent('Re: Your message to Quad BH');
        const body = encodeURIComponent(
            `Hello ${message.name || ''},\n\n` +
            `Thank you for reaching out to us.\n\n` +
            `We received your message:\n` +
            `"${message.message?.substring(0, 200)}${message.message?.length > 200 ? '...' : ''}"\n\n` +
            `We will get back to you shortly.\n\n` +
            `Best regards,\n` +
            `Quad BH Team\n\n` +
            `---\n` +
            `Reference: Message #${message.id}\n` +
            `Received: ${formatDate(message.created_at)}`
        );

        window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
            '_blank'
        );
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                ? 'bg-slate-700/50 border-cyan-500 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                }`}
        >
            {/* Message header with name and date */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {message.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Name and email */}
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                            {message.name || 'Anonymous'}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                            {message.email || 'No email'}
                        </p>
                    </div>
                </div>

                {/* Date and action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-500" title={formatDate(message.created_at)}>
                        {formatDate(message.created_at)}
                    </span>

                    {/* Quick reply button */}
                    {message.email && (
                        <button
                            onClick={handleReplyViaGmail}
                            className="text-gray-500 hover:text-cyan-400 transition-colors p-1"
                            title="Reply via Gmail"
                        >
                            <Mail size={14} />
                        </button>
                    )}

                    {/* Delete button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(message);
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Delete message"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Message preview */}
            <p className="text-sm text-gray-300 line-clamp-2 ml-13">
                {truncateText(message.message, 120)}
            </p>
        </div>
    );
};

/**
 * MessageDetail Component
 * Full message view in the detail panel
 */
const MessageDetail = ({ message, onClose, onDelete }) => {
    if (!message) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <Mail size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-lg">Select a message to view</p>
                    <p className="text-sm mt-2">Click on any message from the list</p>
                </div>
            </div>
        );
    }

    /**
     * Opens Gmail compose window with pre-filled recipient and full context
     */
    const handleReplyViaGmail = () => {
        const email = message.email || '';
        const subject = encodeURIComponent('Re: Your message to Quad BH');
        const body = encodeURIComponent(
            `Hello ${message.name || ''},\n\n` +
            `Thank you for reaching out to us.\n\n` +
            `We received your message:\n` +
            `"${message.message?.substring(0, 300)}${message.message?.length > 300 ? '...' : ''}"\n\n` +
            `We will get back to you shortly.\n\n` +
            `Best regards,\n` +
            `Quad BH Team\n\n` +
            `---\n` +
            `Reference: Message #${message.id}\n` +
            `Received: ${formatDate(message.created_at)}`
        );

        window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
            '_blank'
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Detail header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors lg:hidden"
                >
                    ← Back to list
                </button>
                <div className="flex items-center gap-2">
                    {/* Reply via Gmail button */}
                    {message.email && (
                        <button
                            onClick={handleReplyViaGmail}
                            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded text-xs text-cyan-400 transition-colors flex items-center gap-1 border border-cyan-500/30"
                            title="Reply via Gmail"
                        >
                            <Mail size={14} />
                            Reply via Gmail
                        </button>
                    )}

                    {/* Delete button */}
                    <button
                        onClick={() => onDelete(message)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-xs text-red-400 transition-colors flex items-center gap-1 border border-red-500/30"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Message content */}
            <div className="flex-1 space-y-4">
                {/* Sender info */}
                <div className="flex items-center gap-4">
                    {/* Large avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                        {message.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Name and email */}
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            {message.name || 'Anonymous'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {message.email || 'No email provided'}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{formatDate(message.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Message body */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Message
                    </h3>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {message.message || 'No message content'}
                    </p>
                </div>

                {/* Message metadata */}
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Details
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Message ID</span>
                            <span className="text-gray-300 font-mono text-xs">#{message.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Received</span>
                            <span className="text-gray-300">{formatDate(message.created_at)}</span>
                        </div>
                        {message.email && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email Status</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${isValidEmail(message.email)
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                    {isValidEmail(message.email) ? '✓ Valid' : '⚠ Invalid'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * StatsBar Component
 * Shows message statistics at the top
 */
const StatsBar = ({ total, filtered, searchTerm }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Total messages */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <Mail size={20} className="text-blue-400" />
                </div>
                <div>
                    <p className="text-xs text-gray-400">Total Messages</p>
                    <p className="text-xl font-bold text-white">{total}</p>
                </div>
            </div>
        </div>

        {/* Filtered messages (when searching) */}
        {searchTerm && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                        <Search size={20} className="text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Search Results</p>
                        <p className="text-xl font-bold text-white">{filtered}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Latest message info */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <Clock size={20} className="text-emerald-400" />
                </div>
                <div>
                    <p className="text-xs text-gray-400">Messages</p>
                    <p className="text-sm font-semibold text-white">
                        {total > 0 ? 'View & Reply' : 'No messages'}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AdminMessagesPage Component
 * 
 * Main page for viewing and managing contact form messages
 * Features:
 * - List view with search and sort
 * - Detail view for reading full messages
 * - Reply via Gmail with pre-filled email
 * - Delete individual or all messages
 * - Pagination for large message lists
 * - Responsive design (mobile-first)
 * - Real-time search filtering
 * 
 * Database schema:
 * - id: Unique identifier
 * - name: Sender's name
 * - email: Sender's email
 * - message: Message content
 * - created_at: Timestamp
 */
export default function AdminMessagesPage() {
    // ========================================================================
    // HOOKS
    // ========================================================================

    // Messages data and operations
    const {
        messages,
        allMessages,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        totalPages,
        totalMessages,
        selectedMessage,
        setSelectedMessage,
        deleting,
        deleteMessage,
        deleteAllMessages,
        refreshMessages,
    } = useMessages();

    // Modal management
    const {
        modalConfig,
        closeModal,
        showConfirmDialog,
    } = useModal();

    // Mobile responsive: track if detail view is shown
    const [showMobileDetail, setShowMobileDetail] = React.useState(false);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    /**
     * Handles message selection
     * On mobile, shows detail view; on desktop, updates selected message
     */
    const handleSelectMessage = (message) => {
        setSelectedMessage(message);
        if (window.innerWidth < 1024) {
            setShowMobileDetail(true);
        }
    };

    /**
     * Handles back button on mobile detail view
     */
    const handleBackToList = () => {
        setShowMobileDetail(false);
    };

    /**
     * Handles single message deletion with confirmation
     */
    const handleDeleteMessage = (message) => {
        showConfirmDialog(
            'Delete Message',
            `Are you sure you want to delete this message from ${message.name || 'Anonymous'}?\n\nThis action cannot be undone.`,
            async () => {
                try {
                    await deleteMessage(message.id);
                } catch (err) {
                    alert('Failed to delete message: ' + err.message);
                }
            }
        );
    };

    /**
     * Handles deleting all messages with confirmation
     */
    const handleDeleteAll = () => {
        showConfirmDialog(
            'Delete All Messages',
            `Are you sure you want to delete all ${totalMessages} messages?\n\nThis action cannot be undone and will permanently remove all messages from the database.`,
            async () => {
                try {
                    await deleteAllMessages();
                } catch (err) {
                    alert('Failed to delete all messages: ' + err.message);
                }
            }
        );
    };

    /**
     * Handles page change and scrolls to top
     */
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of message list
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Confirmation modal */}
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

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* ============================================================ */}
                {/* PAGE HEADER */}
                {/* ============================================================ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Messages</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage contact form submissions from your website visitors
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        {/* Refresh button */}
                        <button
                            onClick={refreshMessages}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700 text-white transition-colors"
                            title="Refresh messages"
                        >
                            🔄 Refresh
                        </button>

                        {/* Delete all button */}
                        {totalMessages > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 border border-red-500/30 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : '🗑️ Delete All'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ============================================================ */}
                {/* STATS BAR */}
                {/* ============================================================ */}
                {!loading && !error && (
                    <StatsBar
                        total={totalMessages}
                        filtered={allMessages.length}
                        searchTerm={searchTerm}
                    />
                )}

                {/* ============================================================ */}
                {/* SEARCH AND SORT CONTROLS */}
                {/* ============================================================ */}
                {!loading && !error && totalMessages > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <SearchBar value={searchTerm} onChange={setSearchTerm} />
                        <SortDropdown value={sortBy} onChange={setSortBy} />
                    </div>
                )}

                {/* ============================================================ */}
                {/* MAIN CONTENT AREA */}
                {/* ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* -------------------------------------------------------- */}
                    {/* MESSAGE LIST (Left/Center) */}
                    {/* -------------------------------------------------------- */}
                    <div className={`lg:col-span-2 ${showMobileDetail ? 'hidden lg:block' : 'block'}`}>
                        {/* Loading state */}
                        {loading && <LoadingSkeleton />}

                        {/* Error state */}
                        {error && <ErrorState message={error} onRetry={refreshMessages} />}

                        {/* Empty state */}
                        {!loading && !error && messages.length === 0 && !searchTerm && (
                            <EmptyState onRefresh={refreshMessages} />
                        )}

                        {/* No search results */}
                        {!loading && !error && messages.length === 0 && searchTerm && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                                <p className="text-gray-400">
                                    No messages match your search for &ldquo;{searchTerm}&rdquo;
                                </p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}

                        {/* Messages list */}
                        {!loading && !error && messages.length > 0 && (
                            <>
                                <div className="space-y-3">
                                    {messages.map((message) => (
                                        <MessageCard
                                            key={message.id}
                                            message={message}
                                            isSelected={selectedMessage?.id === message.id}
                                            onClick={() => handleSelectMessage(message)}
                                            onDelete={handleDeleteMessage}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />

                                {/* Results info */}
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    Showing {messages.length} of {totalMessages} message{totalMessages !== 1 ? 's' : ''}
                                    {searchTerm && ` (filtered from ${allMessages.length} results)`}
                                </p>
                            </>
                        )}
                    </div>

                    {/* -------------------------------------------------------- */}
                    {/* MESSAGE DETAIL (Right) */}
                    {/* -------------------------------------------------------- */}
                    <div className={`${showMobileDetail
                        ? 'block fixed inset-0 z-40 bg-slate-950 p-4 lg:p-0 lg:static lg:bg-transparent'
                        : 'hidden lg:block'
                        }`}>
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4 lg:p-6 h-full lg:sticky lg:top-6">
                            <MessageDetail
                                message={selectedMessage}
                                onClose={handleBackToList}
                                onDelete={handleDeleteMessage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}