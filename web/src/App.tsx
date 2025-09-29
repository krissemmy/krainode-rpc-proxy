import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import NavBar from "./components/NavBar";
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Playground } from './pages/Playground'
import Team from './pages/Team'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <NavBar />
        {/* offset for sticky header (h-14) */}
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playground" element={
              <ProtectedRoute>
                <Playground />
              </ProtectedRoute>
            } />
            <Route path="/team" element={<Team />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
