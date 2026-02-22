'use client'

import { FC, useState, useEffect, useRef } from 'react'
import styles from './Dashboard.module.css'
import { useLanguage } from '@/hooks/useLanguage'
import { useGlobalAuth } from '@/lib/auth-context'
import { getMyProjects } from '@/app/Projects/apiFunctions'
import type { Project as ProjectType, ProgressItem } from '@/app/Projects/apiFunctions'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'

// ── Read-only Progress Line Bar ──────────────────────────────────────────────
function ReadOnlyProgressBar({
  items,
  completedIds,
  isRTL,
  isFinished,
}: {
  items: ProgressItem[]
  completedIds: string[]
  isRTL: boolean
  isFinished: boolean
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const colors = ['#0070F3', '#00C781', '#FF8C00', '#FF4444', '#A855F7', '#EC4899', '#14B8A6', '#F59E0B']
  const getColor = (index: number) => colors[index % colors.length]

  const completedItems = items.filter(i => completedIds.includes(i.id))
  const maxPercent = isFinished ? 100 : (completedItems.length > 0 ? Math.max(...completedItems.map(i => i.percent)) : 0)

  return (
    <div style={{ padding: '0.5rem 0 1rem' }}>
      {/* Percentage marks */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.68rem',
        color: 'var(--text-dim)',
        userSelect: 'none',
        marginBottom: '0.2rem',
      }}>
        {/* <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span> */}
      </div>

      {/* Line bar */}
      <div style={{
        position: 'relative',
        height: '8px',
        background: 'var(--bg-hover)',
        borderRadius: '4px',
        marginTop: '5.5rem',
        marginBottom: '0.75rem',
        marginLeft: '1rem',
        marginRight: '1rem',
      }}>
        {/* Fill gradient */}
        {maxPercent > 0 && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, height: '100%',
            width: `${maxPercent}%`,
            background: isFinished
              ? 'linear-gradient(90deg, #0070F3, #00C781, #FFD700)'
              : 'linear-gradient(90deg, rgba(0,112,243,0.4), rgba(0,199,129,0.4))',
            borderRadius: '4px',
            boxShadow: isFinished ? '0 0 8px rgba(255,215,0,0.4)' : 'none',
            transition: 'width 0.4s ease, background 0.5s ease',
          }} />
        )}

        {/* Tick marks */}
        {[25, 50, 75].map(tick => (
          <div key={tick} style={{
            position: 'absolute',
            left: `${tick}%`,
            top: '-4px',
            width: '1px',
            height: '16px',
            background: 'rgba(255,255,255,0.08)',
          }} />
        ))}

        {/* Circles for each task */}
        {items.map((item, index) => {
          const isCompleted = completedIds.includes(item.id)
          const isHovered = hoveredId === item.id
          const color = isCompleted ? getColor(index) : 'rgb(100, 116, 139)'
          const circleSize = isCompleted ? 30 : 15

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${item.percent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: isHovered ? 15 : 10,
                
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Title badge above */}
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '8px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textAlign: 'center',
              }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: isCompleted
                    ? 'rgba(0, 199, 129, 0.18)'
                    : 'rgba(85, 99, 144, 0.29)',
                  border: `1px solid ${isCompleted ? 'rgba(0,199,129,0.45)' : 'rgba(100,116,139,0.3)'}`,
                  color: isCompleted ? '#00C781' : '#94a3b8',
                  transition: 'all 0.2s ease',
                }}>
                  {item.title}
                </span>
              </div>

              {/* Circle with % inside */}
              <div style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                background: `${color}`,
                border: `2.5px solid ${color}`,
                boxShadow: isHovered ? `0 0 14px ${color}70` : `0 2px 8px rgba(0,0,0,0.3)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                cursor: 'default',
                flexShrink: 0,
              }}>
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    color: isCompleted ? '#fff' : "rgba(255,255,255,0)",
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>
                    {item.percent}%
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Fixed "Start" circle at 0% — always visible */}
        <div style={{
          position: 'absolute',
          left: '0%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }}>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(100,116,139,0.18)',
              border: '1px solid rgba(100,116,139,0.35)',
              color: '#94a3b8',
            }}>
              {isRTL ? 'البداية' : 'Start'}
            </span>
          </div>
          <div style={{
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            background: 'rgb(100, 116, 139)',
            border: '2.5px solid rgb(100, 116, 139)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
          }} />
        </div>

        {/* Fixed "Finish" circle at 100% — always visible */}
        <div style={{
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }}>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '6px',
              background: isFinished ? 'rgba(255,215,0,0.15)' : 'rgba(100,116,139,0.18)',
              border: `1px solid ${isFinished ? 'rgba(255,215,0,0.45)' : 'rgba(100,116,139,0.35)'}`,
              color: isFinished ? '#FFD700' : '#94a3b8',
              transition: 'all 0.4s ease',
            }}>
              {isRTL ? 'النهاية' : 'Finish'}
            </span>
          </div>
          <div style={{
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            background: isFinished ? 'radial-gradient(circle at 35% 35%, #FFD700, #B8860B)' : 'rgb(100, 116, 139)',
            border: `2.5px solid ${isFinished ? '#FFD700' : 'rgb(100, 116, 139)'}`,
            boxShadow: isFinished ? '0 0 14px #FFD700aa, 0 0 28px #FFD70050' : '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
            transition: 'all 0.4s ease',
          }} />
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
        {items.map((item, index) => {
          const isCompleted = completedIds.includes(item.id)
          const color = isCompleted ? '#c76700' : getColor(index)
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.65rem',
                background: hoveredId === item.id ? 'var(--bg-hover)' : 'transparent',
                borderRadius: '8px',
                border: `1px solid ${hoveredId === item.id ? color + '30' : 'transparent'}`,
                transition: 'all 0.2s ease',
                cursor: 'default',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: color, flexShrink: 0, boxShadow: `0 0 5px ${color}40`,
              }} /> */}
              <span style={{
                color: isCompleted ? 'var(--text-dim)' : 'var(--text-white)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                fontSize: '0.85rem', fontWeight: 500, flex: 1,
                textAlign: isRTL ? 'right' : 'left',
              }}>
                {item.title}
              </span>
              {/* Status circle */}
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompleted ? 'rgba(0,199,129,0.15)' : 'rgba(100,116,139,0.15)',
                border: `2px solid ${isCompleted ? '#00C781' : 'rgba(100,116,139,0.4)'}`,
                transition: 'all 0.3s ease',
                boxShadow: isCompleted ? '0 0 8px rgba(0,199,129,0.3)' : 'none',
              }}>
                {isCompleted && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5L4.5 8L9 3" stroke="#00C781" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
        {/* Finish Project row — only when project is completed */}
        {isFinished && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.4rem 0.65rem',
            background: 'rgba(255,215,0,0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(255,215,0,0.3)',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#FFD700', flexShrink: 0, boxShadow: '0 0 8px #FFD700aa',
            }} />
            <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 700, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? '🏁 إنهاء المشروع' : '🏁 Finish Project'}
            </span>
            <span style={{ color: '#00C781', fontWeight: 700, fontSize: '0.82rem' }}>✓ Done</span>
            <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.82rem', minWidth: '36px', textAlign: 'center' }}>100%</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface Milestone {
  name: string
  threshold: number
  isCompleted: boolean
}

const ProjectOverview: FC = () => {
  const { t, language } = useLanguage()
  const { user } = useGlobalAuth()
  const isRTL = language === 'ar'

  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track which project id is currently waiting for sign API response
  const [signLoadingId, setSignLoadingId] = useState<string | null>(null)

  const handleSign = async (projectId: string) => {
    setSignLoadingId(projectId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/sign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      const json = await res.json()
      if (json.success) {
        // Update local state so the notice disappears immediately
        setProjects(prev =>
          prev.map(p => p.id === projectId ? { ...p, has_signed: true } : p)
        )
      }
    } catch (err) {
      console.error('Sign request failed:', err)
    } finally {
      setSignLoadingId(null)
    }
  }

  // Fetch user's projects on mount
  useEffect(() => {
    async function fetchProjects() {
      console.log('🔍 ProjectOverview - Attempting to fetch projects...')
      console.log('👤 User:', user)
      console.log('🔑 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING')

      if (!user) {
        console.warn('⚠️ No user found, skipping project fetch')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log(`📡 Fetching projects for current user`)
        
        const response = await getMyProjects()
        console.log('📦 API Response:', response)
        
        if (response.success && response.data) {
          console.log(`✅ Successfully loaded ${response.data.length} projects`)
          setProjects(response.data)
        } else {
          console.error('❌ API returned success=false or no data:', response)
          setError(isRTL ? 'فشل في تحميل المشاريع' : 'Failed to load projects')
        }
      } catch (err: any) {
        console.error('❌ Error fetching projects:', err)
        console.error('Error message:', err?.message)
        console.error('Error details:', err)
        
        // Show more specific error
        const errorMsg = err?.message || (isRTL ? 'حدث خطأ أثناء تحميل المشاريع' : 'An error occurred while loading projects')
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user, isRTL])

  const getStatusColor = (status: ProjectType['status']) => {
    switch (status) {
      case 'completed': return '#00C781'
      case 'active': return '#0070F3'
      case 'pending': return '#FF8C00'
      case 'onhold': return '#666'
      default: return '#666'
    }
  }

  const getStatusText = (status: ProjectType['status']) => {
    const statusMap: Record<string, string> = {
      active: isRTL ? 'قيد التطوير' : 'In Development',
      completed: isRTL ? 'مكتمل' : 'Completed',
      pending: isRTL ? 'قيد الانتظار' : 'Pending',
      onhold: isRTL ? 'متوقف' : 'On Hold',
    }
    return statusMap[status] || status
  }

  // Calculate overall progress from progress items
  const calculateOverallProgress = (progressItems: ProgressItem[]): number => {
    if (!progressItems || progressItems.length === 0) return 0
    const total = progressItems.reduce((sum, item) => sum + item.percent, 0)
    return Math.round(total / progressItems.length)
  }

  // Generate milestones based on progress items or default phases
  const getMilestones = (project: ProjectType): Milestone[] => {
    if (project.progress && project.progress.length > 0) {
      // Use actual progress items from the project
      return project.progress.map(item => ({
        name: item.title,
        threshold: item.percent,
        isCompleted: project.progress_completed?.includes(item.id) || false
      })).sort((a, b) => a.threshold - b.threshold)
    }
    
    // Fallback to default milestones
    const overallProgress = calculateOverallProgress(project.progress || [])
    return [
      { name: t.project.phases.analysis, threshold: 20, isCompleted: overallProgress >= 20 },
      { name: t.project.phases.ui, threshold: 45, isCompleted: overallProgress >= 45 },
      { name: t.project.phases.backend, threshold: 70, isCompleted: overallProgress >= 70 },
      { name: t.project.phases.integration, threshold: 90, isCompleted: overallProgress >= 90 },
      { name: t.project.phases.launch, threshold: 100, isCompleted: overallProgress >= 100 },
    ]
  }

  if (loading) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t.project.title}
        </h2>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'var(--text-dim)'
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p style={{ marginTop: '20px' }}>
            {isRTL ? 'جاري تحميل المشاريع...' : 'Loading projects...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t.project.title}
        </h2>
        <div style={{ 
          textAlign: isRTL ? 'right' : 'left', 
          padding: '40px 20px', 
          color: '#ff6b6b',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 107, 107, 0.2)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            {isRTL ? '⚠️ خطأ في تحميل المشاريع' : '⚠️ Error Loading Projects'}
          </h3>
          <p style={{ marginBottom: '15px', opacity: 0.9 }}>{error}</p>
          <details style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              {isRTL ? 'معلومات الفحص' : 'Debug Info'}
            </summary>
            <div style={{ fontFamily: 'monospace', lineHeight: '1.6' }}>
              <p><strong>User Email:</strong> {user?.email || 'NOT FOUND'}</p>
              <p><strong>Token:</strong> {localStorage.getItem('token') ? 'EXISTS' : 'MISSING'}</p>
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
              <p><strong>Endpoint:</strong> /projects/my-projects</p>
              <p style={{ marginTop: '10px', color: '#ffd700' }}>
                {isRTL ? '💡 افتح Console في Developer Tools للمزيد من التفاصيل' : '💡 Open Console in Developer Tools for more details'}
              </p>
              <p style={{ marginTop: '10px', color: '#ff6b6b' }}>
                <strong>{isRTL ? '⚠️ ملاحظة:' : '⚠️ Note:'}</strong><br/>
                {isRTL 
                  ? 'تحتاج لإضافة endpoint جديد في Backend. راجع: docs/BACKEND_MY_PROJECTS_ENDPOINT.md' 
                  : 'You need to add a new endpoint in Backend. See: docs/BACKEND_MY_PROJECTS_ENDPOINT.md'}
              </p>
            </div>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle} style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t.project.title}
        {projects.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: isRTL ? '0' : '10px', marginLeft: isRTL ? '10px' : '0' }}>
            ({projects.length} {isRTL ? 'مشاريع' : 'projects'})
          </span>
        )}
      </h2>
      
      {projects.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: 'var(--text-dim)',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
            {isRTL ? 'لا توجد مشاريع مرتبطة بحسابك حالياً' : 'No projects linked to your account yet'}
          </p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
            {isRTL ? 'سيتم عرض المشاريع هنا بعد إضافتها من قبل المدير' : 'Projects will appear here once added by the manager'}
          </p>
        </div>
      ) : (
        projects.map((project) => {
          const overallProgress = calculateOverallProgress(project.progress || [])
          const milestones = getMilestones(project)
          
          return (
            <div key={project.id} className={styles.projectCard} style={{ marginBottom: '20px' }}>
              <div className={styles.projectHeader} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <h3>{project.name}</h3>
                <span 
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {getStatusText(project.status)}
                </span>
              </div>

              {/* Signing notice — show only when project has NOT been signed yet */}
              {!project.has_signed && (
                <div className={styles.signNotice} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span>
                    {isRTL ? 'يجب عليك التوقيع على البند حتى يتم البدء في عمل المشروع' : 'You must sign the clause before the project work can begin.'}
                  </span>
                  <button
                    className={styles.signBtn}
                    style={{ marginInlineStart: 'auto', opacity: signLoadingId === project.id ? 0.6 : 1 }}
                    aria-label={isRTL ? 'توقيع' : 'Sign'}
                    disabled={signLoadingId === project.id}
                    onClick={() => handleSign(project.id)}
                  >
                    {signLoadingId === project.id ? '...' : 'Sign'}
                  </button>
                </div>
              )}

              {/* Progress Line Bar */}
              {project.progress && project.progress.length > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  {/* <h4 style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-dim)',
                    marginBottom: '8px',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {isRTL ? 'مراحل المشروع' : 'Project Phases'}
                  </h4> */}
                  <ReadOnlyProgressBar
                    items={project.progress}
                    completedIds={project.progress_completed || []}
                    isRTL={isRTL}
                    isFinished={project.status === 'completed'}
                  />
                </div>
              )}

              <div className={styles.projectStats} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span className={styles.statLabel}>{t.project.budget}</span>
                  <span className={styles.statValue}>${Number(project.price).toLocaleString()}</span>
                </div>
                <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span className={styles.statLabel}>{t.project.spent}</span>
                  <span className={styles.statValue}>${Number(project.spent).toLocaleString()}</span>
                </div>
                <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span className={styles.statLabel}>{t.project.deadline}</span>
                  <span className={styles.statValue}>
                    {new Date(project.deadline).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                {project.priority && (
                  <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <span className={styles.statLabel}>{isRTL ? 'الأولوية' : 'Priority'}</span>
                    <span className={styles.statValue} style={{ 
                      color: project.priority === 'urgent' ? '#ff6b6b' : 
                             project.priority === 'high' ? '#ff8c00' : 
                             project.priority === 'medium' ? '#0070F3' : '#666',
                      textTransform: 'capitalize'
                    }}>
                      {project.priority}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default ProjectOverview