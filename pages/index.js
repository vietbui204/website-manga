import Navbar from '../src/components/ui/Navbar';
import Header from '../src/components/UI/Header';
import Container from '../src/components/UI/Container';
// Đây là lỗi do đường dẫn import sai. Đúng phải là 'ui', nhưng ban đầu là 'UI' (phân biệt hoa thường trên một số hệ điều hành).
// Ngoài ra, trong JSX có comment dạng `// End of Selection` gây lỗi cú pháp.
// Nên sửa như sau:

import TopMangaSection from '../src/components/sections/TopMangaSection';
import LatestUpdatesSection from '../src/components/sections/LatestUpdatesSection';
import Footer from '../src/components/ui/Footer';

export default function Home({ mangas }) {
	return (
		<>
		{/* Phần comment // End of Selection không hợp lệ trong JSX, nên dùng comment dạng này */}
				<Navbar />
				<Header title="MangaSite" />
				<Container>
					<TopMangaSection mangas={mangas} />
					<LatestUpdatesSection mangas={mangas} perPage={12} />
				</Container>
				<Footer />
			</>
	);
}

export async function getStaticProps(){
	// For now, read from local data file as seed
	const fs = require('fs');
	const path = require('path');
	const dataPath = path.join(process.cwd(),'data','manga.json');
	const raw = fs.readFileSync(dataPath,'utf8');
	const mangas = JSON.parse(raw);
	return { props: { mangas }, revalidate: 10 };
}
