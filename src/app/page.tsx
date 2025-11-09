import React from 'react'
import Header from '@/components/ui/Header';
import Hero from '@/components/ui/Hero';
import Stats from '@/components/ui/Stats';
import Features from '@/components/ui/Features';
import HowItWorks from '@/components/ui/HowItWorks';
import CTA from '@/components/ui/CTA';
import Footer from '@/components/ui/Footer';
const page = () => {
  return (
    <div className="min-h-screen">
            <Header />
            <main>
                <Hero />
                <Stats />
                <div id="features">
                    <Features />
                </div>
                <div id="how-it-works">
                    <HowItWorks />
                </div>
                <CTA />
            </main>
            <Footer />
        </div>
    );
  
}

export default page