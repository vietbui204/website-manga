import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import GenreDropdown from './GenreDropdown';
import SearchSuggest from './SearchSuggest';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Close menu on click outside
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    router.push('/');
  };

  // Scroll Lock Logic
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true);  // Show on scroll up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`navbar transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <div className="nav-left">
        <Link href="/" className="logo flex items-center">
          <Image src="/logo.png" alt="Manga Logo" width={50} height={50} className="h-10 w-auto object-contain" />
        </Link>
      </div>
      <div className="nav-center hidden md:flex items-center gap-2">
        <GenreDropdown />
        <Link href="/ranking" className="rounded-full px-4 py-2 text-sm font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-purple-400">
          Xếp hạng
        </Link>
        <Link href="/history" className="rounded-full px-4 py-2 text-sm font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-purple-400">
          Lịch sử đọc
        </Link>
        <Link href="/follows" className="rounded-full px-4 py-2 text-sm font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-purple-400">
          Theo dõi
        </Link>
      </div>
      <div className="nav-right flex items-center gap-3">
        <SearchSuggest />

        {user ? (
          // Logged In: Avatar Dropdown
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-purple-500 shadow-md transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <Image
                src="/default-avatar.png"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-gray-700 bg-gray-800 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-b border-gray-700 px-4 py-3">
                  <p className="text-sm font-medium text-gray-200 truncate">Xin chào,</p>
                  <p className="truncate text-xs font-bold text-purple-400">{user.email?.split('@')[0]}</p>
                </div>
                <div className="p-1">
                  <Link href="/profile" className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    Hồ sơ cá nhân
                  </Link>
                  <Link href="/dashboard" className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    Quản lý truyện
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Logged Out: Auth Buttons
          <>
            <Link href="/login" className="whitespace-nowrap rounded-full border-2 border-purple-500 px-5 py-2 text-sm font-bold text-purple-400 transition-all hover:bg-purple-900/20">
              Đăng nhập
            </Link>
            <Link href="/register" className="whitespace-nowrap rounded-full bg-purple-600 border-2 border-purple-600 px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:border-purple-700 hover:shadow-lg">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
