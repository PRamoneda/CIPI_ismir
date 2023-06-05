import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { API_HOST } from '@/config'
import { PieceGraph, grayscaleHex, mapRange } from '../components/GraphExplorer'
import { useRouter } from 'next/router'
import { AuthContext } from '@/contexts/AuthContext'
import { PieceCard } from '@/components/PieceCard'

const MapModeToggle = ({ mapMode, setMapMode }) => {
  return <div><label className="relative inline-flex items-center mr-5 cursor-pointer">
    <input type="checkbox" value="" className="sr-only peer" checked={mapMode} onChange={() => setMapMode(x => !x)} />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-red-300 dark:peer-focus:ring-red-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
    <span className="ml-3 text-sm font-medium text-gray-600">Map mode</span>
  </label></div>;
}

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-lg">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search a piece or author"
        className="w-full px-4 py-2 border-solid border-2 border-gray-200 rounded-md focus:outline-none"
      />
    </form>
  );
};

const SearchFilter = ({ setFilters }) => {
  const [nationality, setNationality] = useState("");
  const [period, setPeriod] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const handleNationalityChange = (event) => {
    setNationality(event.target.value);
  };
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters({ nationality, period, difficulty });
  };

  return (
    <form className="flex flex-wrap items-center justify-center my-4" onSubmit={handleSubmit}>
      <select
        value={nationality}
        onChange={handleNationalityChange}
        className="cursor-pointer px-4 py-2 text-gray-900 bg-gray-100 rounded-md focus:outline-none focus:ring focus:ring-blue-300 mr-2 mb-2 sm:mb-0 text-sm"
      >
        <option value="">Select Nationality</option>
      </select>
      <select
        value={period}
        onChange={handlePeriodChange}
        className="cursor-pointer px-4 py-2 text-gray-900 bg-gray-100 rounded-md focus:outline-none focus:ring focus:ring-blue-300 mr-2 mb-2 sm:mb-0 text-sm" >
        <option value="">Select Period</option>
        <option value="romantic">Romantic</option>
        <option value="classical">Classical</option>
        <option value="early-20th">Early-20th</option>
      </select>
      <select
        value={difficulty}
        onChange={handleDifficultyChange}
        className="cursor-pointer px-4 py-2 text-gray-900 bg-gray-100 rounded-md focus:outline-none focus:ring focus:ring-blue-300 mr-2 mb-2 sm:mb-0 text-sm"
        >
        <option value="">Select Difficulty</option>
        <option value="Easy">Easy (1-3)</option>
        <option value="Medium">Medium (4-6)</option>
        <option value="Hard">Hard (7-9)</option>
      </select>
    </form>
  );
}

const getRange = (start, stop) => stop > start? Array.from(
  new Array((stop - start) + 1),
  (_, i) => i + start
): [];

const ListExplorer = ({ pieces, filter }) => {
  const router = useRouter()
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handlePieceSelection = (piece) => {
    setSelectedPiece(piece);
    router.push(`/pieces/${piece.id}`);
  };

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  
   // Apply the period filter
   const filteredPieces = filter?.period
   ? pieces.filter((piece) => piece.period === filter.period)
   : pieces;

 const displayedPieces = filteredPieces.slice(firstIndex, lastIndex);
 const totalPages = Math.ceil(filteredPieces.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return <div className={'items-center max-w-5/6 flex flex-1 flex-col overflow-y-auto'}>
    <div className="flex-1 w-full max-w-4xl">
      {displayedPieces.map((piece) => (
        <div key={piece.id} className="min-w-lg">
          <div className={`my-5 border p-4 rounded-md hover:bg-gray-100 cursor-pointer ${selectedPiece === null ? '' : ''}`} onClick={() => handlePieceSelection(piece)} >
            <div className={'ml-2 text-sm font-medium text-gray-600'}>{piece.author} - {piece.period.charAt(0).toUpperCase() + piece.period.slice(1)}</div>
            <div className={'ml-2 text-sm font-bold'}>{piece.title}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-center mt-4">
      {[0, ...(totalPages? getRange(Math.max(2, currentPage-3)-1, Math.min(currentPage+2, totalPages-2)): []), totalPages-1].map(index => (
        <button key={index} className={`mx-1 px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => goToPage(index + 1)}>
          {index + 1}
        </button>
      ))}
    </div>
  </div>
}



export const GraphExplorer = ({ pieces }) => {
  const [selectedPiece, setSelectedPiece] = useState(null)
  const getPieceColor = ({ piece, isHovered, isSelected }) => {
    const mappedDifficulty = 1 - mapRange((piece.difficulty.x1 + piece.difficulty.x2) / 2, -5, 5, 0.2, 0.7);
    if (isSelected) return '#dc2626';
    if (isHovered) return grayscaleHex(mappedDifficulty - 0.2);
    return grayscaleHex(mappedDifficulty);
  };
  return <div className="flex flex-1 flex-col p-4 max-h-full overflow-hidden">
    <PieceCard selectedPiece={selectedPiece} />
    <PieceGraph
      pieces={pieces}
      onSelectPiece={setSelectedPiece}
      selectedPiece={selectedPiece}
      getPieceColor={getPieceColor}
      isPieceSelectable={() => true}
    />
  </div>
}

const getPieces = async () => {
  const response = await fetch(`${API_HOST}/api/pieces`);
  const body = await response.json();
  return body;
}

export default function Home() {
  const [pieces, setPieces] = useState([]);
  const [mapMode, setMapMode] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const [searchFilter, setSearchFilter] = useState({
    author: '',
    name: '',
    epoch: '',
    difficulty: ''
  });


  const { requireLogin, credential } = useContext(AuthContext);

  useEffect(() => {
    getPieces(credential).then(r => setPieces(r['array']))
  }, []);  

  const handleSearch = (searchTerm) => {
    const filteredPieces = pieces.filter((piece) => {
      const { title, period, author } = piece;
      const searchLower = searchTerm.toLowerCase();
      // Check if the search term is present in the title, period, or author
      return (
        title.toLowerCase().includes(searchLower) ||
        period.toLowerCase().includes(searchLower) ||
        author.toLowerCase().includes(searchLower)
      );
    });
  
    setSearchResult(filteredPieces);
  };

  const handleFilterChange = (event) => {
    setSearchFilter({ ...searchFilter, [name]: value });
  };

  const filteredPieces = searchFilter?.period
    ? searchResult.filter((piece) => piece.period === searchFilter.period)
    : pieces;

  // example of how to use the login
  useEffect(() => {
    let timer = window.setTimeout(() => {
      if (mapMode === true) requireLogin({ allowSkip: true, skipTimeoutSeconds: 60 })
    }, 1000);
  
    return () => window.clearTimeout(timer);
  }, [mapMode])

  return (
    <>
      <Head>
        <title>Can I Play It?</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />

      </Head>
      <main className="min-h-screen flex flex-col w-screen h-screen overflow-hidden p-4 overflow-hidden relative">
        <div className="flex pb-4">
          <MapModeToggle mapMode={mapMode} setMapMode={setMapMode} />
          <div className="flex-1" />
          <Link href="upload"><button className="bg-black text-white rounded hover:bg-gray-800 hover:bg-gray-800 text-white py-2 px-4 text-sm">Upload PDF</button></Link>
        </div>
        <div className="flex justify-center ">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="flex justify-center">
          <SearchFilter filter={searchFilter} onFilterChange={handleFilterChange} />
        </div>

        {mapMode && (
          <div className="flex justify-center content-center flex-1 bg-white overflow-hidden">
            <GraphExplorer pieces={pieces} />
          </div>
        )}
        {!mapMode && <div className="flex justify-center flex-1 overflow-hidden">
          <ListExplorer pieces={searchResult?.length > 0 ? searchResult : filteredPieces} filter={searchFilter} />
        </div>}
      </main>
    </>
  );
}
