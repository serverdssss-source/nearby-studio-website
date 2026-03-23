import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import './App.css';
import ScrollToTopButton from './components/ScrollToTop';

// Critical components - load immediately (above fold)
import Navbar from './components/Navbar';

// Lazy load below-the-fold components
const Hero_1 = lazy(() => import('./components/Hero_1'));
const Hero = lazy(() => import('./components/Hero'));
const StudioSnapshot = lazy(() => import('./components/StudioSnapshot'));
const Services = lazy(() => import('./components/Services'));
const OurSpaces = lazy(() => import('./components/OurSpaces'));
const WhyStudio = lazy(() => import('./components/WhyStudio'));
const ImageGallery = lazy(() => import('./components/ImageGallery'));
const CompanyInfo = lazy(() => import('./components/CompanyInfo'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const Podcast = lazy(() => import("./components/Podcast"));
const Studios = lazy(() => import("./components/Studios"));
const FashionShoot = lazy(() => import("./components/FashionShoot"));
const GreenScreen = lazy(() => import("./components/GreenScreen"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const BookingPage = lazy(() => import("./pages/BookingPage.tsx"));
const AdminDashboard = lazy(() => import("./components/booking/AdminDashboard"));

// Optimized loading fallback
const LoadingFallback = () => (
  <div style={{
    minHeight: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent'
  }}>
    <div style={{
      color: '#00C2A8',
      fontSize: '1.2rem',
      fontWeight: '600'
    }}>Loading...</div>
  </div>
);

function HomePage() {
  return (
    <main className="min-h-screen bg-#0f0f12">
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <Hero_1 />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <StudioSnapshot />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Services />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <OurSpaces />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <WhyStudio />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <ImageGallery />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <CompanyInfo />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <ContactSection />
        <ContactForm />
      </Suspense>
    </main>
  );
}

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTopOnRouteChange />
      <ScrollToTopButton />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/contactus" element={<ContactSection />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/studios" element={<Studios />} />
          <Route path="/fashionshoot" element={<FashionShoot />} />
          <Route path="/greenscreenshoot" element={<GreenScreen />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/adminbs" element={<AdminDashboard />} />
          <Route path="/Podcast" element={<Navigate to="/podcast" replace />} />
          <Route path="/Studios" element={<Navigate to="/studios" replace />} />
          <Route path="/FashionShoot" element={<Navigate to="/fashionshoot" replace />} />
          <Route path="/GreenScreenShoot" element={<Navigate to="/greenscreenshoot" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
