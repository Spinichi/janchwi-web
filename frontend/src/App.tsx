import { Router, useRouter } from './router';
import { Header } from './shared/components/Header';
import { Home, Onboarding } from './pages';

const AppContent = () => {
  const { currentRoute } = useRouter();

  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return <Onboarding />;
      case '/home':
        return <Home />;
      default:
        return <Onboarding />;
    }
  };

  return (
    <div className="min-h-screen">
      {currentRoute !== '/' && <Header />}
      <main>{renderPage()}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
