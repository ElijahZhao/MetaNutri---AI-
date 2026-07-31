'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import SiteHeader from '@/components/home/SiteHeader';
import HeroSection from '@/components/home/HeroSection';
import FeatureGrid from '@/components/home/FeatureGrid';
import CTASection from '@/components/home/CTASection';

const BioCanvas = dynamic(() => import('@/components/BioCanvas'), { ssr: false });

export default function Home() {
  const [isCanvasMode, setIsCanvasMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCanvasMode) {
        setIsCanvasMode(false);
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !isCanvasMode) {
        setIsCanvasMode(true);
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCanvasMode]);

  const enterCanvasMode = async () => {
    setIsCanvasMode(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.log('Fullscreen not supported');
    }
  };

  const exitCanvasMode = () => {
    setIsCanvasMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <div className={`min-h-screen transition-opacity duration-500 ${isCanvasMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <SiteHeader onEnterCanvas={enterCanvasMode} />
        <main>
          <HeroSection />
          <FeatureGrid />
          <CTASection />
        </main>
      </div>
      {isCanvasMode && <BioCanvas isCanvasMode={isCanvasMode} onExitCanvas={exitCanvasMode} />}
    </>
  );
}
