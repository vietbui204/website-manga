import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Navbar(){
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/" className="logo">MangaSite</Link>
      </div>
      <div className="nav-center">
        <Link href="#">Thể loại</Link>
        <Link href="#">Xếp hạng</Link>
        <Link href="#">Lịch sử đọc</Link>
        <Link href="#">Theo dõi</Link>
      </div>
      <div className="nav-right">
        <SearchBar />
        <Link href="#">Đăng nhập</Link>
        <Link href="#">Đăng ký</Link>
      </div>
    </nav>
  );
}
