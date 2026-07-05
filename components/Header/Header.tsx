'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGlobalAuth } from '@/lib/auth-context'
import { useLanguage } from '@/hooks/useLanguage'
import { marketingContent } from '@/lib/marketingContent'
import styles from './Header.module.css'

interface HeaderProps {
  onSmoothScroll: (targetId: string) => void
}

const Header: FC<HeaderProps> = ({ onSmoothScroll }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated } = useGlobalAuth()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const content = marketingContent[language].header
  const nextLanguage = language === 'ar' ? 'en' : 'ar'
  const languageLabel = language === 'ar' ? 'English' : 'العربية'

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    onSmoothScroll(targetId)
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleUserClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsMenuOpen(false)
    
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'owner'
      
      if (isAdmin) {
        router.push('/controllers')
      } else {
        router.push('/dashboard')
      }
    }
  }

  const getUserDisplayName = (): string => {
    if (!user) return content.login
    
    return user.display_name || user.first_name || user.email.split('@')[0]
  }

  return (
    <nav className={styles.mainNav} aria-label="Main Navigation" dir="ltr">
      <button 
        className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle Menu"
        aria-expanded={isMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ''}`}>
        <li>
          <a href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>
            {content.projects}
          </a>
        </li>
        <li>
          <a href="#services" onClick={(e) => handleNavClick(e, 'services')}>
            {content.services}
          </a>
        </li>
        <li>
          <a href="/login">
            {content.contact}
          </a>
        </li>
        <li>
          <Link href="/pricing">
            {content.pricing}
          </Link>
        </li>
        <li className={styles.languageItem}>
          <button
            type="button"
            className={styles.languageTextButton}
            onClick={() => setLanguage(nextLanguage)}
            aria-label={content.language}
          >
            {languageLabel}
          </button>
        </li>
        <li>
          {isAuthenticated && user ? (
            <a 
              href="#" 
              onClick={handleUserClick}
              className={styles.userNameBtn}
              title={`${user.role === 'admin' || user.role === 'owner' ? content.controllers : content.dashboard}`}
            >
              {getUserDisplayName()}
            </a>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              {content.login}
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Header
