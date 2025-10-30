import Header from "@/components/ui/Header";
import Hero from "@/components/ui/Hero";
import Features from "@/components/ui/Features";
import Stats from "@/components/ui/Stats";
import HowItWorks from "@/components/ui/HowItWorks";
import CTA from "@/components/ui/CTA";
import Footer from "@/components/ui/Footer";

const Index = () => {
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
};

export default Index;
