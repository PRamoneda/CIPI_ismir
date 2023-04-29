import Head from 'next/head'
import { useEffect, useState } from 'react'
import { API_HOST } from '../config'
import { PieceGraph } from '../components/GraphExplorer'
import { useRouter } from 'next/router'

const MapModeToggle = ({mapMode, setMapMode}) => {
  return <label className="relative inline-flex items-center mr-5 cursor-pointer">
    <input type="checkbox" value="" className="sr-only peer" checked={mapMode} onChange={() => setMapMode(x => !x)} />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-red-300 dark:peer-focus:ring-red-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
    <span className="ml-3 text-sm font-medium text-gray-600">Map mode</span>
  </label>;
}

const ListExplorer = () => {
  return <div>
    Here goes your code Andrea and Cristina!
    </div>
}

const SelectedPieceCard = ({ selectedPiece }) => {
  const router = useRouter()
  const onGoToPiece = () => {
    if (selectedPiece === null) return;
    router.push(`/pieces/${selectedPiece?.id}`)
  };
  return <div onClick={onGoToPiece} className={`border p-4 rounded-md flex ${selectedPiece === null? '': 'cursor-pointer hover:bg-zinc-50'}`}>
      <div className={`grow ${selectedPiece === null? 'text-gray-400': ''}`}>
          <div className="flex mb-1">
              <div className={`rounded-full mr-2 mt-1.5 w-4 h-4 ${selectedPiece === null? 'bg-red-300': 'bg-red-600'}`}/>
              <div className="flex flex-col">
                  <span className="font-medium text-lg ">{selectedPiece?.title ?? 'Select a piece'}</span>
                  <span className="text-md">{selectedPiece?.author ?? '...'}</span>
              </div>
          </div>
      </div>
      <div className="">
          <button className={`grow-0 rounded-md text-white font-medium p-2  ${selectedPiece === null? 'bg-gray-300 cursor-default': 'cursor-pointer  bg-black hover:bg-gray-800 '}`}>
              Learn more
          </button>
      </div>
  </div>
}

export const GraphExplorer = ({ pieces }) => {
  const [selectedPiece, setSelectedPiece] = useState(null)
  const getPieceColor = ({piece, isHovered, isSelected }) => {
    if (isSelected) return '#dc2626';
    if (isHovered) return '#444444';
    return '#666666';
};
  return  <div className="flex flex-1 flex-col p-4 max-h-full overflow-hidden">
              <SelectedPieceCard selectedPiece={selectedPiece} />
              <PieceGraph 
                pieces={pieces} 
                onSelectPiece={setSelectedPiece} 
                selectedPiece={selectedPiece}
                getPieceColor={getPieceColor}
                isPieceSelectable={() => true}
              />
          </div>
}


export default function Home() {
  const [pieces, setPieces] = useState({});
  useEffect(() => {
    fetch(`${API_HOST}/pieces`).then(r => r.json()).then(r => setPieces(r['array']))
  }, [])
  const [mapMode, setMapMode] = useState(false)
  return (
    <>
      <Head>
        <title>Can I Play It?</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main className="min-h-screen flex flex-col w-screen h-screen overflow-hidden p-2">
        <MapModeToggle mapMode={mapMode} setMapMode={setMapMode} />
        { !mapMode && <ListExplorer />}
        { mapMode && <div className="flex justify-center content-center flex-1 bg-white overflow-hidden">
          <GraphExplorer pieces={pieces} /> 
          </div>}
      </main>
    </>
  )
}
