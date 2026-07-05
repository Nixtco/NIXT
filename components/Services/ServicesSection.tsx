'use client'

import { FC, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { marketingContent } from '@/lib/marketingContent'
import styles from './Services.module.css'

interface Service {
  title: string
  description: string
  icon: React.ReactNode
}

const services: Service[] = [
  {
    title: 'Systems Development',
    description: "We don't just build websites; we design powerful systems that manage your business with high efficiency and superior security, considering every technical detail.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )
  },
  {
    title: 'Cloud Solutions',
    description: 'Advanced infrastructure ensuring complete stability for your project and the ability to scale globally without any technical or software obstacles.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
      </svg>
    )
  },
  {
    title: 'User Experience',
    description: "Modern designs focused on user psychology and accessibility, just as seen in the world's most prestigious tech platforms.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    )
  }
]

interface ServicesProps {
  onContactClick: () => void
}

const ServiceCard: FC<{ service: Service; onClick: () => void }> = ({ service, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()
  const content = marketingContent[language].services

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div 
      className={styles.serviceCard} 
      ref={cardRef}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.iconWrapper}>
        {service.icon}
      </div>
      <h3 className={styles.cardTitle}>{service.title}</h3>
      <p className={styles.cardDescription}>{service.description}</p>
      <a 
        href="#contact" 
        onClick={(e) => { e.preventDefault(); onClick(); }} 
        className={styles.learnMoreBtn}
      >
        <span>{content.learnMore}</span>
        <svg className={styles.arrowIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </div>
  )
}

const ServicesSection: FC<ServicesProps> = ({ onContactClick }) => {
  const { language, dir } = useLanguage()
  const content = marketingContent[language].services
  const localizedServices = services.map((service, index) => ({
    ...service,
    title: content.items[index]?.title || service.title,
    description: content.items[index]?.description || service.description,
  }))

  return (
    <section id="services" className={styles.contentSection} dir={dir}>
      <div className={styles.glowBg} />
      
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{content.title}</h2>
        <p className={styles.sectionSubtitle}>
          {content.subtitle}
        </p>
      </div>

      <div className={styles.servicesGrid}>
        {localizedServices.map((service, index) => (
          <ServiceCard 
            key={index} 
            service={service} 
            onClick={onContactClick} 
          />
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
