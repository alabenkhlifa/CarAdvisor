import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import CarDetail from './pages/CarDetail';
import Compare from './pages/Compare';
import NotFound from './pages/NotFound';
import './i18n/config';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/home"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/recommendations"
            element={
              <Layout>
                <Recommendations />
              </Layout>
            }
          />
          <Route
            path="/compare"
            element={
              <Layout>
                <Compare />
              </Layout>
            }
          />
          <Route
            path="/car/:id"
            element={
              <Layout>
                <CarDetail />
              </Layout>
            }
          />
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
