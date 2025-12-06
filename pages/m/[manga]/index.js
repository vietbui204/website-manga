import Link from 'next/link';
import Image from 'next/image';
import Container from '../../../src/components/UI/Container';
import Header from '../../../src/components/UI/Header';
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
	const cover = manga.coverUrl || '';
	const avatar = manga.avatarUrl || manga.coverUrl || '';
	const totalViews = Number(manga.views || manga.viewCount || 0);
	const totalLikes = Number(manga.likes || manga.likeCount || 0);
	const totalComments = Number(manga.comments || manga.commentsCount || 0);

	return (
		<>
			<Header title="FPTxManga" />
			<Container>
				<article className="manga-detail py-6">
					<div className="detail-hero grid gap-6 md:grid-cols-3">
						{cover && (
							<div className="detail-cover card md:col-span-1">
								<Image src={cover} alt={`${manga.title} cover`} width={720} height={1080} sizes="(max-width: 768px) 100vw, 360px" className="h-auto w-full object-cover" />
							</div>
						)}
						<div className="detail-meta md:col-span-2">
							<div className="detail-title mb-3 flex items-center gap-3">
								{avatar && (
									<Image src={avatar} alt={`${manga.title} avatar`} width={48} height={48} sizes="48px" className="rounded-full ring-2 ring-white shadow" />
								)}
								<h1 className="text-2xl font-semibold">{manga.title}</h1>
							</div>
							{manga.author && <p className="author text-sm text-gray-600">Tác giả: {manga.author}</p>}
							<div className="detail-stats mt-3 flex flex-wrap gap-3 text-sm text-gray-700">

								<span>🔔 {followCount} theo dõi</span>
								<span>📚 {manga.chapters?.length || 0} chương</span>
							</div>
							{/* Genres List */}
							<div className="detail-genres mt-3 flex flex-wrap gap-2">
								{manga.manga_genres?.map(mg => mg.genres).filter(Boolean).map((g, i) => (
									<span key={i} className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-default">
										{g.name}
									</span>
								))}
							</div>
							<div className="detail-actions mt-4 flex flex-wrap gap-3">
								<Link href={`/m/${manga.slug}/${firstChapter}`} className="btn primary">Xem chương đầu</Link>
								<Link href={`/m/${manga.slug}/${latestChapter}`} className="btn">Xem tiếp</Link>
								<button type="button" className={`btn ${isFollowing ? 'bg-red-600 text-white hover:bg-red-700' : ''}`} onClick={handleFollow}>
									{isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
								</button>
							</div>
							{manga.description && <p className="description mt-4 text-gray-700">{manga.description}</p>}
						</div>
					</div>
					<div className="detail-chapters mt-8">
						<h2 className="mb-3 text-xl font-semibold">Danh sách chương</h2>
						<ChapterList chapters={manga.chapters || []} mangaSlug={manga.slug} />
					</div>
					<CommentSection mangaSlug={manga.slug} />
				</article>
			</Container>
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




