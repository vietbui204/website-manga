import Link from 'next/link';
import SearchBar from './SearchBar';
import GenreDropdown from './GenreDropdown';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/" className="logo">MangaSite</Link>
      </div>
      <div className="nav-center">
        <GenreDropdown />
        <Link href="#">Xếp hạng</Link>
        <Link href="#">Lịch sử đọc</Link>
        <Link href="/follows">Theo dõi</Link>
      </div>
      <div className="nav-right">
        <SearchBar />
        <Link href="/login">Đăng nhập</Link>
        <Link href="/register" className="btn-primary">Đăng ký</Link>
      </div>
    </nav>
  );
}
