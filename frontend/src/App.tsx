import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './i18n/config';

const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const Compare = lazy(() => import('./pages/Compare'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Imprint = lazy(() => import('./pages/Imprint'));
const Terms = lazy(() => import('./pages/Terms'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <LoadingSpinner />
  </div>
);

const wrap = (Node: React.ReactNode) => <Layout>{Node}</Layout>;

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={wrap(<Home />)} />
            <Route path="/recommendations" element={wrap(<Recommendations />)} />
            <Route path="/compare" element={wrap(<Compare />)} />
            <Route path="/car/:id" element={wrap(<CarDetail />)} />
            <Route path="/privacy" element={wrap(<Privacy />)} />
            <Route path="/imprint" element={wrap(<Imprint />)} />
            <Route path="/terms" element={wrap(<Terms />)} />
            <Route path="*" element={wrap(<NotFound />)} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
