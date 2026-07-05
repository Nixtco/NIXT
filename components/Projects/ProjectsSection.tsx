'use client'

import { FC } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { marketingContent } from '@/lib/marketingContent'
import styles from './Projects.module.css'

const ProjectsSection: FC = () => {
  const { language } = useLanguage()
  const content = marketingContent[language].projects
  const projects = content.items
  const sliderProjects = [...projects, ...projects, ...projects, ...projects]

  return (
    <div id="projects" className={styles.contentSection} dir="ltr">
      <h2 className={styles.sectionTitle}>{content.title}</h2>
      
      <div className={styles.slider}>
        <div className={styles.sliderTrack}>
          {sliderProjects.map((project, index) => (
            <div key={index} className={styles.projectCard}>
              <div className={styles.cardContent}>
                <div className={styles.badge}>{project.badge}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a href="/login" className={styles.serviceCta}>
                  {project.cta}
                </a>
              </div>
              <div className={styles.shine}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectsSection
