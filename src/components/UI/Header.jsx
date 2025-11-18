import Link from 'next/link';

export default function Header({ title }){
  return (
    <header className="app-header sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900">{title || 'MangaSite'}</Link>
      </div>
    </header>
  );
}
