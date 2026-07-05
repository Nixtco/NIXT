'use client'

import { FC, useRef, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { marketingContent } from '@/lib/marketingContent'
import styles from './BentoGrid.module.css'

const BentoGrid: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
   const { language, dir } = useLanguage()
   const content = marketingContent[language].bento

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.getElementsByClassName(styles.card)
      for (const card of cards) {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        ;(card as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
        ;(card as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
      }
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
      <section className={styles.bentoSection} dir={dir}>
      <div className={styles.dotBackground} />
      <div className={styles.gridContainer} ref={containerRef}>

        <div className={`${styles.card} ${styles.rowSpan2}`}>
               <h3 className={styles.headerTitle}>{content.titleLine1}<br />{content.titleLine2}</h3>
          <p className={styles.cardDesc} style={{ fontSize: '18px', color: '#888' }}>
                  {content.leadDescription}
          </p>
          <div className={styles.cardVisual} style={{ background: 'transparent' }}>
             <div className={styles.scene}>
              <div className={styles.cube}>
                <div className={styles.innerGlow} />
                <div className={`${styles.face} ${styles.front}`}></div>
                <div className={`${styles.face} ${styles.back}`}></div>
                <div className={`${styles.face} ${styles.right}`}></div>
                <div className={`${styles.face} ${styles.left}`}></div>
                <div className={`${styles.face} ${styles.top}`}></div>
                <div className={`${styles.face} ${styles.bottom}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
               <h3 className={styles.cardTitle}>{content.logicTitle}</h3>
               <p className={styles.cardDesc}>{content.logicDescription}</p>
           <div className={styles.arrowIcon}>→</div>
          <div className={styles.cardVisual}>
            <div className={styles.thinkingInput}>
                      <span>{content.processing}</span>
               <span style={{color: '#0070f3'}}>➤</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
               <h3 className={styles.cardTitle}>{content.scaleTitle}</h3>
               <p className={styles.cardDesc}>{content.scaleDescription}</p>
           <div className={styles.arrowIcon}>→</div>
          <div className={styles.cardVisual}>
             <div className={styles.tagsGrid}>
                <div className={styles.tag}>Scalable</div>
                <div className={styles.tag}>Secure</div>
                <div className={styles.tag}>+2M Users</div>
                <div className={styles.tag}>Fast</div>
                <div className={styles.tag}>Reliable</div>
                <div className={styles.tag}>Cloud Native</div>
             </div>
          </div>
        </div>

        <div className={styles.card}>
               <h3 className={styles.cardTitle}>{content.webTitle}</h3>
               <p className={styles.cardDesc}>{content.webDescription}</p>
           <div className={styles.arrowIcon}>→</div>
          <div className={styles.cardVisual}>
             <div className={styles.browserWindow}>
                <div className={styles.windowControls}>
                   <div style={{background: '#ff5f56'}} className={styles.control}></div>
                   <div style={{background: '#ffbd2e'}} className={styles.control}></div>
                   <div style={{background: '#27c93f'}} className={styles.control}></div>
                </div>
                        <div style={{color: '#666', fontSize: '14px'}}>{content.webPrompt}</div>
             </div>
          </div>
        </div>

        <div className={styles.card}>
               <h3 className={styles.cardTitle}>{content.commerceTitle}</h3>
               <p className={styles.cardDesc}>{content.commerceDescription}</p>
           <div className={styles.arrowIcon}>→</div>
          <div className={styles.cardVisual}>
             <div className={styles.commerceContainer}>
                <div className={styles.commerceItem}></div>
                <div className={styles.commerceItem}></div>
                <div className={styles.commerceItem}></div>
             </div>
          </div>
        </div>

        <div className={styles.card}>
               <h3 className={styles.cardTitle}>{content.paymentTitle}</h3>
               <p className={styles.cardDesc}>{content.paymentDescription}</p>
           <div className={styles.arrowIcon}>→</div>
          <div className={styles.cardVisual}>
             <div className={styles.digitalCardWrapper}>
                <div className={styles.digitalCard}>
                   <div className={styles.cardFace}>
                      <div className={styles.cardChip}></div>
                      <div className={styles.cardLogo}>VISA</div>
                      <div className={styles.cardDots}>
                        <span>••••</span>
                        <span>••••</span>
                        <span>••••</span>
                        <span>4242</span>
                      </div>
                      <div className={styles.cardName}>NIXT GROUP</div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className={styles.card}>
               <h3 className={styles.cardTitle}>{content.saasTitle}</h3>
               <p className={styles.cardDesc}>{content.saasDescription}</p>
           <div className={styles.arrowIcon}>→</div>
          <div className={styles.cardVisual}>
             <div className={styles.stackedWindows}>
                <div className={styles.stackItem}>
                   <div className={styles.stackLeft} style={{color: '#333'}}>•••</div>
                   <div className={styles.stackCenter}>🔒 joe.domain.com</div>
                </div>
                <div className={styles.stackItem}>
                   <div className={styles.stackLeft} style={{color: '#444'}}>•••</div>
                   <div className={styles.stackCenter}>🔒 jane.domain.com</div>
                </div>
                <div className={styles.stackItem}>
                   <div className={styles.stackLeft} style={{color: '#555'}}>•••</div>
                   <div className={styles.stackCenter}>🔒 project.domain.com</div>
                </div>
                <div className={styles.stackItem}>
                    <div className={styles.stackControls}>
                       <span style={{background:'#FF5F56'}}></span>
                       <span style={{background:'#0070F3'}}></span>
                       <span style={{background:'#00C781'}}></span>
                    </div>
                    <div className={styles.stackCenter} style={{color: '#fff'}}>🔒 customer.domain.com</div>
                </div>
             </div>
          </div>
         </div>

         <div className={`${styles.card} ${styles.span3}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: '50%' }}>
             <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#666', fontSize: '12px'}}>
                <span>⬢</span> {content.infraLabel}
             </div>
             <h3 className={styles.cardTitle} style={{ fontSize: '28px', lineHeight: '1.4' }}>
                <span style={{ color: '#fff' }}>{content.infraPrimary}</span>{' '}
                <span style={{ color: '#888' }}>{content.infraSecondary}</span>
             </h3>
          </div>
          
          <div className={styles.infraVisual}>
             <div className={styles.infraIcons}>
                <div className={styles.infraIcon} style={{borderColor: '#FF4500'}}></div>
                <div className={styles.infraIcon} style={{borderColor: '#41B883'}}></div>
                <div className={styles.infraIcon} style={{borderColor: '#fff'}}></div>
                <div className={styles.infraIcon} style={{borderColor: '#61DAFB'}}></div>
                <div className={styles.infraIcon} style={{borderColor: '#DD0031'}}></div>
             </div>
             
             <div className={styles.infraLines}>
                <div className={styles.line} style={{background: 'linear-gradient(90deg, #FF4500, transparent)'}}></div>
                <div className={styles.line} style={{background: 'linear-gradient(90deg, #41B883, transparent)'}}></div>
                <div className={styles.line} style={{background: 'linear-gradient(90deg, #fff, transparent)'}}></div>
                <div className={styles.line} style={{background: 'linear-gradient(90deg, #61DAFB, transparent)'}}></div>
                <div className={styles.line} style={{background: 'linear-gradient(90deg, #DD0031, transparent)'}}></div>
             </div>

             <div className={styles.connector}>
                <div className={styles.infraLogo}>
                  <div className={styles.infraLogoTriangle}></div>
                </div>
             </div>
             
          </div>
        </div>

      </div>
    </section>
  )
}

export default BentoGrid
