'use client'

import { FC, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Dashboard.module.css'
import { useLanguage } from '@/hooks/useLanguage'
import { useGlobalAuth } from '@/lib/auth-context'
import { getMyProjects, getProjectById } from '@/app/Projects/apiFunctions'
import type { Project as ProjectType, ProgressItem, StatusChange, ProjectMediaItem } from '@/app/Projects/apiFunctions'
import { loadProjectMedia } from '@/lib/projectMediaStorage'

// ── Read-only Progress Line Bar ──────────────────────────────────────────────
function ReadOnlyProgressBar({
  items,
  completedIds,
  isRTL,
  isFinished,
  hasSigned,
}: {
  items: ProgressItem[]
  completedIds: string[]
  isRTL: boolean
  isFinished: boolean
  hasSigned: boolean
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activePointId, setActivePointId] = useState<string | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  const colors = ['#0070F3', '#00C781', '#FF8C00', '#FF4444', '#A855F7', '#EC4899', '#14B8A6', '#F59E0B']
  const getColor = (index: number) => colors[index % colors.length]

  const completedItems = items.filter(i => completedIds.includes(i.id))
  const maxPercent = isFinished ? 100 : (completedItems.length > 0 ? Math.max(...completedItems.map(i => i.percent)) : 0)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')

    const updateCompactState = () => {
      setIsCompact(mediaQuery.matches)
    }

    updateCompactState()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateCompactState)
      return () => mediaQuery.removeEventListener('change', updateCompactState)
    }

    mediaQuery.addListener(updateCompactState)
    return () => mediaQuery.removeListener(updateCompactState)
  }, [])

  const trackSideMargin = isCompact ? '0.25rem' : '1rem'
  const trackTopMargin = isCompact ? '3.25rem' : '5.5rem'
  const trackHeight = isCompact ? '6px' : '8px'
  const labelFontSize = isCompact ? '0.6rem' : '0.72rem'
  const labelPadding = isCompact ? '2px 6px' : '3px 8px'
  const labelMarginBottom = isCompact ? '6px' : '8px'
  const tickHeight = isCompact ? '12px' : '16px'
  const tickTop = isCompact ? '-3px' : '-4px'
  const completedCircleSize = isCompact ? 24 : 30
  const incompleteCircleSize = isCompact ? 12 : 15

  const getLabelStyle = (isVisible: boolean, isCompleted: boolean, completedColor: string, extraBackground: string, extraBorder: string, extraColor: string) => ({
    display: 'inline-block',
    fontSize: labelFontSize,
    fontWeight: 600,
    padding: labelPadding,
    borderRadius: '6px',
    background: isVisible ? extraBackground : 'transparent',
    border: `1px solid ${isVisible ? extraBorder : 'transparent'}`,
    color: isVisible ? extraColor : 'transparent',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
    maxHeight: isVisible ? '64px' : '0px',
    maxWidth: isCompact ? '78px' : 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.25s ease, transform 0.25s ease, max-height 0.25s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease',
    pointerEvents: 'none',
    boxShadow: isVisible && isCompleted ? `0 0 10px ${completedColor}22` : 'none',
  })

  return (
    <div style={{ padding: isCompact ? '0.25rem 0 0.75rem' : '0.5rem 0 1rem' }}>
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
        height: trackHeight,
        background: 'var(--bg-hover)',
        borderRadius: '4px',
        marginTop: trackTopMargin,
        marginBottom: '0.75rem',
        marginLeft: trackSideMargin,
        marginRight: trackSideMargin,
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
            top: tickTop,
            width: '1px',
            height: tickHeight,
            background: 'rgba(255,255,255,0.08)',
          }} />
        ))}

        {/* Circles for each task */}
        {items.map((item, index) => {
          const isCompleted = completedIds.includes(item.id)
          const isHovered = hoveredId === item.id
          const isExpanded = activePointId === item.id
          const color = isCompleted ? getColor(index) : 'rgb(100, 116, 139)'
          const circleSize = isCompleted ? completedCircleSize : incompleteCircleSize

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${item.percent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: isHovered ? 15 : 10,
                cursor: 'pointer',
                
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActivePointId(prev => prev === item.id ? null : item.id)}
            >
              {/* Title badge above */}
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: labelMarginBottom,
                textAlign: 'center',
              }}>
                <span style={getLabelStyle(
                  isExpanded,
                  isCompleted,
                  color,
                  isCompleted ? 'rgba(0, 199, 129, 0.18)' : 'rgba(85, 99, 144, 0.29)',
                  isCompleted ? 'rgba(0,199,129,0.45)' : 'rgba(100,116,139,0.3)',
                  isCompleted ? '#00C781' : '#94a3b8'
                )}>
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
          cursor: 'pointer',
        }}>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: labelMarginBottom,
            textAlign: 'center',
          }}>
            <span style={getLabelStyle(
              activePointId === 'start',
              hasSigned,
              '#00C781',
              hasSigned ? 'rgba(0,199,129,0.18)' : 'rgba(100,116,139,0.18)',
              hasSigned ? 'rgba(0,199,129,0.45)' : 'rgba(100,116,139,0.35)',
              hasSigned ? '#00C781' : '#94a3b8'
            )}>
              {isRTL ? 'البداية' : 'Start'}
            </span>
          </div>
          <div style={{
            width: hasSigned ? '30px' : '15px',
            height: hasSigned ? '30px' : '15px',
            borderRadius: '50%',
            background: hasSigned ? '#00C781' : 'rgb(100, 116, 139)',
            border: `2.5px solid ${hasSigned ? '#00C781' : 'rgb(100, 116, 139)'}`,
            boxShadow: hasSigned ? '0 0 14px rgba(0,199,129,0.4)' : '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
            transition: 'all 0.3s ease',
          }}>
            {hasSigned && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>

        {/* Fixed "Finish" circle at 100% — always visible */}
        <div style={{
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          cursor: 'pointer',
        }}>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: labelMarginBottom,
            textAlign: 'center',
          }}>
            <span style={getLabelStyle(
              activePointId === 'finish',
              isFinished,
              '#FFD700',
              isFinished ? 'rgba(255,215,0,0.15)' : 'rgba(100,116,139,0.18)',
              isFinished ? 'rgba(255,215,0,0.45)' : 'rgba(100,116,139,0.35)',
              isFinished ? '#FFD700' : '#94a3b8'
            )}>
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

// ── Deadline Timeline Bar ────────────────────────────────────────────────────
function DeadlineTimeline({
  startDate,
  duration,
  statusChanges,
  currentStatus,
  isRTL,
}: {
  startDate: string | null
  duration: number
  statusChanges: StatusChange[]
  currentStatus: string
  isRTL: boolean
}) {
  if (!startDate || !duration) return null

  const now = new Date()
  const start = new Date(startDate)

  // Sort status_changes by timestamp ascending
  const sorted = [...statusChanges].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Calculate total active (working) days elapsed
  let activeDays = 0
  const isActiveStatus = (s: string) => s === 'active'

  if (sorted.length === 0) {
    if (isActiveStatus(currentStatus)) {
      const diffMs = now.getTime() - start.getTime()
      activeDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24))
    }
  } else {
    // Project starts as active from start_date until first status change
    let prevStatus = 'active'
    let prevTime = start

    for (const change of sorted) {
      const changeTime = new Date(change.timestamp)
      if (isActiveStatus(prevStatus)) {
        const diffMs = changeTime.getTime() - prevTime.getTime()
        activeDays += Math.max(0, diffMs / (1000 * 60 * 60 * 24))
      }
      prevStatus = change.status
      prevTime = changeTime
    }

    // Account for time from last status change to now
    if (isActiveStatus(prevStatus)) {
      const diffMs = now.getTime() - prevTime.getTime()
      activeDays += Math.max(0, diffMs / (1000 * 60 * 60 * 24))
    }
  }

  const activeDaysRounded = Math.floor(activeDays)
  const remainingDays = Math.max(0, duration - activeDaysRounded)
  const percent = Math.min(100, (activeDaysRounded / duration) * 100)
  const isOverdue = activeDaysRounded >= duration
  const isCompleted = currentStatus === 'completed'
  const isPaused = currentStatus === 'onhold' || currentStatus === 'pending' || currentStatus === 'cancelled'

  let barColor = '#0070F3'
  let barGlow = 'rgba(0, 112, 243, 0.3)'
  if (isCompleted) {
    barColor = '#00C781'
    barGlow = 'rgba(0, 199, 129, 0.3)'
  } else if (isOverdue) {
    barColor = '#FF4444'
    barGlow = 'rgba(255, 68, 68, 0.3)'
  } else if (percent > 75) {
    barColor = '#FF8C00'
    barGlow = 'rgba(255, 140, 0, 0.3)'
  }

  return (
    <div style={{ padding: '0.75rem 0 0.25rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dim)' }}>
          {isRTL ? '⏱ الموعد النهائي' : '⏱ Deadline'}
        </span>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: isCompleted ? '#00C781' : isOverdue ? '#FF4444' : isPaused ? '#94a3b8' : barColor,
        }}>
          {isCompleted
            ? (isRTL ? '✓ اكتمل' : '✓ Completed')
            : isOverdue
              ? (isRTL ? `⚠ تجاوز الموعد بـ ${activeDaysRounded - duration} يوم` : `⚠ Overdue by ${activeDaysRounded - duration} days`)
              : isPaused
                ? (isRTL ? `⏸ متوقف — متبقي ${remainingDays} يوم` : `⏸ Paused — ${remainingDays} days left`)
                : (isRTL ? `متبقي ${remainingDays} يوم من ${duration}` : `${remainingDays} of ${duration} days left`)}
        </span>
      </div>

      {/* Bar */}
      <div style={{
        position: 'relative',
        height: '10px',
        background: 'var(--bg-hover)',
        borderRadius: '5px',
        overflow: 'hidden',
        marginLeft: '1rem',
        marginRight: '1rem',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${Math.min(percent, 100)}%`,
          background: isCompleted
            ? 'linear-gradient(90deg, #0070F3, #00C781)'
            : isOverdue
              ? 'linear-gradient(90deg, #FF8C00, #FF4444)'
              : `linear-gradient(90deg, ${barColor}99, ${barColor})`,
          borderRadius: '5px',
          boxShadow: `0 0 8px ${barGlow}`,
          transition: 'width 0.6s ease, background 0.4s ease',
        }} />

        {[25, 50, 75].map(tick => (
          <div key={tick} style={{
            position: 'absolute',
            left: `${tick}%`,
            top: 0,
            width: '1px',
            height: '100%',
            background: 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>

      {/* Scale labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '4px',
        marginLeft: '1rem',
        marginRight: '1rem',
        fontSize: '0.68rem',
        color: 'var(--text-dim)',
        opacity: 0.6,
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        <span>{isRTL ? 'البداية' : 'Start'}</span>
        <span>{Math.round(duration / 2)} {isRTL ? 'يوم' : 'd'}</span>
        <span>{duration} {isRTL ? 'يوم' : 'd'}</span>
      </div>

      {/* Detail chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '6px',
        flexWrap: 'wrap',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 8px',
          borderRadius: '6px',
          background: 'rgba(0,112,243,0.1)',
          border: '1px solid rgba(0,112,243,0.2)',
          color: '#0070F3',
        }}>
          {isRTL ? `أيام العمل: ${activeDaysRounded}` : `Worked: ${activeDaysRounded}d`}
        </span>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 8px',
          borderRadius: '6px',
          background: isOverdue ? 'rgba(255,68,68,0.1)' : 'rgba(0,199,129,0.1)',
          border: `1px solid ${isOverdue ? 'rgba(255,68,68,0.2)' : 'rgba(0,199,129,0.2)'}`,
          color: isOverdue ? '#FF4444' : '#00C781',
        }}>
          {isRTL ? `المتبقي: ${remainingDays}` : `Left: ${remainingDays}d`}
        </span>
        {isPaused && (
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(148,163,184,0.1)',
            border: '1px solid rgba(148,163,184,0.2)',
            color: '#94a3b8',
          }}>
            {isRTL ? '⏸ المؤقت متوقف' : '⏸ Timer paused'}
          </span>
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

const DEFAULT_PROJECT_MEDIA = (isRTL: boolean): ProjectMediaItem[] => [
  {
    id: 'demo-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    caption: isRTL ? 'مراجعة تصميم لوحة التحكم' : 'Dashboard wireframe review',
    uploaded_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'demo-vid-1',
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
    caption: isRTL ? 'عرض تجريبي للصفحة الرئيسية' : 'Homepage prototype walkthrough',
    uploaded_at: '2025-03-14T14:30:00Z',
  },
  {
    id: 'demo-img-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    caption: isRTL ? 'تقدم ربط واجهة البرمجة' : 'Backend API integration progress',
    uploaded_at: '2025-03-18T09:15:00Z',
  },
  {
    id: 'demo-img-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=80',
    caption: isRTL ? 'تصميم متجاوب للجوال' : 'Mobile responsive layout',
    uploaded_at: '2025-03-22T16:45:00Z',
  },
  {
    id: 'demo-vid-2',
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    caption: isRTL ? 'عرض تجريبي — وحدة الدفع' : 'User flow demo — checkout module',
    uploaded_at: '2025-03-25T11:20:00Z',
  },
  {
    id: 'demo-img-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    caption: isRTL ? 'لوحة التحليلات — آخر إصدار' : 'Analytics panel — latest build',
    uploaded_at: '2025-03-28T13:00:00Z',
  },
]

function getProjectMedia(project: ProjectType, isRTL: boolean): ProjectMediaItem[] {
  const stored = loadProjectMedia(project.id, project.media_updates)
  if (stored.length > 0) return stored
  if (project.status === 'active') return DEFAULT_PROJECT_MEDIA(isRTL)
  return []
}

function formatMediaDate(dateStr: string, isRTL: boolean): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ProjectMediaGallery({
  items,
  isRTL,
}: {
  items: ProjectMediaItem[]
  isRTL: boolean
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isOpen = lightboxIndex !== null
  const currentItem = isOpen ? items[lightboxIndex] : null

  const goPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? items.length - 1 : lightboxIndex - 1)
  }

  const goNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === items.length - 1 ? 0 : lightboxIndex + 1)
  }

  const closeLightbox = () => setLightboxIndex(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null)
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => {
          if (prev === null) return null
          return isRTL
            ? (prev === items.length - 1 ? 0 : prev + 1)
            : (prev === 0 ? items.length - 1 : prev - 1)
        })
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => {
          if (prev === null) return null
          return isRTL
            ? (prev === 0 ? items.length - 1 : prev - 1)
            : (prev === items.length - 1 ? 0 : prev + 1)
        })
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isRTL, items.length])

  useEffect(() => {
    if (currentItem?.type === 'video' && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [currentItem?.id, currentItem?.type])

  if (items.length === 0) return null

  return (
    <>
      <div style={{
        marginTop: '16px',
        marginBottom: '16px',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dim)' }}>
            {isRTL ? '📸 آخر التطورات البصرية' : '📸 Visual Progress Updates'}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', opacity: 0.7 }}>
            {items.length} {isRTL ? 'ملف' : 'items'}
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '6px',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
          flexWrap: 'wrap',
        }}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={item.caption || (item.type === 'video' ? 'Video' : 'Image')}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: '52px',
                height: '52px',
                padding: 0,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,112,243,0.5)'
                e.currentTarget.style.transform = 'scale(1.06)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,112,243,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.caption || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <>
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.caption || ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.45)',
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#0070F3">
                        <polygon points="2,1 7,4 2,7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>

        <p style={{
          margin: '8px 0 0',
          fontSize: '0.68rem',
          color: 'var(--text-dim)',
          opacity: 0.65,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {isRTL
            ? 'اضغط على أي صورة أو فيديو لعرضها بحجم كامل'
            : 'Click any thumbnail to view full size'}
        </p>
      </div>

      {isOpen && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isRTL ? 'عرض الوسائط' : 'Media viewer'}
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label={isRTL ? 'إغلاق' : 'Close'}
            style={{
              position: 'absolute',
              top: '20px',
              right: isRTL ? 'auto' : '20px',
              left: isRTL ? '20px' : 'auto',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            onClick={e => { e.stopPropagation(); goPrev() }}
            aria-label={isRTL ? 'السابق' : 'Previous'}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: isRTL ? 'auto' : '16px',
              right: isRTL ? '16px' : 'auto',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,112,243,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isRTL ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
            </svg>
          </button>

          <button
            type="button"
            onClick={e => { e.stopPropagation(); goNext() }}
            aria-label={isRTL ? 'التالي' : 'Next'}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              right: isRTL ? 'auto' : '16px',
              left: isRTL ? '16px' : 'auto',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,112,243,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isRTL ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
            </svg>
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 'min(900px, 92vw)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {currentItem.type === 'image' ? (
              <img
                src={currentItem.url}
                alt={currentItem.caption || ''}
                style={{
                  maxWidth: '100%',
                  maxHeight: '72vh',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={currentItem.url}
                controls
                playsInline
                style={{
                  maxWidth: '100%',
                  maxHeight: '72vh',
                  borderRadius: '12px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  background: '#000',
                }}
              />
            )}

            <div style={{
              textAlign: 'center',
              color: '#fff',
              maxWidth: '600px',
            }}>
              {currentItem.caption && (
                <p style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 500 }}>
                  {currentItem.caption}
                </p>
              )}
              <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.6 }}>
                {formatMediaDate(currentItem.uploaded_at, isRTL)}
                {' · '}
                {(lightboxIndex ?? 0) + 1} / {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const ProjectOverview: FC<{ projectId?: string }> = ({ projectId }) => {
  const { t, language } = useLanguage()
  const { user } = useGlobalAuth()
  const router = useRouter()
  const isRTL = language === 'ar'

  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's projects on mount (or single project if projectId is provided)
  useEffect(() => {
    async function fetchProjects() {
      console.log('🔍 ProjectOverview - Attempting to fetch projects...')
      console.log('👤 User:', user)
      console.log('🔑 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING')

      // if (!user) {
      //   console.warn('⚠️ No user found, skipping project fetch')
      //   setLoading(false)
      //   return
      // }

      try {
        setLoading(true)
        setError(null)

        if (projectId) {
          console.log(`📡 Fetching single project: ${projectId}`)
          const response = await getProjectById(projectId)
          console.log('📦🙌🙌🙌🙌🙌 API Response:', response)
          if (response.success && response.data) {
            console.log(`✅ Successfully loaded project: ${response.data.name}`)
            setProjects(Array.isArray(response.data) ? response.data : [response.data])
          } else {
            console.error('❌ API returned success=false or no data:', response)
            setError(isRTL ? 'فشل في تحميل المشروع' : 'Failed to load project')
          }
        } else {
          console.log(`📡 Fetching projects for current user`)
          const response = await getMyProjects()
          console.log('📦 API Response:', response)
          if (response.success && response.data) {
            console.log(`✅ Successfully loaded ${response.data.length} projects`)
            setProjects(Array.isArray(response.data) ? response.data : [response.data])
          } else {
            console.error('❌ API returned success=false or no data:', response)
            setError(isRTL ? 'فشل في تحميل المشاريع' : 'Failed to load projects')
          }
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
  }, [user, isRTL, projectId])

  const getStatusColor = (status: ProjectType['status']) => {
    switch (status) {
      case 'completed': return '#00C781'
      case 'active': return '#0070F3'
      case 'pending': return '#FF8C00'
      case 'onhold': return '#666'
      case 'cancelled': return '#FF4444'
      default: return '#666'
    }
  }

  const getStatusText = (status: ProjectType['status']) => {
    const statusMap: Record<string, string> = {
      active: isRTL ? 'قيد التطوير' : 'In Development',
      completed: isRTL ? 'مكتمل' : 'Completed',
      pending: isRTL ? 'قيد الانتظار' : 'Pending',
      onhold: isRTL ? 'متوقف' : 'On Hold',
      cancelled: isRTL ? 'ملغى' : 'Cancelled',
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
          console.log('📊😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️ Rendering project:', project)
          const overallProgress = calculateOverallProgress(project.progress || [])
          const milestones = getMilestones(project)
          const projectMedia = getProjectMedia(project, isRTL)
          
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
                    style={{ marginInlineStart: 'auto' }}
                    aria-label={isRTL ? 'توقيع' : 'Sign'}
                    onClick={() => router.push(`/dashboard/contract/${project.id}`)}
                  >
                    Sign
                  </button>
                </div>
              )}

              {/* Status reason notice — show when project is on-hold or cancelled */}
              {(project.status === 'onhold' || project.status === 'cancelled') && (() => {
                const lastChange = [...(project.status_changes || [])]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .find(c => c.status === project.status)
                if (!lastChange?.reason) return null
                const isCancelled = project.status === 'cancelled'
                return (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: isCancelled ? 'rgba(255, 68, 68, 0.08)' : 'rgba(148, 163, 184, 0.08)',
                    border: `1px solid ${isCancelled ? 'rgba(255, 68, 68, 0.25)' : 'rgba(148, 163, 184, 0.25)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    direction: isRTL ? 'rtl' : 'ltr',
                  }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
                      {isCancelled ? '🚫' : '⏸️'}
                    </span>
                    <div>
                      <span style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: isCancelled ? '#FF4444' : '#94a3b8',
                        marginBottom: '2px',
                      }}>
                        {isCancelled
                          ? (isRTL ? 'سبب الإلغاء' : 'Cancellation Reason')
                          : (isRTL ? 'سبب الإيقاف' : 'On-Hold Reason')}
                      </span>
                      <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-white)',
                        lineHeight: '1.5',
                      }}>
                        {lastChange.reason}
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* Progress Line Bar */}
              {project.progress && project.progress.length > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <ReadOnlyProgressBar
                    items={project.progress}
                    completedIds={project.progress_completed || []}
                    isRTL={isRTL}
                    isFinished={project.status === 'completed'}
                    hasSigned={project.has_signed}
                  />
                </div>
              )}

              {/* Deadline Timeline */}
              {project.start_date && project.duration > 0 && (
                <div style={{
                  marginTop: project.progress && project.progress.length > 0 ? '0' : '20px',
                  marginBottom: '16px',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <DeadlineTimeline
                    startDate={project.start_date}
                    duration={project.duration}
                    statusChanges={project.status_changes || []}
                    currentStatus={project.status}
                    isRTL={isRTL}
                  />
                </div>
              )}

              {/* Visual progress updates — images & videos from admin */}
              {projectMedia.length > 0 && (
                <ProjectMediaGallery items={projectMedia} isRTL={isRTL} />
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
                  <span className={styles.statLabel}>{isRTL ? 'المدة' : 'Duration'}</span>
                  <span className={styles.statValue}>
                    {project.duration ? `${project.duration} ${isRTL ? 'يوم' : 'days'}` : '-'}
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


                <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => router.push(`/dashboard/contract/${project.id}`)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: '1px solid rgba(20, 184, 166, 0.35)',
                      background: 'rgba(20, 184, 166, 0.1)',
                      color: '#14b8a6',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(20,184,166,0.2)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(20,184,166,0.6)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(20,184,166,0.1)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(20,184,166,0.35)'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {isRTL ? 'عرض العقد' : 'View Contract'}
                  </button>
                </div>
                
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default ProjectOverview