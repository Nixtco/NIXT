'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGlobalAuth } from '@/lib/auth-context'
import styles from './Header.module.css'

interface HeaderProps {
  onSmoothScroll: (targetId: string) => void
}

const Header: FC<HeaderProps> = ({ onSmoothScroll }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated } = useGlobalAuth()
  const router = useRouter()

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
    if (!user) return 'User'
    
    return user.display_name || user.first_name || user.email.split('@')[0]
  }

  return (
    <nav className={styles.mainNav} aria-label="Main Navigation">
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
            Projects
          </a>
        </li>
        <li>
          <a href="#services" onClick={(e) => handleNavClick(e, 'services')}>
            Services
          </a>
        </li>
        <li>
          <a href="/login">
            Contact
          </a>
        </li>
        <li>
          <Link href="/pricing">
            Pricing
          </Link>
        </li>
        <li>
          {isAuthenticated && user ? (
            <a 
              href="#" 
              onClick={handleUserClick}
              className={styles.userNameBtn}
              title={`Go to ${user.role === 'admin' || user.role === 'owner' ? 'Controllers' : 'Dashboard'}`}
            >
              {getUserDisplayName()}
            </a>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Header
