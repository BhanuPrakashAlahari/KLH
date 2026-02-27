import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ArthikScroll from "./components/ArthikScroll";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./context/LanguageContext";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <main className="min-h-screen bg-[#050505] selection:bg-white selection:text-black">
          <Routes>
            <Route path="/" element={<ArthikScroll />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth/google/callback" element={<Auth />} />
          </Routes>
        </main>
      </Router>
    </LanguageProvider>
  );
}

export default App;
