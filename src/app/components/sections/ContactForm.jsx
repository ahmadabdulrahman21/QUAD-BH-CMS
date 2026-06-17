'use client';

import React from 'react';
import { Mail, Phone, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactForm({ data }) {
  const [contact, setContact] = React.useState(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });

  // UI state
  const [submitting, setSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null); // 'success' | 'error' | null
  const [submitMessage, setSubmitMessage] = React.useState('');
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    // 1. Standalone / Preview Fallback: Fetch directly from API if no prop is provided
    if (!data) {
      const fetchData = async () => {
        try {
          const res = await fetch('/api/sections');
          const json = await res.json();
          const sections = json?.sections || [];

          const row = sections.find((item) => item.type === 'contact');
          if (!row) return;

          const content = typeof row.content === 'string'
            ? JSON.parse(row.content)
            : row.content;

          setContact(content || {});
        } catch (err) {
          console.error("ContactForm Fetch Error:", err);
        }
      };

      fetchData();
    } else {
      // 2. Main Page Layout Flow: Unpack the JSON data.content property correctly
      const parsedContent = typeof data.content === 'string'
        ? JSON.parse(data.content)
        : data.content || {};

      setContact(parsedContent);
    }
  }, [data]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          message: formData.message.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          setSubmitStatus('error');
          setSubmitMessage(data.errors.join('. '));
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
        return;
      }

      // Success!
      setSubmitStatus('success');
      setSubmitMessage(data.message || 'Message sent successfully!');

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setErrors({});

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!contact) return null;

  // ---------------- SAFE FIELDS ----------------
  const title = typeof contact.title === 'string' ? contact.title : '';
  const subtitle = typeof contact.subtitle === 'string' ? contact.subtitle : '';
  const email = typeof contact.email === 'string' ? contact.email : '';
  const whatsapp = typeof contact.whatsapp === 'string' ? contact.whatsapp : '';
  const buttonText = typeof contact.buttonText === 'string' ? contact.buttonText : 'Send Message';

  const safeWhatsAppNumber = whatsapp.trim().length > 0
    ? whatsapp.replace(/\D/g, '')
    : null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16">

          {/* LEFT */}
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              {title}
            </h2>

            <p className="text-xl text-gray-500 max-w-md mb-8">
              {subtitle}
            </p>

            <div className="space-y-5">

              {/* EMAIL */}
              {email && (
                <Link
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-cyan-600 transition w-fit"
                >
                  <Mail className="w-5 h-5 text-cyan-600" />
                  <span>{email}</span>
                </Link>
              )}

              {/* WHATSAPP */}
              {safeWhatsAppNumber && (
                <Link
                  href={`https://wa.me/${safeWhatsAppNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition w-fit"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                  <span>{whatsapp}</span>
                </Link>
              )}

            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">

            <h3 className="text-xl font-semibold mb-6 text-gray-900">
              Or send us a message
            </h3>

            {/* Status Messages */}
            {submitStatus && (
              <div
                className={`mb-6 p-4 rounded-xl border ${submitStatus === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
                  }`}
              >
                <p className="text-sm font-medium flex items-center gap-2">
                  {submitStatus === 'success' ? '✓' : '⚠️'} {submitMessage}
                </p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>

              {/* Name Field */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full px-5 py-3 rounded-xl border bg-white focus:outline-none focus:border-cyan-500 transition ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full px-5 py-3 rounded-xl border bg-white focus:outline-none focus:border-cyan-500 transition ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full px-5 py-3 rounded-xl border bg-white focus:outline-none focus:border-cyan-500 transition resize-none ${errors.message ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {buttonText}
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}