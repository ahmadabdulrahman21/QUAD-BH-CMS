import Sidebar from '@/app/components/admin/Sidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <main className="flex-1 lg:ml-64">
                {children}
            </main>

        </div>
    );
}