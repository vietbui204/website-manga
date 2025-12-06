import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import Sidebar from './Sidebar';
import Navbar from '../UI/Navbar'; // Reuse main Navbar for top if sidebar is side-only? 
// Actually standard dashboard often has side + top. Let's just use Sidebar + Content area. 
// Maybe simplify: No top navbar OR minimal top navbar.
// Let's use Sidebar on left, Content on right.

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
