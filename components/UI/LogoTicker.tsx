'use client'

import Image from 'next/image'
import styles from './LogoTicker.module.css'

interface LogoItem {
  src: string
  alt: string
  href: string
}

const logos: LogoItem[] = [
  { src: '/sahm_logo.png', alt: 'Sahm', href: '' },
  { src: '/Genius.png', alt: 'Genius', href: '' },
  { src: '/wesham.png', alt: 'Partner', href: 'https://matrawy-maxbot.github.io/wesham_web/' },
  { src: '/GAD.webp', alt: 'Partner', href: 'https://business-services-platform.vercel.app/ar' },
  { src: '/Hiraf.png', alt: 'Partner', href: 'https://hiraf.net' },
  { src: '/October.webp', alt: 'Partner', href: 'https://university-lms-platform.vercel.app/login' },
  { src: '/IMS.png', alt: 'Partner', href: 'https://ims-drab-kappa.vercel.app/' },
  { src: '/TwaiqGames2.png', alt: 'Partner', href: 'https://twaiq.net' },
]

export default function LogoTicker() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Our Projects</h3>

      <div className={styles.logoTicker}>
        <div className={styles.tickerWrapper}>

          {/* FIRST LOOP */}
          {logos.map((logo, index) => (
            <div key={`first-${index}`} className={styles.tickerItem}>
              <a href={logo.href} target="_blank" rel="noopener noreferrer">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={35}
                  priority
                  style={{ objectFit: 'contain' }}
                />
              </a>
            </div>
          ))}

          {/* SECOND LOOP */}
          {logos.map((logo, index) => (
            <div key={`second-${index}`} className={styles.tickerItem}>
              <a href={logo.href} target="_blank" rel="noopener noreferrer">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={35}
                  priority
                  style={{ objectFit: 'contain' }}
                />
              </a>
            </div>
          ))}

          {/* THIRD LOOP */}
          {logos.map((logo, index) => (
            <div key={`third-${index}`} className={styles.tickerItem}>
              <a href={logo.href} target="_blank" rel="noopener noreferrer">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={35}
                  priority
                  style={{ objectFit: 'contain' }}
                />
              </a>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}