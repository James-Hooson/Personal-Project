import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MonsterCompendium from './MonsterCompendium'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MonsterCompendium />} />
        <Route path="/monsters" element={<MonsterCompendium />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App