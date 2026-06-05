"use client";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import WhyKyrgyzstan from "@/components/WhyKyrgyzstan";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import ToursSection from "@/components/ToursSection";
import HotelsSection from "@/components/HotelsSection";
import ContactSection from "@/components/ContactSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

const HeroSection = dynamic(() => import("@/components/HeroSection"), { ssr: false });
const TransportSection = dynamic(() => import("@/components/TransportSection"), { ssr: false });

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main>
        <HeroSection />
        <WhyKyrgyzstan />
        <FeaturedDestinations />
        <ToursSection />
        <HotelsSection />
        <TransportSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
