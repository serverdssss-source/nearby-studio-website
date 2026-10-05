import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import ScrollToTopButton from './components/ScrollToTop';

// Critical components - load immediately (above fold)
import Navbar from './components/Navbar';
import SEO from './components/SEO';

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
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogPostOutgrownHome = lazy(() => import("./pages/BlogPostOutgrownHome"));
const BlogPostFashionVsProduct = lazy(() => import("./pages/BlogPostFashionVsProduct"));
const BlogPostWhyPodcastProductionMatters = lazy(() => import("./pages/BlogPostWhyPodcastProductionMatters"));
const BlogPostGreenScreenShoots = lazy(() => import("./pages/BlogPostGreenScreenShoots"));
const BlogPostBeyondFourWalls = lazy(() => import("./pages/BlogPostBeyondFourWalls"));
const BlogPostTop5PlacesRajajinagar = lazy(() => import("./pages/BlogPostTop5PlacesRajajinagar"));
const BlogPostTop10Equipment = lazy(() => import("./pages/BlogPostTop10Equipment"));
const BlogPostBengaluruStartupsContent = lazy(() => import("./pages/BlogPostBengaluruStartupsContent"));
const BlogPostTop10GreenScreenShootIdeas = lazy(() => import("./pages/BlogPostTop10GreenScreenShootIdeas"));
const BlogPostHowToPlanStudioShoot = lazy(() => import("./pages/BlogPostHowToPlanStudioShoot"));
const BlogPostFirstPodcastPrep = lazy(() => import("./pages/BlogPostFirstPodcastPrep"));
const BlogPostEasyPosingTips = lazy(() => import("./pages/BlogPostEasyPosingTips"));
const BlogPostPosingTipsForFounders = lazy(() => import("./pages/BlogPostPosingTipsForFounders"));
const BlogPostCompositionTechniques = lazy(() => import("./pages/BlogPostCompositionTechniques"));
const BlogPostThreePointLighting = lazy(() => import("./pages/BlogPostThreePointLighting"));
const BlogPost7CameraTechniques = lazy(() => import("./pages/BlogPost7CameraTechniques"));
const BlogPostCanAIReplaceStudioShoot = lazy(() => import("./pages/BlogPostCanAIReplaceStudioShoot"));
const BlogPostDepthOfField = lazy(() => import("./pages/BlogPostDepthOfField"));
const BlogPost5MythsStudioRentals = lazy(() => import("./pages/BlogPost5MythsStudioRentals"));
const BlogPostFilmPodcastStudio = lazy(() => import("./pages/BlogPostFilmPodcastStudio"));
const BlogPostChooseStudioBengaluru = lazy(() => import("./pages/BlogPostChooseStudioBengaluru"));
const BlogPostEventVideography = lazy(() => import("./pages/BlogPostEventVideography"));

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
      <SEO
        title="Studio Rental in Rajajinagar, Bengaluru | Podcast, Photo & Video Studio | Nearby Studio"
        description="Rent a professional studio in Rajajinagar, Bengaluru for podcasts, fashion and model shoots, green screen, reels and brand content. Fully equipped, easy hourly booking."
      />
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
    <>
      <Router>
        <ScrollToTopOnRouteChange />
        <ScrollToTopButton />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<><SEO title="Book a Studio Slot in Bengaluru | Nearby Studio" description="Check availability and book Nearby Studio in Rajajinagar, Bengaluru by the hour for podcasts, photo shoots and video production." /><BookingPage /></>} />
            <Route path="/contactus" element={<><SEO title="Contact Nearby Studio | Studio Rental in Rajajinagar, Bengaluru" description="Get in touch with Nearby Studio in Rajajinagar, Bengaluru for studio bookings, pricing and custom shoot requirements." /><ContactSection /></>} />
            <Route path="/podcast" element={<><SEO title="Podcast Studio in Bengaluru (Rajajinagar) | Nearby Studio" description="Record your video or audio podcast at Nearby Studio, Rajajinagar, Bengaluru. Multi-camera setups, pro microphones, lighting and editing support." /><Podcast /></>} />
            <Route path="/studios" element={<><SEO title="Studio Spaces for Rent in Bengaluru | Nearby Studio" description="Explore Nearby Studio's shoot spaces in Rajajinagar, Bengaluru: sets, backdrops, lighting and equipment for photo, video and podcast production." /><Studios /></>} />
            <Route path="/fashionshoot" element={<><SEO title="Fashion & Model Shoot Studio in Bengaluru | Nearby Studio" description="Book a fashion, model or product shoot studio in Rajajinagar, Bengaluru with professional lighting, backdrops and styling space." /><FashionShoot /></>} />
            <Route path="/greenscreenshoot" element={<><SEO title="Green Screen Studio in Bengaluru | Nearby Studio" description="Shoot ads, explainers and VFX content in Nearby Studio's green screen studio in Rajajinagar, Bengaluru, with evenly lit chroma setups." /><GreenScreen /></>} />
            <Route path="/privacy-policy" element={<><SEO title="Privacy Policy | Nearby Studio" description="How Nearby Studio collects, uses and protects your information." /><PrivacyPolicy /></>} />
            <Route path="/adminbs" element={<AdminDashboard />} />
            <Route path="/Podcast" element={<Navigate to="/podcast" replace />} />
            <Route path="/Studios" element={<Navigate to="/studios" replace />} />
            <Route path="/FashionShoot" element={<Navigate to="/fashionshoot" replace />} />
            <Route path="/GreenScreenShoot" element={<Navigate to="/greenscreenshoot" replace />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/podcast-recording-studio-rajajinagar" element={<BlogPost />} />
            <Route path="/blog/5-signs-youve-outgrown-shooting-content-at-home" element={<BlogPostOutgrownHome />} />
            <Route path="/blog/fashion-shoot-vs-product-shoot-rajajinagar" element={<BlogPostFashionVsProduct />} />
            <Route path="/blog/why-podcast-production-matters" element={<BlogPostWhyPodcastProductionMatters />} />
            <Route path="/blog/green-screen-shoots-bengaluru" element={<BlogPostGreenScreenShoots />} />
            <Route path="/blog/beyond-four-walls" element={<BlogPostBeyondFourWalls />} />
            <Route path="/blog/top-5-places-to-visit-near-rajajinagar-bengaluru" element={<BlogPostTop5PlacesRajajinagar />} />
            <Route path="/blog/top-10-equipment-must-haves-in-a-professional-studio" element={<BlogPostTop10Equipment />} />
            <Route path="/blog/bengalurus-startups-need-better-content" element={<BlogPostBengaluruStartupsContent />} />
            <Route path="/blog/top-10-green-screen-shoot-ideas" element={<BlogPostTop10GreenScreenShootIdeas />} />
            <Route path="/blog/how-to-plan-successful-studio-shoot" element={<BlogPostHowToPlanStudioShoot />} />
            <Route path="/blog/how-to-prep-first-podcast-recording" element={<BlogPostFirstPodcastPrep />} />
            <Route path="/blog/10-easy-posing-tips-for-your-first-fashion-shoot" element={<BlogPostEasyPosingTips />} />
            <Route path="/blog/posing-tips-for-founders" element={<BlogPostPosingTipsForFounders />} />
            <Route path="/blog/composition-techniques-cinematic-footage" element={<BlogPostCompositionTechniques />} />
            <Route path="/blog/three-point-lighting-explained" element={<BlogPostThreePointLighting />} />
            <Route path="/blog/7-camera-techniques-cinematic-look" element={<BlogPost7CameraTechniques />} />
            <Route path="/blog/can-ai-replace-studio-shoot" element={<BlogPostCanAIReplaceStudioShoot />} />
            <Route path="/blog/depth-of-field-explained" element={<BlogPostDepthOfField />} />
            <Route path="/blog/5-myths-about-studio-rentals" element={<BlogPost5MythsStudioRentals />} />
            <Route path="/blog/podcast-studio-for-directors-actors-production-houses-bengaluru" element={<BlogPostFilmPodcastStudio />} />
            <Route path="/blog/how-to-choose-the-right-studio-bengaluru" element={<BlogPostChooseStudioBengaluru />} />
            <Route path="/blog/event-videography-corporate-launches-product-unveilings" element={<BlogPostEventVideography />} />
          </Routes>
        </Suspense>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
