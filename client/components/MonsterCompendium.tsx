import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMonsters, getMonsterDetails } from '../apiClient'
import { Link } from 'react-router-dom'

const MonsterCompendium = () => {
  
   // constants
  const [current, setCurrent] = useState<number>(0)
  const [search, setSearch] = useState<string>('')
  const {data: monsters, isPending, isError} = useQuery({
    queryKey:['monsters'],
    queryFn: getMonsters
  })
  const filteredMonsters = monsters?.filter(monster =>{
    return monster.name.toLowerCase().includes(search.toLowerCase())
  })
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearch(e.target.value)
}
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectMonster = (index: number)=> {
  setCurrent(index)
  setSearch('')
}
  const RandomMonster = () => {
    if (monsters && monsters.length > 0){
      const random = Math.floor(Math.random() * monsters.length)
      setCurrent(random)
    }
  }
  const selectedMonster = monsters?.[current]?.index
  
  const {data: monsterDetails, isLoading, isError: isDetailsError} = useQuery ({
    queryKey: ['monster', selectedMonster],
    queryFn: () => getMonsterDetails(selectedMonster!),
    enabled: !!selectedMonster,
    retry: 2
  })
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setSearch('')
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
  if (isPending) return <div>Loading....</div>
  if (isError) return <div>Error...</div>
  console.log(monsterDetails)
  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black">
      {/* Nav bar */}
      <nav className="bg-black/60 backdrop-blur-md border-b-2 border-red-600/50 p-4 sticky top-0 z-10 shadow-lg shadow-red-900/50">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link 
            to="/"
            className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded border-2 border-amber-600/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/30 font-serif tracking-wide"
          >
            🏕️ Home
          </Link>
          <button 
            onClick={RandomMonster} 
            className="bg-red-700 hover:bg-red-600 text-amber-100 font-bold py-2 px-6 rounded border-2 border-amber-600/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/30 font-serif tracking-wide"
          >
            🎲 Generate
          </button>
          
          <div className="relative flex-1 max-w-md">
            <input 
              type="text"
              placeholder="🔍 Scry for creatures..."
              value={search}
              onChange={handleSearch}
              aria-label="Search for monsters"
              className="w-full bg-black/70 border-2 border-amber-700/60 rounded px-4 py-2 text-amber-100 placeholder-amber-700/60 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-600/40 font-serif"
            />
            
            {/* Search Results Dropdown */}
            {search && filteredMonsters && filteredMonsters.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-black/95 border-2 border-amber-700/60 rounded max-h-60 overflow-y-auto shadow-2xl shadow-red-900/50">
                {filteredMonsters.map((monster) => (
                  <div 
                    key={monster.index}
                    onClick={() => selectMonster(monsters?.findIndex(m => m.index === monster.index) ?? 0)}
                    className="p-3 hover:bg-red-900/40 cursor-pointer border-b border-amber-900/30 last:border-b-0 text-amber-100 transition-colors font-serif"
                  >
                    ⚔️ {monster.name}
                  </div>
                ))}
              </div>
            )}

            {/* No search results */}
            {search && filteredMonsters && filteredMonsters.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-black/95 border-2 border-amber-700/60 rounded p-4 text-amber-700 text-center font-serif italic">
                No beasts match thy query...
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-5xl font-bold text-center text-amber-400 mb-2 drop-shadow-2xl font-serif tracking-wider">
          📜 MONSTER COMPENDIUM 📜
        </h1>
        <p className="text-center text-amber-700 font-serif italic mb-8">
          A Gentleman and a Scholar's Guide to the Beasts of the Realm
        </p>

        {isLoading && (
          <div className="text-center text-amber-400 text-xl py-12 font-serif animate-pulse">
            ⏳ Consulting ancient tomes...
          </div>
        )}
        
        {isDetailsError && (
          <div className="bg-red-950/50 border-2 border-red-700 rounded-lg p-4 text-red-400 text-center font-serif">
            ⚠️ The arcane connection has been severed!
          </div>
        )}

        {monsterDetails && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-4 border-amber-800 rounded-lg p-8 shadow-2xl relative">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 text-amber-800 text-2xl">╔</div>
            <div className="absolute top-2 right-2 text-amber-800 text-2xl">╗</div>
            <div className="absolute bottom-2 left-2 text-amber-800 text-2xl">╚</div>
            <div className="absolute bottom-2 right-2 text-amber-800 text-2xl">╝</div>

            {/* Monster Header */}
            <div className="border-b-2 border-amber-800 pb-6 mb-6">
              <h2 className="text-4xl font-bold text-red-900 mb-2 font-serif text-center tracking-wide">
                {monsterDetails.name.toUpperCase()}
              </h2>
              <p className="text-center text-amber-900 italic font-serif mb-4">
                {monsterDetails.size} {monsterDetails.type}, {monsterDetails.alignment}
              </p>
              {/* Monster Image */}
            {monsterDetails.image && (
              <div className="mt-6 flex justify-center border-t-2 border-amber-800 pt-6">
                <img 
                  src={`https://www.dnd5eapi.co${monsterDetails.image}`} 
                  alt={monsterDetails.name}
                  className="rounded border-4 border-amber-800 shadow-2xl max-w-md w-full sepia-[0.2]"
                />
              </div>
            )}
              
              <div className="border-2 border-amber-700 bg-amber-50 rounded p-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-amber-950 font-serif text-sm">
                  <div>
                    <span className="font-bold">Challenge Rating:</span> {monsterDetails.challenge_rating} ⚔️
                  </div>
                  <div>
                    <span className="font-bold">Experience Points:</span> {monsterDetails.xp?.toLocaleString() || 'Unknown'} XP
                  </div>
                </div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="mb-6 bg-red-50 border-2 border-red-800 rounded p-4">
              <div className="grid grid-cols-2 gap-4 font-serif">
                <div>
                  <span className="text-red-900 font-bold">Armor Class:</span>
                  <span className="text-red-950 text-xl ml-2 font-bold">{monsterDetails.armor_class[0]?.value}</span>
                  <span className="text-red-800 text-sm ml-1">
                    ({monsterDetails.armor_class[0]?.type || 'natural armor'})
                  </span>
                </div>
                <div>
                  <span className="text-red-900 font-bold">Hit Points:</span>
                  <span className="text-red-950 text-xl ml-2 font-bold">{monsterDetails.hit_points}</span>
                  <span className="text-red-800 text-sm ml-1">
                    ({monsterDetails.hit_dice})
                  </span>
                </div>
                
              </div>
            </div>

            {/* Ability Scores*/}
            <div className="mb-6 border-t-2 border-b-2 border-amber-800 py-4">
              <div className="grid grid-cols-6 gap-2">
                {[
                  { label: 'STR', value: monsterDetails.strength },
                  { label: 'DEX', value: monsterDetails.dexterity },
                  { label: 'CON', value: monsterDetails.constitution },
                  { label: 'INT', value: monsterDetails.intelligence },
                  { label: 'WIS', value: monsterDetails.wisdom },
                  { label: 'CHA', value: monsterDetails.charisma }
                ].map(stat => {
                  const modifier = Math.floor((stat.value - 10) / 2)
                  const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`
                  return (
                    <div key={stat.label} className="bg-amber-100 border-2 border-amber-900 rounded text-center p-2">
                      <div className="text-amber-900 font-bold text-xs font-serif">{stat.label}</div>
                      <div className="text-amber-950 text-2xl font-bold">{stat.value}</div>
                      <div className="text-amber-800 text-sm">({modifierStr})</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Saving Throws & Skills */}
            {monsterDetails.proficiencies && monsterDetails.proficiencies.length > 0 && (
              <div className="mb-4 font-serif text-sm text-amber-950">
                <span className="font-bold">Proficiencies:</span> {monsterDetails.proficiencies.map(p => p.proficiency.name).join(', ')}
              </div>
            )}

            {/* Damage Resistances/Immunities */}
            {(monsterDetails.damage_resistances?.length > 0 || monsterDetails.damage_immunities?.length > 0) && (
              <div className="mb-4 font-serif text-sm">
                {monsterDetails.damage_resistances?.length > 0 && (
                  <div className="text-amber-950">
                    <span className="font-bold">Damage Resistances:</span> {monsterDetails.damage_resistances.join(', ')}
                  </div>
                )}
                {monsterDetails.damage_immunities?.length > 0 && (
                  <div className="text-amber-950">
                    <span className="font-bold">Damage Immunities:</span> {monsterDetails.damage_immunities.join(', ')}
                  </div>
                )}
              </div>
            )}
            {/* Languages */}
            <div className="mb-6 font-serif text-sm text-amber-950">
              <span className="font-bold">Languages:</span> {monsterDetails.languages || '—'}
            </div>

            {/* Special Abilities */}
            {monsterDetails.special_abilities && monsterDetails.special_abilities.length > 0 && (
              <div className="mb-6 border-t-2 border-amber-800 pt-4">
                <h3 className="text-xl font-bold text-red-900 mb-3 font-serif">✨ Special Abilities</h3>
                <div className="space-y-3">
                  {monsterDetails.special_abilities.map((ability, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-700 rounded p-3">
                      <p className="font-bold text-red-900 font-serif italic mb-1">⚡ {ability.name}</p>
                      <p className="text-amber-950 text-sm font-serif leading-relaxed">{ability.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {monsterDetails.actions && monsterDetails.actions.length > 0 && (
              <div className="mb-6 border-t-2 border-amber-800 pt-4">
                <h3 className="text-xl font-bold text-red-900 mb-3 font-serif">⚔️ Actions</h3>
                <div className="space-y-3">
                  {monsterDetails.actions.map((action, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-700 rounded p-3">
                      <p className="font-bold text-red-900 font-serif italic mb-1">🗡️ {action.name}</p>
                      <p className="text-amber-950 text-sm font-serif leading-relaxed">{action.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Lore footer */}
            <div className="mt-6 text-center text-amber-800 text-xs font-serif italic border-t border-amber-700 pt-4">
              "Knowledge of one's foe is the first step to victory" — Sun Tzu or something
            </div>
          </div>
        )}
      </main>
    </div>
  )}


export default MonsterCompendium