import MangaCard from './MangaCard';

export default function MangaList({ mangas = [], showRank = false }) {
  return (
    <section className="manga-list grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {mangas.map((m, i) => <MangaCard key={m.slug} manga={m} rank={showRank ? i + 1 : null} />)}
    </section>
  );
}
