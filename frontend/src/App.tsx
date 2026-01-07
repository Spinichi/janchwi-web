import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './shared/components/Header';
import { ScrollToTop } from './shared/components/ScrollToTop';
import { Home, Onboarding, Login, Signup, EmailVerification } from './pages';

const AppContent = () => {
  const location = useLocation();
  const hideHeader =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/email-verification';

  return (
    <>
      <ScrollToTop />
      {!hideHeader && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/email-verification" element={<EmailVerification />} />
        </Routes>
      </main>
    </>
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
