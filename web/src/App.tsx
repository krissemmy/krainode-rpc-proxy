import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import NavBar from "./components/NavBar";
import { Home } from './pages/Home'
import { Playground } from './pages/Playground'
import About from './pages/About'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <NavBar />
        {/* offset for sticky header (h-14) */}
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
