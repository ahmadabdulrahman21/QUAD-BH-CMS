// app/privacy/page.jsx
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy - Quad BH',
    description: 'Learn how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                {/* Back to Home - Top */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
                >
                    <svg
                        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>

                <div className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 p-8 sm:p-12">

                    {/* Header */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="mt-2 text-sm italic text-gray-500">
                        Last updated: June 17, 2026
                    </p>
                    <p className="mt-6 text-gray-600 leading-relaxed">
                        This Privacy Policy explains how we collect, use, and protect your
                        information when you use our website.
                    </p>

                    {/* Section 1 */}
                    <Section title="1. Information We Collect">
                        <p>When you use our contact form or interact with our website, we may collect the following information:</p>
                        <List>
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Message content</li>
                            <li>Browser and device information (for analytics)</li>
                        </List>
                        <p>We do not collect sensitive personal data unless you voluntarily provide it.</p>
                    </Section>

                    {/* Section 2 */}
                    <Section title="2. How We Use Your Information">
                        <p>We use the collected information to:</p>
                        <List>
                            <li>Respond to your inquiries or messages</li>
                            <li>Provide customer support</li>
                            <li>Improve our website and services</li>
                            <li>Prevent spam, abuse, or malicious activity</li>
                            <li>Maintain website security</li>
                        </List>
                        <p>We do not sell, rent, or trade your personal information to any third parties.</p>
                    </Section>

                    {/* Section 3 */}
                    <Section title="3. Data Storage">
                        <p>
                            Your information may be stored securely in our database (such as MySQL)
                            and is only accessible to authorized administrators. We take reasonable
                            technical and organizational measures to protect your data.
                        </p>
                    </Section>

                    {/* Section 4 */}
                    <Section title="4. Cookies">
                        <p>Our website may use cookies to:</p>
                        <List>
                            <li>Improve user experience</li>
                            <li>Analyze website traffic</li>
                            <li>Remember user preferences</li>
                        </List>
                        <p>You can disable cookies in your browser settings at any time.</p>
                    </Section>

                    {/* Section 5 */}
                    <Section title="5. Third-Party Services">
                        <p>We may use third-party services such as:</p>
                        <List>
                            <li>Hosting providers</li>
                            <li>Analytics tools</li>
                            <li>Email services (SMTP)</li>
                        </List>
                        <p>These services may collect limited data as required to perform their functions.</p>
                    </Section>

                    {/* Section 6 */}
                    <Section title="6. Data Security">
                        <p>We implement security measures to protect your data, including:</p>
                        <List>
                            <li>Encrypted connections (HTTPS)</li>
                            <li>Secure database access</li>
                            <li>Limited admin access</li>
                        </List>
                        <p className="text-sm text-gray-500 italic">
                            However, no method of transmission over the internet is 100% secure.
                        </p>
                    </Section>

                    {/* Section 7 */}
                    <Section title="7. Your Rights">
                        <p>Depending on your location, you may have the right to:</p>
                        <List>
                            <li>Request access to your data</li>
                            <li>Request correction or deletion of your data</li>
                            <li>Withdraw consent for data usage</li>
                        </List>
                        <p>To make a request, contact us using the email below.</p>
                    </Section>

                    {/* Section 8 */}
                    <Section title="8. Data Retention">
                        <p>We keep your data only as long as necessary for:</p>
                        <List>
                            <li>Customer service</li>
                            <li>Legal obligations</li>
                            <li>Website functionality</li>
                        </List>
                        <p>You may request deletion at any time.</p>
                    </Section>

                    {/* Section 9 */}
                    <Section title="9. Contact Us">
                        <p>If you have any questions about this Privacy Policy, contact us:</p>
                        <a
                            href="mailto:info@quad-bh.com"
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-5 py-3 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                        >
                            <span>📧</span> info@quad-bh.com
                        </a>
                    </Section>

                    {/* Section 10 */}
                    <Section title="10. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. Any changes will
                            be posted on this page with a new &ldquo;Last updated&rdquo; date.
                        </p>
                    </Section>

                    {/* Footer Note */}
                    <div className="mt-12 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} Quad BH. All rights reserved.
                        </p>
                    </div>

                </div>

            </div>
        </main>
    );
}

// Reusable Section Component
function Section({ title, children }) {
    return (
        <section className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 pb-3 border-b-2 border-gray-100">
                {title}
            </h2>
            <div className="mt-4 text-gray-600 leading-relaxed space-y-3">
                {children}
            </div>
        </section>
    );
}

// Reusable List Component
function List({ children }) {
    return (
        <ul className="mt-2 mb-3 space-y-1.5">
            {children}
        </ul>
    );
}

// Reusable List Item
function ListItem({ children }) {
    return (
        <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
            <span>{children}</span>
        </li>
    );
}