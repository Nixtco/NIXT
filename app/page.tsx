'use client'

import { useTheme } from '@/hooks/useTheme'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { useLanguage } from '@/hooks/useLanguage'

import Header from '@/components/Header'
import HeroSection from '@/components/Hero'
import LogoTicker from '@/components/UI/LogoTicker'
import BentoGrid from '@/components/Bento/BentoGrid'
import ProjectsSection from '@/components/Projects'
import ServicesSection from '@/components/Services'
import ProductDirection from '@/components/ProductDirection'
import StatsSection from '@/components/Stats'
import ContactSection from '@/components/Contact'
import ThemeSwitcher from '@/components/UI/ThemeSwitcher'
import Footer from '@/components/Footer'

export default function Home() {
  const { nextTheme, setTheme } = useTheme()
  const { scrollToSection } = useSmoothScroll()
  const { dir } = useLanguage()

  const handleContactClick = () => {
    scrollToSection('contact')
  }

  return (
    <main dir={dir}>
      {/* Navigation */}
      <Header onSmoothScroll={scrollToSection} />

      {/* Hero Section */}
      <HeroSection />

      {/* Logo Ticker */}
      <LogoTicker />

      {/* Bento Grid Features */}
      <BentoGrid />

      {/* Featured Projects */}
      <ProjectsSection />

      {/* Services */}
      <ServicesSection onContactClick={handleContactClick} />

      {/* Product Direction */}
      <ProductDirection />

      {/* Stats */}
      <StatsSection />

      {/* Contact */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
