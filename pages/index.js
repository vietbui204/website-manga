import { createClient } from '@supabase/supabase-js';
import Navbar from '../src/components/UI/Navbar';
import Container from '../src/components/UI/Container';
import Footer from '../src/components/UI/Footer';
import HeroSection from '../src/components/sections/HeroSection';
import MangaList from '../src/components/manga/MangaList';
import Link from 'next/link';

export default function Home({ featuredManga, topMangas, latestMangas }) {
	return (
		<div className="bg-gray-900 min-h-screen text-gray-100 flex flex-col">
			<Navbar />

			{/* Hero Section - Featured Manga */}
			<HeroSection manga={featuredManga} />

			<Container className="flex-1 py-12">
				{/* Top / Trending Section */}
				<section className="mb-16">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-white flex items-center gap-2">
							<svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
							Truyện Nổi Bật
						</h2>
						<Link href="/ranking" className="text-sm font-medium text-purple-400 hover:text-purple-300">Xem tất cả →</Link>
					</div>
					<MangaList mangas={topMangas} />
				</section>

				{/* Latest Updates Section */}
				<section>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-white flex items-center gap-2">
							<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							Mới Cập Nhật
						</h2>
						<Link href="/latest" className="text-sm font-medium text-purple-400 hover:text-purple-300">Xem tất cả →</Link>
					</div>
					{/* Use a grid for latest */}
					<MangaList mangas={latestMangas} />
				</section>
			</Container>

			<Footer />
		</div>
	);
}

export async function getStaticProps() {
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
	);

	// 1. Fetch Featured (Highest Views)
	// We explicitly select genre names too
	const { data: featured } = await supabase
		.from('mangas')
		.select('*, manga_genres(genres(name))')
		.order('views', { ascending: false })
		.limit(1)
		.single();

	// 2. Fetch Top (Highest Views, excluding featured if possible, but simplicity sake we just fetch top 6)
	const { data: top } = await supabase
		.from('mangas')
		.select('*, chapters(count)') // get chapter count if possible
		.order('views', { ascending: false })
		.limit(6);

	// 3. Fetch Latest (Updated At)
	const { data: latest } = await supabase
		.from('mangas')
		.select('*')
		.order('updated_at', { ascending: false })
		.limit(12);

	return {
		props: {
			featuredManga: featured || null,
			topMangas: top || [],
			latestMangas: latest || []
		},
		revalidate: 60
	};
}
