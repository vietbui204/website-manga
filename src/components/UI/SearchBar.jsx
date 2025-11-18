import { useState } from 'react';

export default function SearchBar(){
  const [q, setQ] = useState('');
  return (
    <form className="search-bar" onSubmit={(e)=>e.preventDefault()}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm truyện..." />
    </form>
  );
}
