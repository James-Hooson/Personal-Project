import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

// Mock API functions - replace with your actual API client
const getMonsters = async () => {
  const response = await fetch('https://www.dnd5eapi.co/api/monsters')
  const data = await response.json()
  return data.results
}

const getMonsterDetails = async (index: string) => {
  const response = await fetch(`https://www.dnd5eapi.co/api/monsters/${index}`)
  return response.json()
}

const MonsterCompendium = () => {
  const quotes =[
    "“The world is indeed full of peril, and in it there are many dark places; but still there is much that is fair, and though in all lands love is now mingled with grief, it grows perhaps the greater.” ― J.R.R. Tolkien",
    "“Monsters are real, and ghosts are real too. They live inside us, and sometimes, they win.” ― Stephen King",
    "“Do not be afraid of the monsters, for they are but shadows of your own fears.” ― Unknown",
    "“The only thing we have to fear is fear itself.” ― Franklin D. Roosevelt",
    "“Courage is resistance to fear, mastery of fear, not absence of fear.” ― Mark Twain",
    "“In the midst of chaos, there is also opportunity.” ― Sun Tzu",
    "“Not all those who wander are lost.” ― J.R.R. Tolkien",
    "“The greatest glory in living lies not in never falling, but in rising every time we fall.” ― Nelson Mandela"
  ]
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
  
  const [current, setCurrent] = useState<number>(0)
  const [search, setSearch] = useState<string>('')
  const [minCR, setMinCR] = useState<string>('')
  const [maxCR, setMaxCR] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [showIndex, setShowIndex] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<HTMLDivElement>(null)

  const {data: monsters, isPending, isError} = useQuery({
    queryKey:['monsters'],
    queryFn: getMonsters
  })

  // Fetch all monster details for filtering
  const {data: allMonsterDetails} = useQuery({
    queryKey: ['all-monsters-details'],
    queryFn: async () => {
      if (!monsters) return []
      const details = await Promise.all(
        monsters.map(m => getMonsterDetails(m.index).catch(() => null))
      )
      return details.filter(Boolean)
    },
    enabled: !!monsters && monsters.length > 0
  })

  // Filter monsters by name and CR
  const filteredMonsters = allMonsterDetails?.filter(monster => {
    if (!monster) return false
    
    const nameMatch = monster.name.toLowerCase().includes(search.toLowerCase())
    
    const min = minCR === '' ? -Infinity : parseFloat(minCR)
    const max = maxCR === '' ? Infinity : parseFloat(maxCR)
    const monsterCR = monster.challenge_rating
    
    const crMatch = monsterCR >= min && monsterCR <= max
    
    return nameMatch && crMatch
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const selectMonster = (index: number) => {
    if (monsters && index >= 0 && index < monsters.length) {
      setCurrent(index)
      setSearch('')
    }
  }

  const selectMonsterByDetails = (monsterDetail: any) => {
    const index = monsters?.findIndex(m => m.index === monsterDetail.index) ?? 0
    selectMonster(index)
  }

  const RandomMonster = () => {
    if (filteredMonsters && filteredMonsters.length > 0) {
      const random = Math.floor(Math.random() * filteredMonsters.length)
      selectMonsterByDetails(filteredMonsters[random])
    } else if (monsters && monsters.length > 0) {
      const random = Math.floor(Math.random() * monsters.length)
      setCurrent(random)
    }
  }

  const clearFilters = () => {
    setMinCR('')
    setMaxCR('')
  }

  const selectedMonster = monsters?.[current]?.index
  
  const {data: monsterDetails, isLoading, isError: isDetailsError} = useQuery({
    queryKey: ['monster', selectedMonster],
    queryFn: () => getMonsterDetails(selectedMonster!),
    enabled: !!selectedMonster,
    retry: 2
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearch('')
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        const filterButton = document.querySelector('[data-filter-button]')
        if (filterButton && !filterButton.contains(event.target as Node)) {
          setShowFilters(false)
        }
      }
      if (indexRef.current && !indexRef.current.contains(event.target as Node)) {
        const indexButton = document.querySelector('[data-index-button]')
        if (indexButton && !indexButton.contains(event.target as Node)) {
          setShowIndex(false)
        }
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearch('')
        setShowFilters(false)
        setShowIndex(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  if (isPending) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black flex items-center justify-center">
      <div className="text-amber-400 text-2xl font-serif animate-pulse">⏳ Loading bestiary...</div>
    </div>
  )
  
  if (isError) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black flex items-center justify-center">
      <div className="text-red-400 text-2xl font-serif">⚠️ Error loading monsters</div>
    </div>
  )

  const activeFilters = minCR !== '' || maxCR !== ''

  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black">
      {/* Nav bar */}
      <nav className="bg-black/60 backdrop-blur-md border-b-2 border-red-600/50 p-4 sticky top-0 z-10 shadow-lg shadow-red-900/50">
        <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
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
          
          <div className="relative flex-1 max-w-md" ref={dropdownRef}>
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
              <div className="absolute top-full mt-2 w-full bg-black/95 border-2 border-amber-700/60 rounded max-h-60 overflow-y-auto shadow-2xl shadow-red-900/50 z-20">
                {filteredMonsters.map((monster) => (
                  <div 
                    key={monster.index}
                    onClick={() => selectMonsterByDetails(monster)}
                    className="p-3 hover:bg-red-900/40 cursor-pointer border-b border-amber-900/30 last:border-b-0 text-amber-100 transition-colors font-serif flex justify-between items-center"
                  >
                    <span>⚔️ {monster.name}</span>
                    <span className="text-xs text-amber-600">CR {monster.challenge_rating}</span>
                  </div>
                ))}
              </div>
            )}

            {/* No search results */}
            {search && filteredMonsters && filteredMonsters.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-black/95 border-2 border-amber-700/60 rounded p-4 text-amber-700 text-center font-serif italic z-20">
                No beasts match thy query...
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            data-filter-button
            className={`${activeFilters ? 'bg-amber-700' : 'bg-slate-700'} hover:bg-amber-600 text-amber-100 font-bold py-2 px-6 rounded border-2 border-amber-600/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/30 font-serif tracking-wide`}
          >
            🎯 Filter {activeFilters && `(${minCR || '0'}-${maxCR || '∞'})`}
          </button>

          <button
            onClick={() => setShowIndex(!showIndex)}
            data-index-button
            className="bg-slate-700 hover:bg-amber-600 text-amber-100 font-bold py-2 px-6 rounded border-2 border-amber-600/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/30 font-serif tracking-wide"
          >
            📚 Index
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div ref={filterRef} className="max-w-6xl mx-auto mt-4 bg-black/80 border-2 border-amber-700/60 rounded p-4">
            <h3 className="text-amber-400 font-serif font-bold mb-3">Challenge Rating Filter</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-amber-100 font-serif text-sm">Min CR:</label>
                <input
                  type="number"
                  value={minCR}
                  onChange={(e) => setMinCR(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="30"
                  step="0.125"
                  className="w-24 bg-black/70 border-2 border-amber-700/60 rounded px-3 py-1 text-amber-100 focus:outline-none focus:border-amber-500 font-serif"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-amber-100 font-serif text-sm">Max CR:</label>
                <input
                  type="number"
                  value={maxCR}
                  onChange={(e) => setMaxCR(e.target.value)}
                  placeholder="30"
                  min="0"
                  max="30"
                  step="0.125"
                  className="w-24 bg-black/70 border-2 border-amber-700/60 rounded px-3 py-1 text-amber-100 focus:outline-none focus:border-amber-500 font-serif"
                />
              </div>
              <button
                onClick={clearFilters}
                className="bg-red-700/50 hover:bg-red-700 text-amber-100 font-serif text-sm py-1 px-4 rounded border border-amber-700/50 transition-all"
              >
                Clear
              </button>
              <div className="text-amber-600 font-serif text-sm ml-auto">
                {filteredMonsters?.length || 0} creature{filteredMonsters?.length !== 1 ? 's' : ''} found
              </div>
            </div>
            <div className="mt-3 text-amber-700 font-serif text-xs italic">
              💡 Common CRs: 0.125 (1/8), 0.25 (1/4), 0.5 (1/2), 1-30
            </div>

            {/* Filtered Creatures List */}
            {(activeFilters || search) && filteredMonsters && filteredMonsters.length > 0 && (
              <div className="mt-4 border-t border-amber-700/60 pt-4">
                <h4 className="text-amber-400 font-serif font-bold mb-2 text-sm">Filtered Creatures:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {filteredMonsters.map((monster) => (
                    <div
                      key={monster.index}
                      onClick={() => selectMonsterByDetails(monster)}
                      className="bg-black/60 border border-amber-700/40 rounded p-2 hover:bg-red-900/40 cursor-pointer transition-colors"
                    >
                      <div className="text-amber-100 font-serif text-sm truncate">
                        ⚔️ {monster.name}
                      </div>
                      <div className="text-amber-600 font-serif text-xs">
                        CR {monster.challenge_rating}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-5xl font-bold text-center text-amber-400 mb-2 drop-shadow-2xl font-serif tracking-wider">
          📜 MONSTER COMPENDIUM 📜
        </h1>
        <p className="text-center text-amber-700 font-serif italic mb-8">
          A Gentleman and a Scholar's Guide to the Beasts of the Realm
        </p>

        {/* Monster Index */}
        {showIndex && allMonsterDetails && (
          <div ref={indexRef} className="mb-8 bg-gradient-to-br from-black/80 to-black/60 border-2 border-amber-700/60 rounded-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-400 font-serif">Complete Monster Index</h2>
              <button
                onClick={() => setShowIndex(false)}
                className="text-amber-600 hover:text-amber-400 font-serif text-sm"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="mb-4 text-amber-600 font-serif text-sm">
              {allMonsterDetails.length} creatures catalogued
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {allMonsterDetails
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((monster) => (
                  <div
                    key={monster.index}
                    onClick={() => {
                      selectMonsterByDetails(monster)
                      setShowIndex(false)
                    }}
                    className="bg-black/60 border border-amber-700/40 rounded p-3 hover:bg-red-900/40 cursor-pointer transition-all hover:border-amber-500 hover:shadow-lg hover:shadow-amber-900/20"
                  >
                    <div className="text-amber-100 font-serif text-sm font-bold mb-1">
                      ⚔️ {monster.name}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-amber-600 font-serif">
                        CR {monster.challenge_rating}
                      </span>
                      <span className="text-amber-700 font-serif italic">
                        {monster.size}
                      </span>
                    </div>
                    <div className="text-amber-700 font-serif text-xs mt-1 truncate">
                      {monster.type}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

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
              <div className="grid grid-cols-3 gap-4 font-serif">
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
                <div>
                  <span className="text-red-900 font-bold">Speed:</span>
                  <span className="text-red-950 text-sm ml-2">
                    {Object.entries(monsterDetails.speed).map(([type, value]) => `${type} ${value}`).join(', ')}
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

            {/* Legendary Actions */}
            {monsterDetails.legendary_actions && monsterDetails.legendary_actions.length > 0 && (
              <div className="mb-6 border-t-2 border-amber-800 pt-4">
                <h3 className="text-xl font-bold text-red-900 mb-3 font-serif">👑 Legendary Actions</h3>
                <div className="space-y-3">
                  {monsterDetails.legendary_actions.map((action, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-700 rounded p-3">
                      <p className="font-bold text-red-900 font-serif italic mb-1">✨ {action.name}</p>
                      <p className="text-amber-950 text-sm font-serif leading-relaxed">{action.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lore footer */}
            <div className="mt-6 text-center text-amber-800 text-xs font-serif italic border-t border-amber-700 pt-4">
              {randomQuote}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default MonsterCompendium