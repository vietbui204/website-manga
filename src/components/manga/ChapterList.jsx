import Link from 'next/link';


export default function ChapterList({ chapters = [], mangaSlug }){
  return (
    <ul className="chapter-list divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-white">
			{chapters.map(c => (
				<li key={c.slug} className="hover:bg-gray-50">
					<Link href={`/m/${mangaSlug || ''}/${c.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
						{c.title || c.slug}
					</Link>
				</li>
			))}
    </ul>
  );
}
