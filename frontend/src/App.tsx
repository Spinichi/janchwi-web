import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './shared/components/Header';
import { Home, Onboarding, Login, Signup } from './pages';

const AppContent = () => {
  const location = useLocation();
  const hideHeader = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen">
      {!hideHeader && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
