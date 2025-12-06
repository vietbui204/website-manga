import Link from 'next/link';
import Image from 'next/image';
import Container from '../../../src/components/UI/Container';
import Navbar from '../../../src/components/UI/Navbar';
import Footer from '../../../src/components/UI/Footer';
import ChapterList from '../../../src/components/manga/ChapterList';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import CommentSection from '../../../src/components/manga/CommentSection';
import fs from 'fs';
import path from 'path';

export default function MangaDetail({ manga }) {
	const [user, setUser] = useState(null);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followCount, setFollowCount] = useState(0);

	useEffect(() => {
		if (manga) {
			checkUser();
			fetchFollowCount();
		}
	}, [manga]);

	async function fetchFollowCount() {
		const { count } = await supabase
			.from('follows')
			.select('*', { count: 'exact', head: true })
			.eq('manga_id', manga.id);
		setFollowCount(count || 0);
	}

	async function checkUser() {
		const { data: { session } } = await supabase.auth.getSession();
		const currentUser = session?.user;
		setUser(currentUser);
		if (currentUser && manga?.id) {
			checkFollow(currentUser.id);
		}
	}

	async function checkFollow(userId) {
		const { data } = await supabase
			.from('follows')
			.select('user_id')
			.eq('user_id', userId)
			.eq('manga_id', manga.id)
			.maybeSingle();
		setIsFollowing(!!data);
	}

	async function handleFollow() {
		if (!user) {
			alert('Vui lòng đăng nhập để theo dõi.');
			return;
		}
		if (isFollowing) {
			const { error } = await supabase
				.from('follows')
				.delete()
				.eq('user_id', user.id)
				.eq('manga_id', manga.id);
			if (!error) setIsFollowing(false);
		} else {
			const { error } = await supabase
				.from('follows')
				.insert({ user_id: user.id, manga_id: manga.id });
			if (!error) setIsFollowing(true);
		}
		// Refresh follow count after action
		fetchFollowCount();
	}
	// Handle Read Click
	async function handleRead(e, href) {
		e.preventDefault();

		// If user is logged in, increment view and save history
		if (user) {
			try {
				// 1. Increment View
				await supabase.rpc('increment_view', { manga_id: manga.id });

				// 2. Save History (Upsert)
				await supabase
					.from('reading_history')
					.upsert({
						user_id: user.id,
						manga_id: manga.id,
						last_read_at: new Date().toISOString()
					}, { onConflict: 'user_id, manga_id' });

			} catch (err) {
				console.error('Failed to update stats/history', err);
			}
		}

		// Proceed to navigation after update
		window.location.href = href;
	}

	if (!manga) return (
		<>
			<Header title="FPTxManga" />
			<Container>
				<p>Không tìm thấy truyện.</p>
			</Container>
		</>
	);
	const firstChapter = manga.chapters?.[0]?.slug || '';
	const latestChapter = manga.chapters?.[manga.chapters.length - 1]?.slug || firstChapter;
	const cover = manga.cover_url || manga.coverUrl || '';
	const avatar = manga.avatar_url || manga.avatarUrl || manga.cover_url || manga.coverUrl || '';
	const totalViews = Number(manga.views || 0); // Use unified views column
	const totalLikes = Number(manga.likes || manga.likeCount || 0);
	const totalComments = Number(manga.comments || manga.commentsCount || 0);

	return (
		<>
			<Navbar />

			<div className="relative min-h-screen bg-gray-950 pb-12">
				{/* Modern Hero Section */}
				<div className="relative h-[300px] w-full overflow-hidden sm:h-[400px]">
					{/* Blurred Background */}
					<div className="absolute inset-0 bg-gray-900">
						{cover && (
							<Image
								src={cover}
								alt="background"
								fill
								className="object-cover opacity-30 blur-xl scale-110"
								priority
							/>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-gray-900/60" />
					</div>
				</div>

				<Container className="relative -mt-32 sm:-mt-48 z-10">
					<div className="flex flex-col gap-8 md:flex-row">
						{/* Left: Poster */}
						<div className="flex-shrink-0 mx-auto md:mx-0">
							<div className="relative h-[300px] w-[200px] sm:h-[380px] sm:w-[250px] overflow-hidden rounded-xl border-4 border-gray-800 shadow-2xl">
								<Image
									src={cover || '/placeholder.jpg'}
									alt={manga.title}
									fill
									className="object-cover"
									priority
								/>
							</div>
						</div>

						{/* Right: Info */}
						<div className="flex-1 text-white pt-4 md:pt-16">
							<h1 className="text-3xl font-extrabold leading-tight text-white md:drop-shadow-lg sm:text-4xl">
								{manga.title}
							</h1>

							<div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium">
								{manga.author && (
									<div className="flex items-center gap-1 text-gray-400 md:text-gray-200">
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
										{manga.author}
									</div>
								)}
								<div className="flex items-center gap-1 text-yellow-500 md:text-yellow-400">
									<svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
									<span>4.8</span>
								</div>
								<div className="flex items-center gap-1 text-gray-400 md:text-gray-300">
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
									{totalViews.toLocaleString()}
								</div>
							</div>

							<div className="mt-4 flex flex-wrap gap-2">
								{manga.manga_genres?.map(mg => mg.genres).filter(Boolean).map((g, i) => (
									<span key={i} className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200 backdrop-blur-sm hover:bg-purple-600 transition-colors cursor-default border border-white/10">
										{g.name}
									</span>
								))}
							</div>

							{/* Action Buttons */}
							<div className="mt-6 flex flex-wrap gap-3">
								<Link
									href={`/m/${manga.slug}/${firstChapter}`}
									onClick={(e) => handleRead(e, `/m/${manga.slug}/${firstChapter}`)}
									className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-700 hover:scale-105"
								>
									Đọc Ngay
								</Link>
								<button
									onClick={handleFollow}
									className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold shadow-lg transition hover:scale-105 border-2 ${isFollowing
										? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
										: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
										}`}
								>
									{isFollowing ? 'Huỷ Theo Dõi' : 'Theo Dõi'}
								</button>
							</div>

							{/* Description */}
							<div className="mt-6">
								<h3 className="text-lg font-bold text-white">Nội dung</h3>
								<p className="mt-2 text-sm leading-relaxed text-gray-300 line-clamp-4 hover:line-clamp-none transition-all">
									{manga.description || 'Chưa có mô tả cho truyện này.'}
								</p>
							</div>
						</div>
					</div>

					{/* Main Content Grid */}
					<div className="mt-12 grid gap-8 lg:grid-cols-3">
						{/* Left Column: Chapters */}
						<div className="lg:col-span-2">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-2xl font-bold text-gray-100">Danh Sách Chương</h2>
								<span className="text-sm text-gray-400">{manga.chapters?.length || 0} chương</span>
							</div>
							<div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
								<ChapterList chapters={manga.chapters || []} mangaSlug={manga.slug} />
							</div>

							<div className="mt-8">
								<h2 className="mb-6 text-2xl font-bold text-gray-100">Bình Luận</h2>
								<div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
									<CommentSection mangaSlug={manga.slug} />
								</div>
							</div>
						</div>

						{/* Right Column: Sidebar (Optional for now, e.g. Related Manga) */}
						<div className="hidden lg:block lg:col-span-1">
							{/* Placeholder for sidebar content */}
							<div className="sticky top-24 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
								<h3 className="mb-4 text-lg font-bold text-gray-100">Thông tin thêm</h3>
								<div className="space-y-4">
									<div className="flex justify-between border-b border-gray-800 pb-2">
										<span className="text-gray-400">Trạng thái</span>
										<span className="font-medium text-green-500">Đang tiến hành</span>
									</div>
									<div className="flex justify-between border-b border-gray-800 pb-2">
										<span className="text-gray-400">Cập nhật</span>
										<span className="font-medium text-gray-200">{new Date().toLocaleDateString('vi-VN')}</span>
									</div>
									<div className="flex justify-between pb-2">
										<span className="text-gray-400">Người đăng</span>
										<span className="font-medium text-purple-400">Admin</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</div>

			<Footer />
		</>
	);
}

export async function getStaticPaths() {
	// Tạo paths cơ bản từ file local để build, có ISR cho slug mới
	try {
		const dataPath = path.join(process.cwd(), 'data', 'manga.json');
		const raw = fs.readFileSync(dataPath, 'utf8');
		const list = JSON.parse(raw || '[]');
		const paths = list.map(m => ({ params: { manga: m.slug } }));
		return { paths, fallback: 'blocking' };
	} catch {
		return { paths: [], fallback: 'blocking' };
	}
}

export async function getStaticProps({ params }) {
	const slug = params?.manga;
	const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
	let manga = null;
	if (SUPABASE_URL && SERVICE_KEY) {
		try {
			const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
			const { data, error } = await supabase
				.from('mangas')
				.select('*, chapters(*), manga_genres(genres(name, slug))')
				.eq('slug', slug)
				.order('chapter_number', { foreignTable: 'chapters', ascending: true })
				.single();
			if (!error && data) manga = data;
		} catch { }
	}
	if (!manga) {
		try {
			const dataPath = path.join(process.cwd(), 'data', 'manga.json');
			const raw = fs.readFileSync(dataPath, 'utf8');
			const list = JSON.parse(raw || '[]');
			manga = list.find(x => x.slug === slug) || null;
		} catch { }
	}
	if (!manga) return { notFound: true };
	return { props: { manga }, revalidate: 60 };
}




