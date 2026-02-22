'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage'
import { useGlobalAuth } from '@/lib/auth-context'
import {
  BarChartIcon,
  FolderPlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
} from '@/components/UI/ControllerIcons'
import styles from '../controllers/Controllers.module.css'
import {
  type Project,
  type ProgressItem,
  type ProjectStatistics,
  type CreateProjectPayload,
  type UpdateProjectPayload,
  type GetProjectsParams,
  getAllProjects,
  getProjectStatistics,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProgressItem,
  updateProgressItem,
  removeProgressItem,
  markProgressCompleted,
  unmarkProgressCompleted,
} from './apiFunctions'

// ==================== Helper Components ====================

function StatusBadge({ status, isRTL }: { status: string; isRTL: boolean }) {
  const colors: Record<string, string> = {
    active: '#00C781',
    pending: '#FF8C00',
    completed: '#0070F3',
    onhold: '#94a3b8',
  }
  const labels: Record<string, { ar: string; en: string }> = {
    active: { ar: 'نشط', en: 'Active' },
    pending: { ar: 'معلق', en: 'Pending' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    onhold: { ar: 'متوقف', en: 'On Hold' },
  }
  return (
    <span
      className={styles.badge}
      style={{ background: colors[status] || '#666', fontSize: '0.75rem' }}
    >
      {isRTL ? labels[status]?.ar : labels[status]?.en}
    </span>
  )
}

function PriorityBadge({ priority, isRTL }: { priority: string; isRTL: boolean }) {
  const colors: Record<string, string> = {
    urgent: '#FF4444',
    high: '#FF8C00',
    medium: '#0070F3',
    low: '#00C781',
  }
  const labels: Record<string, { ar: string; en: string }> = {
    urgent: { ar: 'عاجل', en: 'Urgent' },
    high: { ar: 'عالي', en: 'High' },
    medium: { ar: 'متوسط', en: 'Medium' },
    low: { ar: 'منخفض', en: 'Low' },
  }
  return (
    <span
      className={styles.badge}
      style={{ background: colors[priority] || '#666', fontSize: '0.75rem' }}
    >
      {isRTL ? labels[priority]?.ar : labels[priority]?.en}
    </span>
  )
}

// ==================== Main Component ====================

function ProjectsContent() {
  const router = useRouter()
  const { t, language, setLanguage, dir } = useLanguage()
  const { user, isAuthenticated, isLoading, isAdmin, logout } = useGlobalAuth()
  const isRTL = language === 'ar'

  // Data state
  const [projects, setProjects] = useState<Project[]>([])
  const [statistics, setStatistics] = useState<ProjectStatistics['data'] | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Pagination & filter state
  const [offset, setOffset] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const LIMIT = 12

  // UI state
  const [activeView, setActiveView] = useState<'grid' | 'table'>('grid')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newPriority, setNewPriority] = useState<Project['priority']>('medium')
  const [newStatus, setNewStatus] = useState<Project['status']>('pending')

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editSpent, setEditSpent] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editPriority, setEditPriority] = useState<Project['priority']>('medium')
  const [editStatus, setEditStatus] = useState<Project['status']>('pending')

  // Progress form state (for viewing project detail)
  const [newProgressTitle, setNewProgressTitle] = useState('')
  const [newProgressId, setNewProgressId] = useState('')

  // ==================== Data Fetching ====================

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: GetProjectsParams = { limit: LIMIT, offset }
      if (searchTerm) params.search = searchTerm
      else if (filterStatus) params.status = filterStatus as any
      else if (filterPriority) params.priority = filterPriority as any

      const res = await getAllProjects(params)
      if (res.success) {
        setProjects(res.data)
        setTotalCount(res.count)
      }
    } catch (err) {
      setError(isRTL ? 'فشل في تحميل المشاريع' : 'Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [offset, searchTerm, filterStatus, filterPriority, isRTL])

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await getProjectStatistics()
      if (res.success) {
        setStatistics(res.data)
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  // Show success message then clear
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Refresh data after mutation
  const refreshData = async () => {
    await Promise.all([fetchProjects(), fetchStatistics()])
  }

  // ==================== Search / Filter Handlers ====================

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilterStatus('')
    setFilterPriority('')
    setOffset(0)
  }

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status)
    setSearchTerm('')
    setFilterPriority('')
    setOffset(0)
  }

  const handlePriorityFilter = (priority: string) => {
    setFilterPriority(priority)
    setSearchTerm('')
    setFilterStatus('')
    setOffset(0)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('')
    setFilterPriority('')
    setOffset(0)
  }

  // ==================== CRUD Handlers ====================

  const handleCreateProject = async () => {
    if (!newName || !newUserId || !newPrice || !newDeadline) return
    try {
      setActionLoading(true)
      const payload: CreateProjectPayload = {
        name: newName,
        user_id: newUserId,
        price: parseFloat(newPrice),
        deadline: new Date(newDeadline).toISOString(),
        priority: newPriority,
        status: newStatus,
      }
      const res = await createProject(payload)
      if (res.success) {
        showSuccess(isRTL ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully')
        setShowCreateForm(false)
        resetCreateForm()
        await refreshData()
      }
    } catch (err) {
      setError(isRTL ? 'فشل في إنشاء المشروع' : 'Failed to create project')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject) return
    try {
      setActionLoading(true)
      const payload: UpdateProjectPayload = {}
      if (editName !== editingProject.name) payload.name = editName
      if (parseFloat(editPrice) !== editingProject.price) payload.price = parseFloat(editPrice)
      if (parseFloat(editSpent) !== editingProject.spent) payload.spent = parseFloat(editSpent)
      if (editDeadline !== editingProject.deadline.split('T')[0]) payload.deadline = new Date(editDeadline).toISOString()
      if (editPriority !== editingProject.priority) payload.priority = editPriority
      if (editStatus !== editingProject.status) payload.status = editStatus

      if (Object.keys(payload).length === 0) {
        setEditingProject(null)
        return
      }

      const res = await updateProject(editingProject.id, payload)
      if (res.success) {
        showSuccess(isRTL ? 'تم تحديث المشروع بنجاح' : 'Project updated successfully')
        setEditingProject(null)
        await refreshData()
      }
    } catch (err) {
      setError(isRTL ? 'فشل في تحديث المشروع' : 'Failed to update project')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      setActionLoading(true)
      const res = await deleteProject(id)
      if (res.success) {
        showSuccess(isRTL ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully')
        setConfirmDelete(null)
        await refreshData()
      }
    } catch (err) {
      setError(isRTL ? 'فشل في حذف المشروع' : 'Failed to delete project')
    } finally {
      setActionLoading(false)
    }
  }

  // ==================== Progress Handlers ====================

  const handleAddProgress = async (projectId: string) => {
    if (!newProgressId || !newProgressTitle) return
    try {
      setActionLoading(true)
      const item: ProgressItem = { id: newProgressId, title: newProgressTitle, percent: 0 }
      const res = await addProgressItem(projectId, item)
      if (res.success) {
        showSuccess(isRTL ? 'تم إضافة المرحلة بنجاح' : 'Progress item added successfully')
        setNewProgressId('')
        setNewProgressTitle('')
        // Re-fetch the project detail
        const updated = await getProjectById(projectId)
        if (updated.success) setViewingProject(updated.data)
        await refreshData()
      }
    } catch (err) {
      setError(isRTL ? 'فشل في إضافة المرحلة' : 'Failed to add progress item')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateProgress = async (projectId: string, itemId: string, percent: number) => {
    try {
      setActionLoading(true)
      const res = await updateProgressItem(projectId, itemId, { percent })
      if (res.success) {
        const updated = await getProjectById(projectId)
        if (updated.success) setViewingProject(updated.data)
        await refreshData()
      }
    } catch (err) {
      console.error('Error updating progress:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveProgress = async (projectId: string, itemId: string) => {
    try {
      setActionLoading(true)
      const res = await removeProgressItem(projectId, itemId)
      if (res.success) {
        const updated = await getProjectById(projectId)
        if (updated.success) setViewingProject(updated.data)
        await refreshData()
      }
    } catch (err) {
      console.error('Error removing progress:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleProgressComplete = async (projectId: string, itemId: string, isCompleted: boolean) => {
    try {
      setActionLoading(true)
      const fn = isCompleted ? unmarkProgressCompleted : markProgressCompleted
      const res = await fn(projectId, itemId)
      if (res.success) {
        const updated = await getProjectById(projectId)
        if (updated.success) setViewingProject(updated.data)
        await refreshData()
      }
    } catch (err) {
      console.error('Error toggling progress completion:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // ==================== Helpers ====================

  const resetCreateForm = () => {
    setNewName('')
    setNewUserId('')
    setNewPrice('')
    setNewDeadline('')
    setNewPriority('medium')
    setNewStatus('pending')
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setEditName(project.name)
    setEditPrice(project.price.toString())
    setEditSpent(project.spent.toString())
    setEditDeadline(project.deadline.split('T')[0])
    setEditPriority(project.priority)
    setEditStatus(project.status)
  }

  const openViewModal = async (project: Project) => {
    try {
      const res = await getProjectById(project.id)
      if (res.success) {
        setViewingProject(res.data)
      } else {
        setViewingProject(project)
      }
    } catch {
      setViewingProject(project)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isRTL ? date.toLocaleDateString('ar-SA') : date.toLocaleDateString('en-US')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const computeOverallProgress = (project: Project) => {
    if (!project.progress || project.progress.length === 0) return 0
    const total = project.progress.reduce((sum, p) => sum + p.percent, 0)
    return Math.round(total / project.progress.length)
  }

  const totalPages = Math.ceil(totalCount / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  // ==================== Auth Gate ====================

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030014'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If not authenticated, return null (router will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  // If logged in but not an admin/owner, show access denied
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030014',
        flexDirection: 'column',
        gap: '1.5rem',
        color: '#fff',
        direction: dir,
        fontFamily: 'inherit',
      }}>
        <div style={{ fontSize: '4rem', opacity: 0.5 }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {isRTL ? 'لا تملك صلاحية الوصول' : 'Access Denied'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', textAlign: 'center', maxWidth: '400px' }}>
          {isRTL
            ? 'هذه الصفحة متاحة فقط للمسؤولين. يرجى تسجيل الدخول بحساب مسؤول.'
            : 'This page is only available for managers. Please log in with a manager account.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => { logout(); router.push('/login') }}
            style={{
              padding: '10px 24px', borderRadius: '10px',
              background: 'rgba(112, 66, 248, 0.15)', border: '1px solid rgba(112, 66, 248, 0.3)',
              color: '#b4a0f8', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit',
            }}
          >
            {isRTL ? 'تسجيل دخول بحساب آخر' : 'Login with different account'}
          </button>
          <a
            href="/"
            style={{
              padding: '10px 24px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'none', fontFamily: 'inherit',
            }}
          >
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </a>
        </div>
      </div>
    )
  }

  // ==================== Render ====================

  return (
    <div className={styles.controllersPage} style={{ direction: dir }}>
      {/* Success Toast */}
      {successMessage && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: 'linear-gradient(135deg, #00C781, #0070F3)', color: '#fff',
          padding: '12px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
          boxShadow: '0 8px 30px rgba(0, 199, 129, 0.3)', animation: 'fadeIn 0.3s ease',
        }}>
          {successMessage}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: 'linear-gradient(135deg, #FF4444, #FF8C00)', color: '#fff',
          padding: '12px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
          boxShadow: '0 8px 30px rgba(255, 68, 68, 0.3)', animation: 'fadeIn 0.3s ease',
          cursor: 'pointer',
        }} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isRTL ? 'إدارة المشاريع' : 'Project Management'}
          </h1>
          <p className={styles.subtitle}>
            {isRTL ? 'إدارة شاملة لجميع المشاريع والمراحل' : 'Comprehensive management for all projects and phases'}
          </p>
        </div>
        <div className={styles.headerActions}>
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              fontSize: '0.85rem', color: '#94a3b8',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C781', display: 'inline-block' }} />
              <span style={{ color: '#fff', fontWeight: 600 }}>{user.display_name || user.first_name || user.email}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ color: '#0070F3', fontWeight: 600 }}>{isRTL ? 'مسؤول' : 'Manager'}</span>
            </div>
          )}
          <button className={styles.languageBtn} onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            className={styles.languageBtn}
            onClick={() => { logout() }}
            style={{ background: 'rgba(255, 68, 68, 0.1)', borderColor: 'rgba(255, 68, 68, 0.2)', color: '#ff6b6b' }}
          >
            {isRTL ? 'خروج' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #0070F3, #00C781)' }}>
              <BarChartIcon size={28} />
            </div>
            <div className={styles.statInfo}>
              <h3>{statistics.total}</h3>
              <p>{isRTL ? 'إجمالي المشاريع' : 'Total Projects'}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #00C781, #27D9F5)' }}>
              <BarChartIcon size={28} />
            </div>
            <div className={styles.statInfo}>
              <h3>{statistics.byStatus.active}</h3>
              <p>{isRTL ? 'المشاريع النشطة' : 'Active Projects'}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FF8C00, #FF0080)' }}>
              <BarChartIcon size={28} />
            </div>
            <div className={styles.statInfo}>
              <h3>{statistics.byStatus.pending}</h3>
              <p>{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #9B59B6, #7042F8)' }}>
              <BarChartIcon size={28} />
            </div>
            <div className={styles.statInfo}>
              <h3>{statistics.byStatus.completed}</h3>
              <p>{isRTL ? 'المكتملة' : 'Completed'}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
              <BarChartIcon size={28} />
            </div>
            <div className={styles.statInfo}>
              <h3>{statistics.byStatus.onhold}</h3>
              <p>{isRTL ? 'المتوقفة' : 'On Hold'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: Search + Filters + Actions */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
        marginBottom: '2rem', padding: '1rem',
        background: 'rgba(10, 10, 15, 0.4)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '20px', backdropFilter: 'blur(16px)',
      }}>
        {/* Search */}
        <input
          type="text"
          className={styles.searchInput}
          placeholder={isRTL ? 'البحث عن مشروع...' : 'Search projects...'}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ minWidth: '220px', flex: 1 }}
        />

        {/* Status Filter */}
        <select
          className={styles.formInput}
          value={filterStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
          <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
          <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
          <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
          <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
        </select>

        {/* Priority Filter */}
        <select
          className={styles.formInput}
          value={filterPriority}
          onChange={(e) => handlePriorityFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="">{isRTL ? 'جميع الأولويات' : 'All Priorities'}</option>
          <option value="low">{isRTL ? 'منخفض' : 'Low'}</option>
          <option value="medium">{isRTL ? 'متوسط' : 'Medium'}</option>
          <option value="high">{isRTL ? 'عالي' : 'High'}</option>
          <option value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</option>
        </select>

        {(searchTerm || filterStatus || filterPriority) && (
          <button className={styles.secondaryBtn} onClick={clearFilters} style={{ padding: '0.65rem 1.25rem' }}>
            {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
          </button>
        )}

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '4px', marginInlineStart: 'auto' }}>
          <button
            className={styles.languageBtn}
            style={{
              padding: '0.5rem 0.8rem', fontSize: '1.1rem',
              ...(activeView === 'grid' ? { background: 'rgba(112, 66, 248, 0.2)', borderColor: '#7042f8' } : {}),
            }}
            onClick={() => setActiveView('grid')}
          >
            ▦
          </button>
          <button
            className={styles.languageBtn}
            style={{
              padding: '0.5rem 0.8rem', fontSize: '1.1rem',
              ...(activeView === 'table' ? { background: 'rgba(112, 66, 248, 0.2)', borderColor: '#7042f8' } : {}),
            }}
            onClick={() => setActiveView('table')}
          >
            ☰
          </button>
        </div>

        {/* Create Button */}
        <button className={styles.primaryBtn} onClick={() => setShowCreateForm(true)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderPlusIcon size={18} />
            {isRTL ? 'مشروع جديد' : 'New Project'}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid rgba(112, 66, 248, 0.2)',
              borderTopColor: '#7042f8', borderRadius: '50%', margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>📁</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>
              {isRTL ? 'لا توجد مشاريع' : 'No Projects Found'}
            </h3>
            <p>{isRTL ? 'أنشئ مشروعك الأول للبدء' : 'Create your first project to get started'}</p>
            <button
              className={styles.primaryBtn}
              style={{ marginTop: '1.5rem' }}
              onClick={() => setShowCreateForm(true)}
            >
              {isRTL ? 'إنشاء مشروع' : 'Create Project'}
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && projects.length > 0 && activeView === 'grid' && (
          <div className={styles.projectsGrid}>
            {projects.map((project) => {
              const overallProgress = computeOverallProgress(project)
              return (
                <div key={project.id} className={styles.projectCard}>
                  <div className={styles.projectCardHeader}>
                    <h3>{project.name}</h3>
                    <StatusBadge status={project.status} isRTL={isRTL} />
                  </div>

                  <p className={styles.projectClient}>
                    <PriorityBadge priority={project.priority} isRTL={isRTL} />
                    <span style={{ marginInlineStart: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {formatDate(project.deadline)}
                    </span>
                  </p>

                  {/* Progress Bar */}
                  <div className={styles.projectProgress}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {isRTL ? 'التقدم' : 'Progress'}
                      </span>
                      <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                        {overallProgress}%
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${overallProgress}%` }} />
                    </div>
                  </div>

                  {/* Budget Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    <span>{isRTL ? 'الميزانية' : 'Budget'}: <span style={{ color: '#00C781' }}>{formatCurrency(project.price)}</span></span>
                    <span>{isRTL ? 'المصروف' : 'Spent'}: <span style={{ color: '#FF8C00' }}>{formatCurrency(project.spent)}</span></span>
                  </div>

                  {/* Footer Actions */}
                  <div className={styles.projectFooter}>
                    <div className={styles.teamInfo}>
                      👥 {project.team.length} {isRTL ? 'أعضاء' : 'members'}
                    </div>
                    <div className={styles.actionButtons}>
                      <button className={styles.iconBtn} onClick={() => openViewModal(project)} title={isRTL ? 'عرض' : 'View'}>
                        <EyeIcon size={16} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => openEditModal(project)} title={isRTL ? 'تعديل' : 'Edit'}>
                        <EditIcon size={16} />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => setConfirmDelete(project.id)}
                        title={isRTL ? 'حذف' : 'Delete'}
                        style={{ color: '#ff6b6b' }}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Table View */}
        {!loading && projects.length > 0 && activeView === 'table' && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{isRTL ? 'اسم المشروع' : 'Project Name'}</th>
                  <th>{isRTL ? 'الحالة' : 'Status'}</th>
                  <th>{isRTL ? 'الأولوية' : 'Priority'}</th>
                  <th>{isRTL ? 'التقدم' : 'Progress'}</th>
                  <th>{isRTL ? 'الميزانية' : 'Budget'}</th>
                  <th>{isRTL ? 'المصروف' : 'Spent'}</th>
                  <th>{isRTL ? 'الموعد النهائي' : 'Deadline'}</th>
                  <th>{isRTL ? 'الفريق' : 'Team'}</th>
                  <th>{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const overallProgress = computeOverallProgress(project)
                  return (
                    <tr key={project.id}>
                      <td style={{ fontWeight: 600 }}>{project.name}</td>
                      <td><StatusBadge status={project.status} isRTL={isRTL} /></td>
                      <td><PriorityBadge priority={project.priority} isRTL={isRTL} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${overallProgress}%`, height: '100%', background: 'linear-gradient(90deg, #7042f8, #00c6ff)', borderRadius: '10px' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem' }}>{overallProgress}%</span>
                        </div>
                      </td>
                      <td style={{ color: '#00C781' }}>{formatCurrency(project.price)}</td>
                      <td style={{ color: '#FF8C00' }}>{formatCurrency(project.spent)}</td>
                      <td>{formatDate(project.deadline)}</td>
                      <td>👥 {project.team.length}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.iconBtn} onClick={() => openViewModal(project)}><EyeIcon size={16} /></button>
                          <button className={styles.iconBtn} onClick={() => openEditModal(project)}><EditIcon size={16} /></button>
                          <button className={styles.iconBtn} onClick={() => setConfirmDelete(project.id)} style={{ color: '#ff6b6b' }}><TrashIcon size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
            marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <button
              className={styles.secondaryBtn}
              disabled={currentPage <= 1}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              style={{ opacity: currentPage <= 1 ? 0.3 : 1, padding: '0.6rem 1.2rem' }}
            >
              {isRTL ? 'السابق' : 'Previous'}
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {isRTL ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              className={styles.secondaryBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setOffset(offset + LIMIT)}
              style={{ opacity: currentPage >= totalPages ? 0.3 : 1, padding: '0.6rem 1.2rem' }}
            >
              {isRTL ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* ==================== Create Project Modal ==================== */}
      {showCreateForm && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>
                {isRTL ? 'إنشاء مشروع جديد' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'اسم المشروع *' : 'Project Name *'}</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isRTL ? 'أدخل اسم المشروع' : 'Enter project name'}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'معرف المستخدم (UUID) *' : 'User ID (UUID) *'}</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'السعر (ر.س) *' : 'Price (SAR) *'}</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'الموعد النهائي *' : 'Deadline *'}</label>
                <input
                  className={styles.formInput}
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'الأولوية' : 'Priority'}</label>
                <select
                  className={styles.formInput}
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Project['priority'])}
                >
                  <option value="low">{isRTL ? 'منخفض' : 'Low'}</option>
                  <option value="medium">{isRTL ? 'متوسط' : 'Medium'}</option>
                  <option value="high">{isRTL ? 'عالي' : 'High'}</option>
                  <option value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'الحالة' : 'Status'}</label>
                <select
                  className={styles.formInput}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Project['status'])}
                >
                  <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                  <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                  <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                  <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className={styles.secondaryBtn} onClick={() => { setShowCreateForm(false); resetCreateForm() }}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleCreateProject}
                disabled={actionLoading || !newName || !newUserId || !newPrice || !newDeadline}
                style={{ opacity: actionLoading || !newName || !newUserId || !newPrice || !newDeadline ? 0.5 : 1 }}
              >
                {actionLoading ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء المشروع' : 'Create Project')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Edit Project Modal ==================== */}
      {editingProject && (
        <div className={styles.modalOverlay} onClick={() => setEditingProject(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>
                {isRTL ? 'تعديل المشروع' : 'Edit Project'}
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'اسم المشروع' : 'Project Name'}</label>
                <input className={styles.formInput} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'السعر (ر.س)' : 'Price (SAR)'}</label>
                <input className={styles.formInput} type="number" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'المصروف (ر.س)' : 'Spent (SAR)'}</label>
                <input className={styles.formInput} type="number" min="0" value={editSpent} onChange={(e) => setEditSpent(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'الموعد النهائي' : 'Deadline'}</label>
                <input className={styles.formInput} type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'الأولوية' : 'Priority'}</label>
                <select className={styles.formInput} value={editPriority} onChange={(e) => setEditPriority(e.target.value as Project['priority'])}>
                  <option value="low">{isRTL ? 'منخفض' : 'Low'}</option>
                  <option value="medium">{isRTL ? 'متوسط' : 'Medium'}</option>
                  <option value="high">{isRTL ? 'عالي' : 'High'}</option>
                  <option value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{isRTL ? 'الحالة' : 'Status'}</label>
                <select className={styles.formInput} value={editStatus} onChange={(e) => setEditStatus(e.target.value as Project['status'])}>
                  <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                  <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                  <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                  <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className={styles.secondaryBtn} onClick={() => setEditingProject(null)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleUpdateProject}
                disabled={actionLoading}
                style={{ opacity: actionLoading ? 0.5 : 1 }}
              >
                {actionLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التعديلات' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== View Project Detail Modal ==================== */}
      {viewingProject && (
        <div className={styles.modalOverlay} onClick={() => setViewingProject(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>
                {viewingProject.name}
              </h2>
              <button
                onClick={() => setViewingProject(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Project Info */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
              marginBottom: '2rem', padding: '1.25rem',
              background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الحالة' : 'Status'}
                </span>
                <StatusBadge status={viewingProject.status} isRTL={isRTL} />
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الأولوية' : 'Priority'}
                </span>
                <PriorityBadge priority={viewingProject.priority} isRTL={isRTL} />
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الميزانية' : 'Budget'}
                </span>
                <span style={{ color: '#00C781', fontWeight: 700 }}>{formatCurrency(viewingProject.price)}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'المصروف' : 'Spent'}
                </span>
                <span style={{ color: '#FF8C00', fontWeight: 700 }}>{formatCurrency(viewingProject.spent)}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الموعد النهائي' : 'Deadline'}
                </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{formatDate(viewingProject.deadline)}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الفريق' : 'Team'}
                </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>👥 {viewingProject.team.length} {isRTL ? 'أعضاء' : 'members'}</span>
              </div>
            </div>

            {/* Progress Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '20px', background: '#7042f8', borderRadius: '2px', display: 'inline-block' }} />
                {isRTL ? 'مراحل التقدم' : 'Progress Phases'}
              </h3>

              {viewingProject.progress.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {isRTL ? 'لا توجد مراحل مضافة بعد' : 'No progress phases added yet'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {viewingProject.progress.map((item) => {
                    const isCompleted = viewingProject.progress_completed.includes(item.id)
                    return (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                        background: isCompleted ? 'rgba(0, 199, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isCompleted ? 'rgba(0, 199, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '12px', flexWrap: 'wrap',
                      }}>
                        {/* Toggle Complete */}
                        <button
                          onClick={() => handleToggleProgressComplete(viewingProject.id, item.id, isCompleted)}
                          disabled={actionLoading}
                          style={{
                            width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer',
                            background: isCompleted ? '#00C781' : 'transparent',
                            border: isCompleted ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? '✓' : ''}
                        </button>

                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {item.title}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginInlineStart: '8px' }}>
                            ({item.id})
                          </span>
                        </div>

                        {/* Progress Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={item.percent}
                            onChange={(e) => handleUpdateProgress(viewingProject.id, item.id, parseInt(e.target.value))}
                            disabled={actionLoading}
                            style={{ flex: 1, accentColor: '#7042f8' }}
                          />
                          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                            {item.percent}%
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveProgress(viewingProject.id, item.id)}
                          disabled={actionLoading}
                          style={{
                            background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)',
                            color: '#ff6b6b', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem',
                          }}
                        >
                          {isRTL ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add Progress Item */}
              <div style={{
                display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'flex-end', flexWrap: 'wrap',
              }}>
                <div className={styles.formGroup} style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{isRTL ? 'المعرف' : 'ID'}</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={newProgressId}
                    onChange={(e) => setNewProgressId(e.target.value)}
                    placeholder={isRTL ? 'مثال: step1' : 'e.g. step1'}
                    style={{ padding: '0.6rem 0.8rem' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 2, minWidth: '150px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{isRTL ? 'العنوان' : 'Title'}</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={newProgressTitle}
                    onChange={(e) => setNewProgressTitle(e.target.value)}
                    placeholder={isRTL ? 'عنوان المرحلة' : 'Phase title'}
                    style={{ padding: '0.6rem 0.8rem' }}
                  />
                </div>
                <button
                  className={styles.primaryBtn}
                  onClick={() => handleAddProgress(viewingProject.id)}
                  disabled={actionLoading || !newProgressId || !newProgressTitle}
                  style={{ padding: '0.6rem 1.2rem', opacity: !newProgressId || !newProgressTitle ? 0.5 : 1 }}
                >
                  {isRTL ? 'إضافة' : 'Add'}
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div style={{
              display: 'flex', gap: '2rem', padding: '1rem', fontSize: '0.8rem', color: '#94a3b8',
              borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem',
            }}>
              <span>{isRTL ? 'تاريخ الإنشاء' : 'Created'}: {formatDate(viewingProject.created_at)}</span>
              <span>{isRTL ? 'آخر تحديث' : 'Updated'}: {formatDate(viewingProject.updated_at)}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.6 }}>ID: {viewingProject.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Delete Confirmation Modal ==================== */}
      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              {isRTL
                ? 'هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this project? This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className={styles.secondaryBtn} onClick={() => setConfirmDelete(null)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className={styles.primaryBtn}
                onClick={() => handleDeleteProject(confirmDelete)}
                disabled={actionLoading}
                style={{
                  background: 'linear-gradient(135deg, #FF4444, #FF8C00)',
                  opacity: actionLoading ? 0.5 : 1,
                }}
              >
                {actionLoading ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'حذف المشروع' : 'Delete Project')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== Page Export ====================

export default function ProjectsPage() {
  return (
    <LanguageProvider>
      <ProjectsContent />
    </LanguageProvider>
  )
}
