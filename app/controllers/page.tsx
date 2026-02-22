'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage'
import { useGlobalAuth } from '@/lib/auth-context'
import { useAuth } from '@/hooks/useAuth'
import {
  UsersIcon,
  BarChartIcon,
  WalletIcon,
  TrendingUpIcon,
  UserPlusIcon,
  FolderPlusIcon,
  FileTextIcon,
  SaveIcon,
  PinIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  LockIcon,
  UserIcon
} from '@/components/UI/ControllerIcons'
import styles from './Controllers.module.css'
import {
  type Project as APIProject,
  type ProjectStatistics,
  type CreateProjectPayload,
  type UpdateProjectPayload,
  type ProgressItem,
  getAllProjects,
  getProjectStatistics,
  getProjectById,
  getProjectsByUserId,
  getProjectsByTeamMember,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  addProgressItem,
  updateProgressItem,
  removeProgressItem,
  markProgressCompleted,
  unmarkProgressCompleted,
  addTeamMember,
  removeTeamMember,
} from '../Projects/apiFunctions'

import {
  type User as APIUser,
  type UsersResponse,
  type UpdateUserPayload,
  getAllUsers,
  getUserById,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
} from '../users/apiFunctions'

// Define interfaces for type safety
// Client interface now uses API User data
interface Client extends APIUser {
  // Additional computed fields
  projects?: number
  totalSpent?: number
  status?: 'active' | 'inactive' | 'pending'
  joined?: string
  lastActivity?: string
}

// Project type is now imported from ../Projects/apiFunctions as APIProject

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  descriptionEn: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  client?: string
}

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
  auth_provider?: 'local' | 'google'
  name?: string
  role?: 'admin' | 'manager' | 'client' | 'developer'
  status?: 'active' | 'inactive'
  lastLogin?: string
}

interface ProjectAdmin {
  id: string
  user_id: string
  permissions: string[]
  created_at?: string
  updated_at?: string
  user?: User
}

// Available permissions list
const AVAILABLE_PERMISSIONS = [
  { key: 'view_users', label: 'View Users', labelAr: 'عرض المستخدمين', description: 'Allow viewing user list', descriptionAr: 'السماح بعرض قائمة المستخدمين' },
  { key: 'view_cars', label: 'View Cars', labelAr: 'عرض السيارات', description: 'Allow viewing car list', descriptionAr: 'السماح بعرض قائمة السيارات' },
  { key: 'create_cars', label: 'Add Cars', labelAr: 'إضافة سيارات', description: 'Allow adding new cars', descriptionAr: 'السماح بإضافة سيارات جديدة' },
  { key: 'update_cars', label: 'Edit Cars', labelAr: 'تعديل السيارات', description: 'Allow editing car data', descriptionAr: 'السماح بتعديل بيانات السيارات' },
  { key: 'delete_cars', label: 'Delete Cars', labelAr: 'حذف السيارات', description: 'Allow deleting cars', descriptionAr: 'السماح بحذف السيارات' }
]

interface Activity {
  id: string
  user: string
  action: string
  actionEn: string
  time: string
  details: string
  detailsEn: string
}

function ControllersContent() {
  const router = useRouter()
  const { t, language, setLanguage, dir } = useLanguage()
  const { user, token, isAuthenticated, isLoading, isAdmin, logout } = useGlobalAuth()
  const { addAllowedUser, allowedUsers, removeAllowedUser, updateAllowedUser } = useAuth()
  const isRTL = language === 'ar'

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'projects' | 'finances' | 'users' | 'tickets' | 'analytics' | 'activity'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  // Client add form state
  const [showAddClientForm, setShowAddClientForm] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')

  // Manager add form state
  const [showAddManagerForm, setShowAddManagerForm] = useState(false)
  const [newManagerEmail, setNewManagerEmail] = useState('')
  const [newManagerName, setNewManagerName] = useState('')

  // Project data state (from API)
  const [projects, setProjects] = useState<APIProject[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStatistics['data'] | null>(null)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [projectSuccess, setProjectSuccess] = useState<string | null>(null)
  const [projectActionLoading, setProjectActionLoading] = useState(false)

  // Project edit form state
  const [editingProject, setEditingProject] = useState<APIProject | null>(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectPrice, setEditProjectPrice] = useState(0)
  const [editProjectSpent, setEditProjectSpent] = useState(0)
  const [editProjectStatus, setEditProjectStatus] = useState<APIProject['status']>('active')
  const [editProjectDeadline, setEditProjectDeadline] = useState('')
  const [editProjectPriority, setEditProjectPriority] = useState<APIProject['priority']>('medium')
  const [editProjectHasSigned, setEditProjectHasSigned] = useState(false)

  // Project search and filter state
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | APIProject['status']>('all')
  const [projectPriorityFilter, setProjectPriorityFilter] = useState<'all' | APIProject['priority']>('all')

  // Project details state
  const [viewingProject, setViewingProject] = useState<APIProject | null>(null)

  // Progress management state
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [newProgressTitle, setNewProgressTitle] = useState('')
  const [newProgressPercent, setNewProgressPercent] = useState(0)
  const [editingProgressItem, setEditingProgressItem] = useState<{id: string, title: string, percent: number} | null>(null)

  // Team management state
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [newTeamMemberId, setNewTeamMemberId] = useState('')
  const [availableAdmins, setAvailableAdmins] = useState<ProjectAdmin[]>([])

  // Add project form state
  const [showAddProjectForm, setShowAddProjectForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectUserId, setNewProjectUserId] = useState('')
  const [newProjectPrice, setNewProjectPrice] = useState('')
  const [newProjectDeadline, setNewProjectDeadline] = useState('')
  const [newProjectPriority, setNewProjectPriority] = useState<APIProject['priority']>('medium')
  const [newProjectStatus, setNewProjectStatus] = useState<APIProject['status']>('pending')

  // Admin management state
  const [admins, setAdmins] = useState<ProjectAdmin[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<ProjectAdmin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [adminSearchTerm, setAdminSearchTerm] = useState('')
  const [filterPermission, setFilterPermission] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<ProjectAdmin | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [searchUserTerm, setSearchUserTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')

  // Client/User data state (from API)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [clientSuccess, setClientSuccess] = useState<string | null>(null)
  const [clientActionLoading, setClientActionLoading] = useState(false)
  const [clientStats, setClientStats] = useState<{ total: number; active: number } | null>(null)

  // Client edit state
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editClientFirstName, setEditClientFirstName] = useState('')
  const [editClientLastName, setEditClientLastName] = useState('')
  const [editClientDisplayName, setEditClientDisplayName] = useState('')
  const [editClientPhone, setEditClientPhone] = useState('')

  // Projects data is now fetched from API (see useEffect below)

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      amount: 45000,
      description: 'دفعة مشروع التجارة الإلكترونية',
      descriptionEn: 'E-commerce project payment',
      date: '2026-02-15',
      status: 'completed',
      client: 'شركة الرياض التقنية'
    },
    {
      id: '2',
      type: 'expense',
      amount: 8500,
      description: 'رواتب الموظفين',
      descriptionEn: 'Employee salaries',
      date: '2026-02-14',
      status: 'completed'
    },
    {
      id: '3',
      type: 'income',
      amount: 25000,
      description: 'دفعة مقدمة لمشروع جديد',
      descriptionEn: 'Advance payment for new project',
      date: '2026-02-16',
      status: 'pending',
      client: 'مؤسسة النور للتطوير'
    },
  ]

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@nixt.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2026-02-17T08:30:00Z',
      auth_provider: 'local'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@nixt.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2026-02-16T15:20:00Z',
      auth_provider: 'google'
    },
    {
      id: '3',
      name: 'خالد العتيبي',
      email: 'khaled@nixt.com',
      role: 'developer',
      status: 'active',
      lastLogin: '2026-02-17T09:00:00Z',
      auth_provider: 'local'
    },
  ]

  const activities: Activity[] = [
    {
      id: '1',
      user: 'أحمد محمد',
      action: 'أضاف عميل جديد',
      actionEn: 'Added new client',
      time: '2026-02-17T10:30:00Z',
      details: 'شركة الابتكار الذكي',
      detailsEn: 'Smart Innovation Company'
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      action: 'حدّث حالة المشروع',
      actionEn: 'Updated project status',
      time: '2026-02-17T09:15:00Z',
      details: 'منصة التجارة الإلكترونية - 75%',
      detailsEn: 'E-commerce Platform - 75%'
    },
    {
      id: '3',
      user: 'خالد العتيبي',
      action: 'أتم مهمة',
      actionEn: 'Completed task',
      time: '2026-02-16T16:45:00Z',
      details: 'تطوير واجهة الداشبورد',
      detailsEn: 'Dashboard UI Development'
    },
  ]

  // ==================== API Configuration ====================
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'

  // ==================== Admin Management Functions ====================

  // Fetch admins
  const fetchAdmins = useCallback(async () => {
    if (!token) return

    setIsLoadingAdmins(true)
    setAdminError('')

    try {
      const response = await fetch(`${API_BASE_URL}/project-admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const adminsData = data.data || []
        
        // Fetch user data for each admin
        const adminsWithUsers = await Promise.all(
          adminsData.map(async (admin: ProjectAdmin) => {
            try {
              const userResponse = await fetch(`${API_BASE_URL}/users/${admin.user_id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              if (userResponse.ok) {
                const userData = await userResponse.json()
                return { ...admin, user: userData.data }
              }
            } catch {
              // Ignore error
            }
            return admin
          })
        )
        
        setAdmins(adminsWithUsers)
      } else if (response.status === 403) {
        setAdminError(isRTL ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة' : 'You do not have permission to access this page')
      } else {
        const data = await response.json()
        setAdminError(data.message || (isRTL ? 'فشل في تحميل المسؤولين' : 'Failed to fetch admins'))
      }
    } catch {
      setAdminError(isRTL ? 'خطأ في الاتصال بالخادم' : 'Error connecting to server')
    } finally {
      setIsLoadingAdmins(false)
    }
  }, [token, API_BASE_URL, isRTL])

  // Fetch users (for adding) - with limit and search
  const fetchUsersForAdmin = useCallback(async (search?: string) => {
    if (!token) return

    setIsLoadingUsers(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', '10')
      if (search) params.append('search', search)
      
      const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch {
      // Ignore error
    } finally {
      setIsLoadingUsers(false)
    }
  }, [token, API_BASE_URL])

  // Add new admin
  const handleAddAdmin = async () => {
    if (!selectedUserId || !token) return

    // Check if user is already an admin
    if (admins.some(admin => admin.user_id === selectedUserId)) {
      setAdminError(isRTL ? 'هذا المستخدم مسؤول بالفعل' : 'This user is already an admin')
      return
    }

    setIsSubmitting(true)
    setAdminError('')

    try {
      const response = await fetch(`${API_BASE_URL}/project-admins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          permissions: []
        })
      })

      if (response.ok) {
        setAdminSuccess(isRTL ? 'تمت إضافة المسؤول بنجاح' : 'Admin added successfully')
        setShowAddAdminModal(false)
        setSelectedUserId('')
        setSearchUserTerm('')
        fetchAdmins()
        setTimeout(() => setAdminSuccess(''), 3000)
      } else {
        const data = await response.json()
        setAdminError(data.message || (isRTL ? 'فشل في إضافة المسؤول' : 'Failed to add admin'))
      }
    } catch {
      setAdminError(isRTL ? 'خطأ في الاتصال بالخادم' : 'Error connecting to server')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete admin
  const handleDeleteAdmin = async (adminId: string) => {
    if (!token || !confirm(isRTL ? 'هل أنت متأكد من حذف هذا المسؤول؟' : 'Are you sure you want to delete this admin?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/project-admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAdminSuccess(isRTL ? 'تم حذف المسؤول بنجاح' : 'Admin deleted successfully')
        fetchAdmins()
        setTimeout(() => setAdminSuccess(''), 3000)
      } else {
        const data = await response.json()
        setAdminError(data.message || (isRTL ? 'فشل في حذف المسؤول' : 'Failed to delete admin'))
      }
    } catch {
      setAdminError(isRTL ? 'خطأ في الاتصال بالخادم' : 'Error connecting to server')
    }
  }

  // Update admin permissions
  const handleUpdatePermissions = async (permissions: string[]) => {
    if (!token || !selectedAdmin) return

    setIsSubmitting(true)
    setAdminError('')

    try {
      const response = await fetch(`${API_BASE_URL}/project-admins/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      })

      if (response.ok) {
        setAdminSuccess(isRTL ? 'تم تحديث الصلاحيات بنجاح' : 'Permissions updated successfully')
        setShowPermissionsModal(false)
        setSelectedAdmin(null)
        fetchAdmins()
        setTimeout(() => setAdminSuccess(''), 3000)
      } else {
        const data = await response.json()
        setAdminError(data.message || (isRTL ? 'فشل في تحديث الصلاحيات' : 'Failed to update permissions'))
      }
    } catch {
      setAdminError(isRTL ? 'خطأ في الاتصال بالخادم' : 'Error connecting to server')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Search for users when typing
  const handleSearchUsers = () => {
    fetchUsersForAdmin(searchUserTerm)
  }

  // Filter admins
  useEffect(() => {
    let result = [...admins]

    // Search
    if (adminSearchTerm) {
      const search = adminSearchTerm.toLowerCase()
      result = result.filter(admin =>
        admin.user?.email?.toLowerCase().includes(search) ||
        admin.user?.display_name?.toLowerCase().includes(search) ||
        admin.user?.first_name?.toLowerCase().includes(search) ||
        admin.user?.last_name?.toLowerCase().includes(search) ||
        admin.user_id.toLowerCase().includes(search)
      )
    }

    // Filter by permission
    if (filterPermission !== 'all') {
      result = result.filter(admin => admin.permissions.includes(filterPermission))
    }

    setFilteredAdmins(result)
  }, [admins, adminSearchTerm, filterPermission])

  // Fetch admins and users when component mounts
  useEffect(() => {
    if (token && isAuthenticated && activeTab === 'users') {
      fetchAdmins()
      fetchUsersForAdmin()
    }
  }, [token, isAuthenticated, activeTab, fetchAdmins, fetchUsersForAdmin])

  // Filter users for adding (exclude current admins)
  const availableUsers = users.filter(u =>
    !admins.some(admin => admin.user_id === u.id)
  )

  // ==================== Projects API Fetching ====================

  const fetchProjects = useCallback(async () => {
    try {
      setProjectsLoading(true)
      setProjectError(null)
      const res = await getAllProjects({ limit: 50, offset: 0 })
      if (res.success) {
        setProjects(res.data)
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في تحميل المشاريع' : 'Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setProjectsLoading(false)
    }
  }, [isRTL])

  const fetchProjectStats = useCallback(async () => {
    try {
      const res = await getProjectStatistics()
      if (res.success) {
        setProjectStats(res.data)
      }
    } catch (err) {
      console.error('Error fetching project statistics:', err)
    }
  }, [])

  useEffect(() => {
    // Only fetch projects if user is authenticated and is admin
    if (isAuthenticated && isAdmin && !isLoading) {
      fetchProjects()
      fetchProjectStats()
    }
  }, [fetchProjects, fetchProjectStats, isAuthenticated, isAdmin, isLoading])

  const showProjectSuccess = (msg: string) => {
    setProjectSuccess(msg)
    setTimeout(() => setProjectSuccess(null), 3000)
  }

  const refreshProjectData = async () => {
    await Promise.all([fetchProjects(), fetchProjectStats()])
  }

  // Normalize project data to ensure all required fields exist
  const normalizeProjectData = (project: APIProject): APIProject => {
    if (!project || !project.id) {
      console.error('Invalid project data - missing id:', project)
      throw new Error('Invalid project data')
    }
    return {
      ...project,
      id: project.id, // Ensure ID is always present
      name: project.name || '',
      user_id: project.user_id || '',
      price: project.price || 0,
      spent: project.spent || 0,
      status: project.status || 'pending',
      priority: project.priority || 'medium',
      deadline: project.deadline || new Date().toISOString(),
      progress: project.progress || [],
      progress_completed: project.progress_completed || [],
      team: project.team || [],
      has_signed: project.has_signed ?? false
    }
  }

  // Compute overall progress for a project
  const computeOverallProgress = (project: APIProject) => {
    if (!project.progress || project.progress.length === 0) return 0
    const total = project.progress.reduce((sum, p) => sum + p.percent, 0)
    return Math.round(total / project.progress.length)
  }

  // Open edit modal for a project - Now opens full details view with editable fields
  const openEditProject = async (project: APIProject) => {
    try {
      setProjectsLoading(true)
      setProjectError(null)
      const res = await getProjectById(project.id)
      
      if (res.success && res.data) {
        // Handle case where API returns array instead of object
        const projectData = Array.isArray(res.data) ? res.data[0] : res.data
        if (!projectData) {
          setProjectError(isRTL ? 'المشروع غير موجود' : 'Project not found')
          return
        }
        const normalized = normalizeProjectData(projectData)
        setViewingProject(normalized)
        // Initialize edit states safely
        setEditProjectName(normalized.name || '')
        setEditProjectPrice(normalized.price || 0)
        setEditProjectSpent(normalized.spent || 0)
        setEditProjectStatus(normalized.status || 'pending')
        setEditProjectDeadline(normalized.deadline ? normalized.deadline.split('T')[0] : '')
        setEditProjectPriority(normalized.priority || 'medium')
        setEditProjectHasSigned(normalized.has_signed ?? false)
      } else {
        setProjectError(isRTL ? 'فشل في تحميل بيانات المشروع' : 'Failed to load project data')
      }
    } catch (err: any) {
      console.error('Error loading project details:', err)
      setProjectError(err.message || (isRTL ? 'خطأ في تحميل تفاصيل المشروع' : 'Error loading project details'))
    } finally {
      setProjectsLoading(false)
    }
  }

  // Save all project changes (basic info + progress + team)
  const saveProjectChanges = async () => {
    if (!viewingProject) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    try {
      setProjectActionLoading(true)
      const payload: UpdateProjectPayload = {}
      
      // Check what changed
      if (editProjectName !== viewingProject.name) payload.name = editProjectName
      if (editProjectPrice !== viewingProject.price) payload.price = editProjectPrice
      if (editProjectSpent !== viewingProject.spent) payload.spent = editProjectSpent
      if (editProjectDeadline && viewingProject.deadline && editProjectDeadline !== viewingProject.deadline.split('T')[0]) {
        payload.deadline = new Date(editProjectDeadline).toISOString()
      }
      if (editProjectPriority !== viewingProject.priority) payload.priority = editProjectPriority
      if (editProjectStatus !== viewingProject.status) payload.status = editProjectStatus
      if (editProjectHasSigned !== (viewingProject.has_signed ?? false)) payload.has_signed = editProjectHasSigned

      // Only update if there are changes
      if (Object.keys(payload).length > 0) {
        const res = await apiUpdateProject(projectId, payload)
        if (res.success) {
          showProjectSuccess(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully')
          await refreshProjectData()
          
          // Reload project details
          const updated = await getProjectById(projectId)
          if (updated.success && updated.data) {
            const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
            if (projectData) {
              const normalized = normalizeProjectData(projectData)
              setViewingProject(normalized)
              setEditProjectName(normalized.name || '')
              setEditProjectPrice(normalized.price || 0)
              setEditProjectSpent(normalized.spent || 0)
              setEditProjectStatus(normalized.status || 'pending')
              setEditProjectDeadline(normalized.deadline ? normalized.deadline.split('T')[0] : '')
              setEditProjectPriority(normalized.priority || 'medium')
              setEditProjectHasSigned(normalized.has_signed ?? false)
            }
          }
        }
      } else {
        showProjectSuccess(isRTL ? 'لا توجد تغييرات' : 'No changes to save')
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في حفظ التغييرات' : 'Failed to save changes')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Open basic edit modal (OLD)
  const openBasicEditProject = (project: APIProject) => {
    setEditingProject(project)
    setEditProjectName(project.name || '')
    setEditProjectPrice(project.price || 0)
    setEditProjectSpent(project.spent || 0)
    setEditProjectStatus(project.status || 'pending')
    setEditProjectDeadline(project.deadline ? project.deadline.split('T')[0] : '')
    setEditProjectPriority(project.priority || 'medium')
    setEditProjectHasSigned(project.has_signed ?? false)
  }
  const openViewProject = async (project: APIProject) => {
    // Now redirects to edit
    await openEditProject(project)
  }

  // Save edited project via API (OLD - for basic edit modal)
  const saveEditedProject = async () => {
    if (!editingProject) return
    try {
      setProjectActionLoading(true)
      const payload: UpdateProjectPayload = {}
      if (editProjectName !== editingProject.name) payload.name = editProjectName
      if (editProjectPrice !== editingProject.price) payload.price = editProjectPrice
      if (editProjectSpent !== editingProject.spent) payload.spent = editProjectSpent
      if (editProjectDeadline && editingProject.deadline && editProjectDeadline !== editingProject.deadline.split('T')[0]) {
        payload.deadline = new Date(editProjectDeadline).toISOString()
      }
      if (editProjectPriority !== editingProject.priority) payload.priority = editProjectPriority
      if (editProjectStatus !== editingProject.status) payload.status = editProjectStatus
      if (editProjectHasSigned !== (editingProject.has_signed ?? false)) payload.has_signed = editProjectHasSigned

      if (Object.keys(payload).length === 0) {
        setEditingProject(null)
        return
      }

      const res = await apiUpdateProject(editingProject.id, payload)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم تحديث المشروع بنجاح' : 'Project updated successfully')
        const projectId = editingProject.id
        setEditingProject(null)
        await refreshProjectData()
        
        // Re-open project details modal with updated data
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في تحديث المشروع' : 'Failed to update project')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Add new project via API
  const addNewProject = async () => {
    if (!newProjectName || !newProjectUserId || !newProjectPrice || !newProjectDeadline) return
    try {
      setProjectActionLoading(true)
      const payload: CreateProjectPayload = {
        name: newProjectName,
        user_id: newProjectUserId,
        price: parseFloat(newProjectPrice),
        deadline: new Date(newProjectDeadline).toISOString(),
        priority: newProjectPriority,
        status: newProjectStatus,
      }
      const res = await apiCreateProject(payload)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully')
        setShowAddProjectForm(false)
        setNewProjectName('')
        setNewProjectUserId('')
        setNewProjectPrice('')
        setNewProjectDeadline('')
        setNewProjectPriority('medium')
        setNewProjectStatus('pending')
        await refreshProjectData()
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في إنشاء المشروع' : 'Failed to create project')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Delete project via API
  const handleDeleteProject = async (id: string) => {
    try {
      setProjectActionLoading(true)
      const res = await apiDeleteProject(id)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully')
        await refreshProjectData()
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في حذف المشروع' : 'Failed to delete project')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // ==================== Progress Management Functions ====================

  // Add progress item
  const handleAddProgress = async () => {
    if (!viewingProject || !newProgressTitle) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      console.error('handleAddProgress: Invalid project ID', { viewingProject })
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    
    // Validate input
    const trimmedTitle = newProgressTitle.trim()
    if (!trimmedTitle || trimmedTitle.length < 1 || trimmedTitle.length > 255) {
      setProjectError(isRTL ? 'عنوان المرحلة يجب أن يكون بين 1 و 255 حرف' : 'Progress title must be between 1 and 255 characters')
      return
    }
    
    if (newProgressPercent < 0 || newProgressPercent > 100) {
      setProjectError(isRTL ? 'نسبة التقدم يجب أن تكون بين 0 و 100' : 'Progress percent must be between 0 and 100')
      return
    }
    
    console.log('handleAddProgress: Adding progress item to project', projectId)
    try {
      setProjectActionLoading(true)
      // Generate unique ID automatically
      const generatedId = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const progressItem = {
        id: generatedId,
        title: trimmedTitle,
        percent: newProgressPercent
      }
      
      console.log('handleAddProgress: Progress item data:', progressItem)
      
      const res = await addProgressItem(projectId, progressItem)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تمت إضافة المرحلة بنجاح' : 'Progress item added successfully')
        setShowProgressModal(false)
        setNewProgressTitle('')
        setNewProgressPercent(0)
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
        await refreshProjectData()
      }
    } catch (err) {
      console.error('handleAddProgress: Error adding progress item', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setProjectError(isRTL ? `فشل في إضافة المرحلة: ${errorMessage}` : `Failed to add progress item: ${errorMessage}`)
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Update progress item
  const handleUpdateProgress = async (itemId: string, updates: {title?: string, percent?: number}) => {
    if (!viewingProject) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      console.error('handleUpdateProgress: Invalid project ID', { viewingProject })
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    console.log('handleUpdateProgress: Updating progress item', { projectId, itemId, updates })
    try {
      setProjectActionLoading(true)
      const res = await updateProgressItem(projectId, itemId, updates)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم تحديث المرحلة بنجاح' : 'Progress item updated successfully')
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
        await refreshProjectData()
        setEditingProgressItem(null)
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في تحديث المرحلة' : 'Failed to update progress item')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Remove progress item
  const handleRemoveProgress = async (itemId: string) => {
    if (!viewingProject || !confirm(isRTL ? 'هل أنت متأكد من حذف هذه المرحلة؟' : 'Are you sure you want to remove this progress item?')) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      console.error('handleRemoveProgress: Invalid project ID', { viewingProject })
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    console.log('handleRemoveProgress: Removing progress item', { projectId, itemId })
    try {
      setProjectActionLoading(true)
      const res = await removeProgressItem(projectId, itemId)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم حذف المرحلة بنجاح' : 'Progress item removed successfully')
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
        await refreshProjectData()
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في حذف المرحلة' : 'Failed to remove progress item')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Mark/Unmark progress as completed
  const handleToggleProgressComplete = async (itemId: string, isCompleted: boolean) => {
    if (!viewingProject) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      console.error('handleToggleProgressComplete: Invalid project ID', { viewingProject })
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    console.log('handleToggleProgressComplete:', { projectId, itemId, isCompleted })
    try {
      setProjectActionLoading(true)
      const res = isCompleted 
        ? await unmarkProgressCompleted(projectId, itemId)
        : await markProgressCompleted(projectId, itemId)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم التحديث بنجاح' : 'Updated successfully')
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
        await refreshProjectData()
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في التحديث' : 'Failed to update')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // ==================== Team Management Functions ====================

  // Add team member
  const handleAddTeamMember = async () => {
    if (!viewingProject || !newTeamMemberId) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    try {
      setProjectActionLoading(true)
      const res = await addTeamMember(projectId, newTeamMemberId)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تمت إضافة العضو بنجاح' : 'Team member added successfully')
        setShowTeamModal(false)
        setNewTeamMemberId('')
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
        await refreshProjectData()
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في إضافة العضو' : 'Failed to add team member')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // Remove team member
  const handleRemoveTeamMember = async (adminId: string) => {
    if (!viewingProject || !confirm(isRTL ? 'هل أنت متأكد من إزالة هذا العضو؟' : 'Are you sure you want to remove this team member?')) return
    const projectId = viewingProject.id // Store ID locally to prevent undefined
    if (!projectId) {
      setProjectError(isRTL ? 'معرف المشروع غير صالح' : 'Invalid project ID')
      return
    }
    try {
      setProjectActionLoading(true)
      const res = await removeTeamMember(projectId, adminId)
      if (res.success) {
        showProjectSuccess(isRTL ? 'تم إزالة العضو بنجاح' : 'Team member removed successfully')
        const updated = await getProjectById(projectId)
        if (updated.success && updated.data) {
          const projectData = Array.isArray(updated.data) ? updated.data[0] : updated.data
          if (projectData) setViewingProject(normalizeProjectData(projectData))
        }
        await refreshProjectData()
      }
    } catch (err) {
      setProjectError(isRTL ? 'فشل في إزالة العضو' : 'Failed to remove team member')
    } finally {
      setProjectActionLoading(false)
    }
  }

  // ==================== Client/User Management Functions ====================

  // Show client success message
  const showClientSuccess = (msg: string) => {
    setClientSuccess(msg)
    setTimeout(() => setClientSuccess(null), 3000)
  }

  // Fetch all clients (users)
  const fetchClients = useCallback(async (search?: string) => {
    try {
      setClientsLoading(true)
      setClientError(null)
      const res = await getAllUsers({ 
        limit: 200,
        offset: 0,
        search: search || undefined
      })
      if (res.success) {
        // Convert API users to clients with computed fields
        const clientsData: Client[] = res.data.map(user => ({
          ...user,
          status: user.email_verified ? 'active' : 'pending',
          projects: 0, // TODO: Get from projects count
          totalSpent: 0, // TODO: Get from transactions
          joined: user.created_at,
          lastActivity: user.updated_at
        }))
        setClients(clientsData)
        setClientStats({
          total: res.count,
          active: clientsData.filter(c => c.status === 'active').length
        })
      }
    } catch (err) {
      setClientError(isRTL ? 'فشل في تحميل العملاء' : 'Failed to load clients')
      console.error('Error fetching clients:', err)
    } finally {
      setClientsLoading(false)
    }
  }, [isRTL])

  // Fetch clients when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin && !isLoading && (activeTab === 'clients' || activeTab === 'projects')) {
      fetchClients()
    }
  }, [fetchClients, isAuthenticated, isAdmin, isLoading, activeTab])

  // Search clients when searchTerm changes (with debounce)
  useEffect(() => {
    if (activeTab !== 'clients' || !isAuthenticated || !isAdmin) return
    
    const timeoutId = setTimeout(() => {
      fetchClients(searchTerm)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, activeTab, isAuthenticated, isAdmin, fetchClients])

  // Refresh client data
  const refreshClientData = async () => {
    await fetchClients()
  }

  // Update client
  const handleUpdateClient = async () => {
    if (!editingClient) return
    try {
      setClientActionLoading(true)
      const payload: UpdateUserPayload = {}

      if (editClientFirstName !== editingClient.first_name) payload.first_name = editClientFirstName
      if (editClientLastName !== editingClient.last_name) payload.last_name = editClientLastName
      if (editClientDisplayName !== editingClient.display_name) payload.display_name = editClientDisplayName
      if (editClientPhone !== editingClient.phone) payload.phone = editClientPhone

      if (Object.keys(payload).length === 0) {
        setEditingClient(null)
        return
      }

      const res = await apiUpdateUser(editingClient.id, payload)
      if (res.success && res.data) {
        showClientSuccess(isRTL ? 'تم تحديث العميل بنجاح' : 'Client updated successfully')
        setEditingClient(null)
        await refreshClientData()
      }
    } catch (err) {
      setClientError(isRTL ? 'فشل في تحديث العميل' : 'Failed to update client')
    } finally {
      setClientActionLoading(false)
    }
  }

  // Delete client
  const handleDeleteClient = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this client?')) return
    
    try {
      setClientActionLoading(true)
      const res = await apiDeleteUser(id)
      if (res.success) {
        showClientSuccess(isRTL ? 'تم حذف العميل بنجاح' : 'Client deleted successfully')
        await refreshClientData()
      }
    } catch (err) {
      setClientError(isRTL ? 'فشل في حذف العميل' : 'Failed to delete client')
    } finally {
      setClientActionLoading(false)
    }
  }

  // Open edit client modal
  const openEditClient = (client: Client) => {
    setEditingClient(client)
    setEditClientFirstName(client.first_name || '')
    setEditClientLastName(client.last_name || '')
    setEditClientDisplayName(client.display_name || '')
    setEditClientPhone(client.phone || '')
  }

  // Confirm delete state
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<string | null>(null)

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClients = clients.length
    const activeClients = clients.filter(c => c.status === 'active').length
    const totalProjects = projectStats?.total ?? projects.length
    const activeProjects = projectStats?.byStatus.active ?? projects.filter(p => p.status === 'active').length
    const completedProjects = projectStats?.byStatus.completed ?? projects.filter(p => p.status === 'completed').length
    
    const totalRevenue = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingRevenue = transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalClients,
      activeClients,
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      pendingRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    }
  }, [clients, projects, transactions, projectStats])

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients
    const search = searchTerm.toLowerCase()
    return clients.filter(client => 
      client.email.toLowerCase().includes(search) ||
      client.display_name?.toLowerCase().includes(search) ||
      client.first_name?.toLowerCase().includes(search) ||
      client.last_name?.toLowerCase().includes(search) ||
      client.phone?.includes(search)
    )
  }, [clients, searchTerm])

  // Filter projects based on search, status, and priority
  const filteredProjects = useMemo(() => {
    let result = [...projects]
    
    // Search filter
    if (projectSearchTerm) {
      const search = projectSearchTerm.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      )
    }
    
    // Status filter
    if (projectStatusFilter !== 'all') {
      result = result.filter(p => p.status === projectStatusFilter)
    }
    
    // Priority filter
    if (projectPriorityFilter !== 'all') {
      result = result.filter(p => p.priority === projectPriorityFilter)
    }
    
    return result
  }, [projects, projectSearchTerm, projectStatusFilter, projectPriorityFilter])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#00C781',
      inactive: '#FF4444',
      pending: '#FF8C00',
      completed: '#00C781',
      onhold: '#94a3b8',
      'on-hold': '#94a3b8',
      failed: '#FF4444'
    }
    return colors[status] || '#666'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: '#FF4444',
      high: '#FF8C00',
      medium: '#0070F3',
      low: '#00C781'
    }
    return colors[priority] || '#666'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isRTL 
      ? date.toLocaleDateString('ar-SA') 
      : date.toLocaleDateString('en-US')
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins} mins ago`
    } else if (diffHours < 24) {
      return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`
    } else if (diffDays < 7) {
      return isRTL ? `منذ ${diffDays} يوم` : `${diffDays} days ago`
    } else {
      return formatDate(dateString)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

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
            onClick={() => {
              logout()
              router.push('/login')
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: 'rgba(112, 66, 248, 0.15)',
              border: '1px solid rgba(112, 66, 248, 0.3)',
              color: '#b4a0f8',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          >
            {isRTL ? 'تسجيل دخول بحساب آخر' : 'Login with different account'}
          </button>
          <a 
            href="/"
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.95rem',
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.controllersPage} style={{ direction: dir }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.controllers.title}</h1>
          <p className={styles.subtitle}>{t.controllers.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          {/* User Info */}
          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '0.85rem',
              color: '#94a3b8'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#00C781',
                display: 'inline-block'
              }} />
              <span style={{ color: '#fff', fontWeight: 600 }}>{user.display_name || user.email}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ color: '#0070F3', fontWeight: 600 }}>{isRTL ? 'مسؤول' : 'Manager'}</span>
            </div>
          )}
          <button 
            className={styles.languageBtn}
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            className={styles.languageBtn}
            onClick={() => {
              logout()
            }}
            style={{ 
              background: 'rgba(255, 68, 68, 0.1)', 
              borderColor: 'rgba(255, 68, 68, 0.2)',
              color: '#ff6b6b'
            }}
          >
            {isRTL ? 'خروج' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {isRTL ? 'نظرة عامة' : 'Overview'}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'clients' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          {t.controllers.clients.title}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'projects' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          {t.controllers.projects.title}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'finances' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('finances')}
        >
          {t.controllers.finances.title}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t.controllers.users.title}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'activity' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          {t.controllers.activity.title}
        </button>

      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Statistics Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #0070F3, #00C781)' }}>
                  <UsersIcon size={28} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{stats.totalClients}</h3>
                  <p>{t.controllers.clients.total}</p>
                  <span className={styles.statChange}>
                    +{stats.activeClients} {t.controllers.clients.active}
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #00C781, #0070F3)' }}>
                  <BarChartIcon size={28} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{stats.totalProjects}</h3>
                  <p>{t.controllers.projects.total}</p>
                  <span className={styles.statChange}>
                    {stats.activeProjects} {t.controllers.projects.active}
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FF8C00, #FF0080)' }}>
                  <WalletIcon size={28} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{formatCurrency(stats.totalRevenue)}</h3>
                  <p>{t.controllers.finances.totalRevenue}</p>
                  <span className={styles.statChange}>
                    {formatCurrency(stats.pendingRevenue)} {t.controllers.finances.pending}
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #9B59B6, #7042F8)' }}>
                  <TrendingUpIcon size={28} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{formatCurrency(stats.netProfit)}</h3>
                  <p>{t.controllers.finances.profit}</p>
                  <span className={styles.statChange}>
                    ↑ 12.5%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t.controllers.quickActions.title}</h2>
              <div className={styles.quickActions}>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>
                    <UserPlusIcon size={40} />
                  </span>
                  <span>{t.controllers.quickActions.addClient}</span>
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>
                    <FolderPlusIcon size={40} />
                  </span>
                  <span>{t.controllers.quickActions.createProject}</span>
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>
                    <FileTextIcon size={40} />
                  </span>
                  <span>{t.controllers.quickActions.sendInvoice}</span>
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>
                    <SaveIcon size={40} />
                  </span>
                  <span>{t.controllers.quickActions.backupData}</span>
                </button>

              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t.controllers.activity.recent}</h2>
              <div className={styles.activityList}>
                {activities.map(activity => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <PinIcon size={20} />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        <strong>{activity.user}</strong> {isRTL ? activity.action : activity.actionEn}
                      </p>
                      <p className={styles.activityDetails}>
                        {isRTL ? activity.details : activity.detailsEn}
                      </p>
                      <span className={styles.activityTime}>{formatDateTime(activity.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className={styles.clientsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.controllers.clients.title}</h2>
              <div className={styles.sectionActions}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t.controllers.clients.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className={styles.primaryBtn}
                  onClick={() => setShowAddClientForm(!showAddClientForm)}
                >
                  {showAddClientForm ? (isRTL ? 'إلغاء' : 'Cancel') : t.controllers.clients.add}
                </button>
              </div>
            </div>

            {/* Client Success Toast */}
            {clientSuccess && (
              <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                background: 'linear-gradient(135deg, #00C781, #0070F3)', color: '#fff',
                padding: '12px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 8px 30px rgba(0, 199, 129, 0.3)', animation: 'fadeIn 0.3s ease',
              }}>
                {clientSuccess}
              </div>
            )}

            {/* Client Error Toast */}
            {clientError && (
              <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                background: 'linear-gradient(135deg, #FF4444, #FF8C00)', color: '#fff',
                padding: '12px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 8px 30px rgba(255, 68, 68, 0.3)', animation: 'fadeIn 0.3s ease',
                cursor: 'pointer',
              }} onClick={() => setClientError(null)}>
                {clientError}
              </div>
            )}

            {/* Add Client Form */}
            {showAddClientForm && (
              <div style={{
                background: 'rgba(112, 66, 248, 0.05)',
                border: '1px solid rgba(112, 66, 248, 0.15)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.2rem' }}>
                  {isRTL ? 'إضافة عميل جديد' : 'Add New Client'}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {t.controllers.clients.name}
                    </label>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder={isRTL ? 'اسم العميل...' : 'Client name...'}
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      style={{ width: '100%', minWidth: 'unset' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {t.controllers.clients.email}
                    </label>
                    <input
                      type="email"
                      className={styles.searchInput}
                      placeholder={isRTL ? 'email@example.com' : 'email@example.com'}
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      dir="ltr"
                      style={{ width: '100%', minWidth: 'unset' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {t.controllers.clients.phone}
                    </label>
                    <input
                      type="tel"
                      className={styles.searchInput}
                      placeholder={isRTL ? '+966XXXXXXXXX' : '+966XXXXXXXXX'}
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      dir="ltr"
                      style={{ width: '100%', minWidth: 'unset' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => {
                      if (newClientEmail && newClientName) {
                        // Note: This adds to local allowedUsers only
                        // To create users in database, they need to register via /register endpoint
                        const newClient: Client = {
                          id: String(Date.now()),
                          email: newClientEmail.trim(),
                          display_name: newClientName.trim(),
                          first_name: null,
                          last_name: null,
                          phone: newClientPhone.trim() || null,
                          auth_provider: 'local',
                          google_id: null,
                          avatar_url: null,
                          email_verified: false,
                          status: 'pending',
                          projects: 0,
                          totalSpent: 0,
                          joined: new Date().toISOString(),
                          lastActivity: new Date().toISOString(),
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        }
                        setClients(prev => [...prev, newClient])
                        addAllowedUser({
                          email: newClientEmail.trim(),
                          name: newClientName.trim(),
                          role: 'client',
                          addedBy: 'Admin',
                          dashboardSections: ['project', 'analytics', 'financial', 'support'],
                          isActive: true,
                        })
                        setNewClientEmail('')
                        setNewClientName('')
                        setNewClientPhone('')
                        setShowAddClientForm(false)
                        showClientSuccess(isRTL ? 'تمت إضافة العميل محلياً. يحتاج للتسجيل عبر صفحة التسجيل.' : 'Client added locally. They need to register via registration page.')
                      }
                    }}
                    disabled={!newClientEmail || !newClientName}
                    style={{ opacity: (!newClientEmail || !newClientName) ? 0.5 : 1 }}
                  >
                    {t.controllers.dashboardAccess.save}
                  </button>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setShowAddClientForm(false)
                      setNewClientEmail('')
                      setNewClientName('')
                      setNewClientPhone('')
                    }}
                  >
                    {t.controllers.dashboardAccess.cancel}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Client Form */}
            {editingClient && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9998,
                padding: '2rem',
              }} onClick={() => setEditingClient(null)}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))',
                  border: '1px solid rgba(112, 66, 248, 0.3)',
                  borderRadius: '24px',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 60px rgba(112, 66, 248, 0.3)',
                }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
                    {isRTL ? 'تعديل بيانات العميل' : 'Edit Client Details'}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {isRTL ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <input
                        type="email"
                        value={editingClient.email}
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#666',
                          cursor: 'not-allowed',
                        }}
                      />
                      <small style={{ color: '#666', fontSize: '0.75rem' }}>
                        {isRTL ? 'لا يمكن تعديل البريد الإلكتروني' : 'Email cannot be changed'}
                      </small>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {isRTL ? 'الاسم الأول' : 'First Name'}
                      </label>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={isRTL ? 'الاسم الأول...' : 'First name...'}
                        value={editClientFirstName}
                        onChange={(e) => setEditClientFirstName(e.target.value)}
                        style={{ width: '100%', minWidth: 'unset' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {isRTL ? 'اسم العائلة' : 'Last Name'}
                      </label>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={isRTL ? 'اسم العائلة...' : 'Last name...'}
                        value={editClientLastName}
                        onChange={(e) => setEditClientLastName(e.target.value)}
                        style={{ width: '100%', minWidth: 'unset' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {isRTL ? 'اسم العرض' : 'Display Name'}
                      </label>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={isRTL ? 'اسم العرض...' : 'Display name...'}
                        value={editClientDisplayName}
                        onChange={(e) => setEditClientDisplayName(e.target.value)}
                        style={{ width: '100%', minWidth: 'unset' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        className={styles.searchInput}
                        placeholder={isRTL ? '+966XXXXXXXXX' : '+966XXXXXXXXX'}
                        value={editClientPhone}
                        onChange={(e) => setEditClientPhone(e.target.value)}
                        dir="ltr"
                        style={{ width: '100%', minWidth: 'unset' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      className={styles.primaryBtn}
                      onClick={handleUpdateClient}
                      disabled={clientActionLoading}
                      style={{ opacity: clientActionLoading ? 0.5 : 1 }}
                    >
                      {clientActionLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t.controllers.dashboardAccess.save}
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      onClick={() => setEditingClient(null)}
                      disabled={clientActionLoading}
                    >
                      {t.controllers.dashboardAccess.cancel}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Clients Table */}
            {clientsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '1.2rem' }}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '1.2rem' }}>{isRTL ? 'لا يوجد عملاء' : 'No clients found'}</div>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t.controllers.clients.name}</th>
                      <th>{t.controllers.clients.email}</th>
                      <th>{t.controllers.clients.phone}</th>
                      <th>{t.controllers.clients.status}</th>
                      <th>{isRTL ? 'نوع التسجيل' : 'Auth Provider'}</th>
                      <th>{t.controllers.clients.lastActivity}</th>
                      <th>{isRTL ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(client => (
                      <tr key={client.id}>
                        <td>{client.display_name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || '-'}</td>
                        <td>{client.email}</td>
                        <td>{client.phone || '-'}</td>
                        <td>
                          <span 
                            className={styles.badge}
                            style={{ backgroundColor: getStatusColor(client.status || 'pending') }}
                          >
                            {client.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <span 
                            className={styles.badge}
                            style={{ 
                              backgroundColor: client.auth_provider === 'google' ? '#4285F4' : '#666',
                              fontSize: '0.85rem'
                            }}
                          >
                            {client.auth_provider || 'local'}
                          </span>
                        </td>
                        <td>{formatDateTime(client.lastActivity || client.updated_at)}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.iconBtn} 
                              title={t.controllers.clients.edit}
                              onClick={() => openEditClient(client)}
                            >
                              <EditIcon size={18} />
                            </button>
                            <button 
                              className={styles.iconBtn} 
                              title={t.controllers.clients.delete}
                              onClick={() => handleDeleteClient(client.id)}
                              disabled={clientActionLoading}
                            >
                              <TrashIcon size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}


          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className={styles.projectsSection}>
            {/* Project Success Toast */}
            {projectSuccess && (
              <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                background: 'linear-gradient(135deg, #00C781, #0070F3)', color: '#fff',
                padding: '12px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 8px 30px rgba(0, 199, 129, 0.3)', animation: 'fadeIn 0.3s ease',
              }}>
                {projectSuccess}
              </div>
            )}

            {/* Project Error Toast */}
            {projectError && (
              <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                background: 'linear-gradient(135deg, #FF4444, #FF8C00)', color: '#fff',
                padding: '12px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 8px 30px rgba(255, 68, 68, 0.3)', animation: 'fadeIn 0.3s ease',
                cursor: 'pointer',
              }} onClick={() => setProjectError(null)}>
                {projectError}
              </div>
            )}

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.controllers.projects.title}</h2>
              <button className={styles.primaryBtn} onClick={() => setShowAddProjectForm(true)}>{t.controllers.projects.add}</button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ flex: '1 1 300px' }}>
                <input
                  type="text"
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  placeholder={isRTL ? 'البحث في المشاريع...' : 'Search projects...'}
                  className={styles.formInput}
                  style={{ margin: 0, width: '100%' }}
                />
              </div>
              <div style={{ flex: '0 1 200px' }}>
                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value as any)}
                  className={styles.formInput}
                  style={{ margin: 0, width: '100%' }}
                >
                  <option value="all">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
                  <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                  <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                  <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                  <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
                </select>
              </div>
              <div style={{ flex: '0 1 200px' }}>
                <select
                  value={projectPriorityFilter}
                  onChange={(e) => setProjectPriorityFilter(e.target.value as any)}
                  className={styles.formInput}
                  style={{ margin: 0, width: '100%' }}
                >
                  <option value="all">{isRTL ? 'كل الأولويات' : 'All Priorities'}</option>
                  <option value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</option>
                  <option value="high">{isRTL ? 'عالية' : 'High'}</option>
                  <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
                  <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
                </select>
              </div>
              {(projectSearchTerm || projectStatusFilter !== 'all' || projectPriorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setProjectSearchTerm('')
                    setProjectStatusFilter('all')
                    setProjectPriorityFilter('all')
                  }}
                  style={{
                    padding: '0 1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                </button>
              )}
            </div>

            {/* Add New Project Form */}
            {showAddProjectForm && (
              <div className={styles.addForm} style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: '#fff' }}>
                  {t.controllers.projects.add}
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>{t.controllers.projects.name} *</label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder={isRTL ? 'اسم المشروع...' : 'Project name...'}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{isRTL ? 'العميل' : 'Client'} *</label>
                    <select
                      value={newProjectUserId}
                      onChange={(e) => setNewProjectUserId(e.target.value)}
                      className={styles.formInput}
                      disabled={clientsLoading}
                    >
                      <option value="">{clientsLoading ? (isRTL ? 'جاري التحميل...' : 'Loading...') : (isRTL ? 'اختر العميل...' : 'Select client...')}</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.display_name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{isRTL ? 'السعر (ر.س)' : 'Price (SAR)'} *</label>
                    <input
                      type="number"
                      min="0"
                      value={newProjectPrice}
                      onChange={(e) => setNewProjectPrice(e.target.value)}
                      placeholder="0"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.controllers.projects.deadline} *</label>
                    <input
                      type="date"
                      value={newProjectDeadline}
                      onChange={(e) => setNewProjectDeadline(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.controllers.projects.priority}</label>
                    <select
                      value={newProjectPriority}
                      onChange={(e) => setNewProjectPriority(e.target.value as APIProject['priority'])}
                      className={styles.formInput}
                    >
                      <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
                      <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
                      <option value="high">{isRTL ? 'عالية' : 'High'}</option>
                      <option value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{isRTL ? 'الحالة' : 'Status'}</label>
                    <select
                      value={newProjectStatus}
                      onChange={(e) => setNewProjectStatus(e.target.value as APIProject['status'])}
                      className={styles.formInput}
                    >
                      <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                      <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                      <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                      <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button
                    className={styles.primaryBtn}
                    onClick={addNewProject}
                    disabled={projectActionLoading || !newProjectName || !newProjectUserId || !newProjectPrice || !newProjectDeadline}
                    style={{ opacity: projectActionLoading || !newProjectName || !newProjectUserId || !newProjectPrice || !newProjectDeadline ? 0.5 : 1 }}
                  >
                    {projectActionLoading ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (<><SaveIcon size={16} /> {t.controllers.projects.add}</>)}
                  </button>
                  <button className={styles.secondaryBtn} onClick={() => setShowAddProjectForm(false)}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Project Modal */}
            {editingProject && (
              <div className={styles.modalOverlay} onClick={() => setEditingProject(null)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>
                      {t.controllers.projects.edit}: {editingProject.name}
                    </h3>
                    <button
                      onClick={() => setEditingProject(null)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>{t.controllers.projects.name}</label>
                      <input
                        type="text"
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{isRTL ? 'السعر (ر.س)' : 'Price (SAR)'}</label>
                      <input
                        type="number"
                        min="0"
                        value={editProjectPrice}
                        onChange={(e) => setEditProjectPrice(parseFloat(e.target.value) || 0)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{isRTL ? 'المصروف (ر.س)' : 'Spent (SAR)'}</label>
                      <input
                        type="number"
                        min="0"
                        value={editProjectSpent}
                        onChange={(e) => setEditProjectSpent(parseFloat(e.target.value) || 0)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{isRTL ? 'الحالة' : 'Status'}</label>
                      <select
                        value={editProjectStatus}
                        onChange={(e) => setEditProjectStatus(e.target.value as APIProject['status'])}
                        className={styles.formInput}
                      >
                        <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                        <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                        <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t.controllers.projects.deadline}</label>
                      <input
                        type="date"
                        value={editProjectDeadline}
                        onChange={(e) => setEditProjectDeadline(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t.controllers.projects.priority}</label>
                      <select
                        value={editProjectPriority}
                        onChange={(e) => setEditProjectPriority(e.target.value as APIProject['priority'])}
                        className={styles.formInput}
                      >
                        <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
                        <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
                        <option value="high">{isRTL ? 'عالية' : 'High'}</option>
                        <option value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editProjectHasSigned}
                          onChange={(e) => setEditProjectHasSigned(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: '#0070F3', cursor: 'pointer' }}
                        />
                        {isRTL ? 'تم التوقيع على العقد' : 'Contract Signed'}
                      </label>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginTop: '20px',
                    padding: '15px 0 0',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <button
                      className={styles.primaryBtn}
                      onClick={saveEditedProject}
                      disabled={projectActionLoading}
                      style={{ opacity: projectActionLoading ? 0.5 : 1 }}
                    >
                      {projectActionLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (<><SaveIcon size={16} /> {isRTL ? 'حفظ التغييرات' : 'Save Changes'}</>)}
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => setEditingProject(null)}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDeleteProject && (
              <div className={styles.modalOverlay} onClick={() => setConfirmDeleteProject(null)}>
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
                    <button className={styles.secondaryBtn} onClick={() => setConfirmDeleteProject(null)}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => handleDeleteProject(confirmDeleteProject)}
                      disabled={projectActionLoading}
                      style={{
                        background: 'linear-gradient(135deg, #FF4444, #FF8C00)',
                        opacity: projectActionLoading ? 0.5 : 1,
                      }}
                    >
                      {projectActionLoading ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'حذف المشروع' : 'Delete Project')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {projectsLoading && (
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
            {!projectsLoading && filteredProjects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>📁</div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                  {projects.length === 0 
                    ? (isRTL ? 'لا توجد مشاريع' : 'No Projects Found')
                    : (isRTL ? 'لا توجد نتائج' : 'No Results Found')
                  }
                </h3>
                <p>
                  {projects.length === 0 
                    ? (isRTL ? 'أنشئ مشروعك الأول للبدء' : 'Create your first project to get started')
                    : (isRTL ? 'حاول تغيير معايير البحث أو الفلتر' : 'Try changing your search or filter criteria')
                  }
                </p>
                {projects.length === 0 && (
                  <button
                    className={styles.primaryBtn}
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => setShowAddProjectForm(true)}
                  >
                    {isRTL ? 'إنشاء مشروع' : 'Create Project'}
                  </button>
                )}
              </div>
            )}

            {/* Project Cards Grid */}
            {!projectsLoading && filteredProjects.length > 0 && (
              <div className={styles.projectsGrid}>
                {filteredProjects.map(project => {
                  const overallProgress = computeOverallProgress(project)
                  const statusLabels: Record<string, { ar: string; en: string }> = {
                    active: { ar: 'نشط', en: 'Active' },
                    pending: { ar: 'معلق', en: 'Pending' },
                    completed: { ar: 'مكتمل', en: 'Completed' },
                    onhold: { ar: 'متوقف', en: 'On Hold' },
                  }
                  return (
                    <div key={project.id} className={styles.projectCard}>
                      <div className={styles.projectCardHeader}>
                        <h3>{project.name}</h3>
                        <span 
                          className={styles.badge}
                          style={{ backgroundColor: getStatusColor(project.status) }}
                        >
                          {isRTL ? statusLabels[project.status]?.ar : statusLabels[project.status]?.en}
                        </span>
                      </div>
                      
                      <p className={styles.projectClient}>
                        <span 
                          className={styles.badge}
                          style={{ backgroundColor: getPriorityColor(project.priority), fontSize: '0.7rem' }}
                        >
                          {project.priority}
                        </span>
                        <span style={{ marginInlineStart: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          {formatDate(project.deadline)}
                        </span>
                      </p>
                      
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
                          <div 
                            className={styles.progressFill}
                            style={{ width: `${overallProgress}%` }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                        <span>{isRTL ? 'الميزانية' : 'Budget'}: <span style={{ color: '#00C781' }}>{formatCurrency(project.price)}</span></span>
                        <span>{isRTL ? 'المصروف' : 'Spent'}: <span style={{ color: '#FF8C00' }}>{formatCurrency(project.spent)}</span></span>
                      </div>

                      <div className={styles.projectFooter}>
                        <span className={styles.teamInfo}><UsersIcon size={16} /> {project.team?.length || 0} {isRTL ? 'أعضاء' : 'members'}</span>
                        <div className={styles.actionButtons}>
                          <button className={styles.iconBtn} onClick={() => openEditProject(project)} title={isRTL ? 'إدارة' : 'Manage'}><EditIcon size={18} /></button>
                          <button 
                            className={styles.iconBtn} 
                            onClick={() => setConfirmDeleteProject(project.id)} 
                            title={isRTL ? 'حذف' : 'Delete'}
                            style={{ color: '#ff6b6b' }}
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Project Details Modal */}
            {viewingProject && (
              <div className={styles.modalOverlay} onClick={() => setViewingProject(null)}>
                <div 
                  className={styles.modal} 
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
                >
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>
                      {isRTL ? 'إدارة المشروع' : 'Manage Project'}
                    </h2>
                    <button
                      onClick={() => setViewingProject(null)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#94a3b8', 
                        fontSize: '1.5rem', 
                        cursor: 'pointer',
                        padding: '0 0.5rem'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Editable Project Info */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1.1rem' }}>
                      {isRTL ? 'معلومات المشروع' : 'Project Information'}
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {isRTL ? 'اسم المشروع' : 'Project Name'}
                        </label>
                        <input
                          type="text"
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          className={styles.formInput}
                          style={{ margin: 0, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {isRTL ? 'الميزانية (ر.س)' : 'Budget (SAR)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editProjectPrice}
                          onChange={(e) => setEditProjectPrice(parseFloat(e.target.value) || 0)}
                          className={styles.formInput}
                          style={{ margin: 0, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {isRTL ? 'المصروف (ر.س)' : 'Spent (SAR)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editProjectSpent}
                          onChange={(e) => setEditProjectSpent(parseFloat(e.target.value) || 0)}
                          className={styles.formInput}
                          style={{ margin: 0, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {isRTL ? 'الموعد النهائي' : 'Deadline'}
                        </label>
                        <input
                          type="date"
                          value={editProjectDeadline}
                          onChange={(e) => setEditProjectDeadline(e.target.value)}
                          className={styles.formInput}
                          style={{ margin: 0, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <select
                          value={editProjectStatus}
                          onChange={(e) => setEditProjectStatus(e.target.value as APIProject['status'])}
                          className={styles.formInput}
                          style={{ margin: 0, width: '100%' }}
                        >
                          <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                          <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                          <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                          <option value="onhold">{isRTL ? 'متوقف' : 'On Hold'}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {isRTL ? 'الأولوية' : 'Priority'}
                        </label>
                        <select
                          value={editProjectPriority}
                          onChange={(e) => setEditProjectPriority(e.target.value as APIProject['priority'])}
                          className={styles.formInput}
                          style={{ margin: 0, width: '100%' }}
                        >
                          <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
                          <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
                          <option value="high">{isRTL ? 'عالية' : 'High'}</option>
                          <option value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem' }}>
                          <input
                            type="checkbox"
                            checked={editProjectHasSigned}
                            onChange={(e) => setEditProjectHasSigned(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: '#0070F3', cursor: 'pointer' }}
                          />
                          {isRTL ? 'تم التوقيع على العقد' : 'Contract Signed'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                        {isRTL ? 'مراحل التقدم' : 'Progress Items'}
                      </h3>
                      <button
                        onClick={() => setShowProgressModal(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(0, 112, 243, 0.15)',
                          border: '1px solid rgba(0, 112, 243, 0.3)',
                          borderRadius: '8px',
                          color: '#0070F3',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      >
                        + {isRTL ? 'إضافة مرحلة' : 'Add Item'}
                      </button>
                    </div>
                    
                    {!viewingProject.progress || viewingProject.progress.length === 0 ? (
                      <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        color: '#94a3b8',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px'
                      }}>
                        {isRTL ? 'لا توجد مراحل تقدم' : 'No progress items yet'}
                      </div>
                    ) : (
                      <DraggableProgressBar
                        items={viewingProject.progress}
                        completedIds={viewingProject.progress_completed || []}
                        isRTL={isRTL}
                        onUpdatePercent={(itemId, percent) => handleUpdateProgress(itemId, { percent })}
                        onToggleComplete={handleToggleProgressComplete}
                        onEdit={(item) => setEditingProgressItem(item)}
                        onRemove={handleRemoveProgress}
                        isFinished={viewingProject.status === 'completed'}
                        onFinishToggle={async (checked) => {
                          const projectId = viewingProject.id
                          try {
                            setProjectActionLoading(true)
                            const newStatus = checked ? 'completed' : 'active'
                            const res = await apiUpdateProject(projectId, { status: newStatus })
                            if (res.success) {
                              showProjectSuccess(checked
                                ? (isRTL ? '🏁 تم إنهاء المشروع بنجاح' : '🏁 Project marked as completed')
                                : (isRTL ? 'تم إعادة تفعيل المشروع' : 'Project reactivated')
                              )
                              const updated = await getProjectById(projectId)
                              if (updated.success && updated.data) {
                                const pd = Array.isArray(updated.data) ? updated.data[0] : updated.data
                                if (pd) setViewingProject(normalizeProjectData(pd))
                              }
                              await refreshProjectData()
                            }
                          } catch (err) {
                            setProjectError(isRTL ? 'فشل في تحديث حالة المشروع' : 'Failed to update project status')
                          } finally {
                            setProjectActionLoading(false)
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Team Section */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                        {isRTL ? 'فريق العمل' : 'Team Members'}
                      </h3>
                      <button
                        onClick={() => setShowTeamModal(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(0, 199, 129, 0.15)',
                          border: '1px solid rgba(0, 199, 129, 0.3)',
                          borderRadius: '8px',
                          color: '#00C781',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      >
                        + {isRTL ? 'إضافة عضو' : 'Add Member'}
                      </button>
                    </div>
                    
                    {!viewingProject.team || viewingProject.team.length === 0 ? (
                      <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        color: '#94a3b8',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px'
                      }}>
                        {isRTL ? 'لا يوجد أعضاء في الفريق' : 'No team members yet'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {viewingProject.team.map(memberId => (
                          <div 
                            key={memberId}
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'rgba(255,255,255,0.03)',
                              borderRadius: '12px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <UserIcon size={16} />
                              <span style={{ color: '#fff', fontSize: '0.9rem' }}>
                                {memberId}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveTeamMember(memberId)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(255, 68, 68, 0.15)',
                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#FF4444',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              {isRTL ? 'إزالة' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div style={{ 
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => setViewingProject(null)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.95rem'
                      }}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      onClick={saveProjectChanges}
                      disabled={projectActionLoading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #0070F3, #00C781)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        opacity: projectActionLoading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {projectActionLoading ? (
                        <>
                          <div style={{
                            width: '16px', 
                            height: '16px', 
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }} />
                          {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <SaveIcon size={16} />
                          {isRTL ? 'حفظ جميع التغييرات' : 'Save All Changes'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Progress Modal */}
            {showProgressModal && viewingProject && (
              <div className={styles.modalOverlay} onClick={() => setShowProgressModal(false)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>
                    {isRTL ? 'إضافة مرحلة تقدم' : 'Add Progress Item'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {isRTL ? 'العنوان' : 'Title'} *
                      </label>
                      <input
                        type="text"
                        value={newProgressTitle}
                        onChange={(e) => setNewProgressTitle(e.target.value)}
                        placeholder={isRTL ? 'مثال: تصميم الواجهة الأمامية' : 'Example: Frontend Design'}
                        className={styles.formInput}
                        style={{ margin: 0, width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {isRTL ? 'النسبة المئوية' : 'Percentage'} ({newProgressPercent}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newProgressPercent}
                        onChange={(e) => setNewProgressPercent(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#64748b'
                      }}>
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={handleAddProgress}
                      disabled={!newProgressTitle || projectActionLoading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: '#0070F3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        opacity: (!newProgressTitle || projectActionLoading) ? 0.5 : 1
                      }}
                    >
                      {projectActionLoading ? (isRTL ? 'جاري الإضافة...' : 'Adding...') : (isRTL ? 'إضافة' : 'Add')}
                    </button>
                    <button
                      onClick={() => setShowProgressModal(false)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Progress Modal */}
            {editingProgressItem && viewingProject && (
              <div className={styles.modalOverlay} onClick={() => setEditingProgressItem(null)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>
                    {isRTL ? 'تعديل مرحلة التقدم' : 'Edit Progress Item'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {isRTL ? 'العنوان' : 'Title'}
                      </label>
                      <input
                        type="text"
                        value={editingProgressItem.title}
                        onChange={(e) => setEditingProgressItem({ ...editingProgressItem, title: e.target.value })}
                        className={styles.formInput}
                        style={{ margin: 0, width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {isRTL ? 'النسبة المئوية' : 'Percentage'} ({editingProgressItem.percent}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingProgressItem.percent}
                        onChange={(e) => setEditingProgressItem({ ...editingProgressItem, percent: parseInt(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => handleUpdateProgress(editingProgressItem.id, { 
                        title: editingProgressItem.title, 
                        percent: editingProgressItem.percent 
                      })}
                      disabled={projectActionLoading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: '#0070F3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        opacity: projectActionLoading ? 0.5 : 1
                      }}
                    >
                      {projectActionLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                    </button>
                    <button
                      onClick={() => setEditingProgressItem(null)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Team Member Modal */}
            {showTeamModal && viewingProject && (
              <div className={styles.modalOverlay} onClick={() => setShowTeamModal(false)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>
                    {isRTL ? 'إضافة عضو فريق' : 'Add Team Member'}
                  </h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      {isRTL ? 'معرف المشرف (UUID)' : 'Admin ID (UUID)'} *
                    </label>
                    <input
                      type="text"
                      value={newTeamMemberId}
                      onChange={(e) => setNewTeamMemberId(e.target.value)}
                      placeholder="e.g. 770e8400-e29b-41d4-a716-446655440002"
                      className={styles.formInput}
                      style={{ margin: 0, width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={handleAddTeamMember}
                      disabled={!newTeamMemberId || projectActionLoading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: '#00C781',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        opacity: (!newTeamMemberId || projectActionLoading) ? 0.5 : 1
                      }}
                    >
                      {projectActionLoading ? (isRTL ? 'جاري الإضافة...' : 'Adding...') : (isRTL ? 'إضافة' : 'Add')}
                    </button>
                    <button
                      onClick={() => setShowTeamModal(false)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Finances Tab */}
        {activeTab === 'finances' && (
          <div className={styles.financesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.controllers.finances.title}</h2>
              <div className={styles.sectionActions}>
                <button className={styles.secondaryBtn}>{t.controllers.finances.export}</button>
                <button className={styles.primaryBtn}>{t.controllers.finances.add}</button>
              </div>
            </div>

            <div className={styles.financeCards}>
              <div className={styles.financeCard}>
                <h4>{t.controllers.finances.totalRevenue}</h4>
                <p className={styles.financeAmount} style={{ color: '#00C781' }}>
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className={styles.financeCard}>
                <h4>{t.controllers.finances.expenses}</h4>
                <p className={styles.financeAmount} style={{ color: '#FF4444' }}>
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
              <div className={styles.financeCard}>
                <h4>{t.controllers.finances.profit}</h4>
                <p className={styles.financeAmount} style={{ color: '#0070F3' }}>
                  {formatCurrency(stats.netProfit)}
                </p>
              </div>
              <div className={styles.financeCard}>
                <h4>{t.controllers.finances.pending}</h4>
                <p className={styles.financeAmount} style={{ color: '#FF8C00' }}>
                  {formatCurrency(stats.pendingRevenue)}
                </p>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <h3 className={styles.subsectionTitle}>{t.controllers.finances.transactions}</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{isRTL ? 'النوع' : 'Type'}</th>
                    <th>{t.financial.description}</th>
                    <th>{t.financial.amount}</th>
                    <th>{t.financial.date}</th>
                    <th>{t.financial.status}</th>
                    <th>{isRTL ? 'العميل' : 'Client'}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>
                        <span 
                          className={styles.badge}
                          style={{ 
                            backgroundColor: transaction.type === 'income' ? '#00C781' : '#FF4444' 
                          }}
                        >
                          {transaction.type === 'income' ? (isRTL ? 'دخل' : 'Income') : (isRTL ? 'مصروف' : 'Expense')}
                        </span>
                      </td>
                      <td>{isRTL ? transaction.description : transaction.descriptionEn}</td>
                      <td style={{ 
                        color: transaction.type === 'income' ? '#00C781' : '#FF4444',
                        fontWeight: 'bold'
                      }}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <span 
                          className={styles.badge}
                          style={{ backgroundColor: getStatusColor(transaction.status) }}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td>{transaction.client || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users / Admin Management Tab */}
        {activeTab === 'users' && (
          <div className={styles.usersSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{isRTL ? 'إدارة المسؤولين' : 'Admin Management'}</h2>
              <div className={styles.sectionActions}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={isRTL ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                />
                <button 
                  className={styles.primaryBtn}
                  onClick={() => setShowAddAdminModal(true)}
                >
                  {isRTL ? 'إضافة مسؤول' : 'Add Admin'}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {adminSuccess && (
              <div style={{
                padding: '1rem',
                background: 'rgba(0, 199, 129, 0.1)',
                border: '1px solid rgba(0, 199, 129, 0.3)',
                borderRadius: '12px',
                color: '#00C781',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {adminSuccess}
              </div>
            )}

            {/* Error Message */}
            {adminError && (
              <div style={{
                padding: '1rem',
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#FF4444',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {adminError}
              </div>
            )}

            {/* Admins Table */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{isRTL ? 'المسؤول' : 'Admin'}</th>
                    <th>{isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th>{isRTL ? 'الصلاحيات' : 'Permissions'}</th>
                    <th>{isRTL ? 'تاريخ الإضافة' : 'Date Added'}</th>
                    <th>{isRTL ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingAdmins ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        {isRTL ? 'لم يتم العثور على مسؤولين' : 'No admins found'}
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {admin.user?.avatar_url ? (
                              <img
                                src={admin.user.avatar_url}
                                alt={admin.user.display_name || admin.user.email || 'Admin'}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #9B59B6, #E91E63)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                              }}>
                                {admin.user?.display_name?.charAt(0) || admin.user?.email?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: '600', color: '#fff' }}>
                                {admin.user?.display_name || admin.user?.first_name && admin.user?.last_name ? `${admin.user.first_name} ${admin.user.last_name}` : (isRTL ? 'بدون اسم' : 'No name')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ color: '#94a3b8' }} dir="ltr">
                            {admin.user?.email || (isRTL ? 'بدون بريد' : 'No email')}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {admin.permissions.length === 0 ? (
                              <span style={{
                                padding: '4px 10px',
                                background: 'rgba(148, 163, 184, 0.2)',
                                color: '#94a3b8',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                {isRTL ? 'لا توجد صلاحيات' : 'No permissions'}
                              </span>
                            ) : (
                              admin.permissions.slice(0, 2).map(perm => {
                                const permData = AVAILABLE_PERMISSIONS.find(p => p.key === perm)
                                return (
                                  <span key={perm} style={{
                                    padding: '4px 10px',
                                    background: 'rgba(0, 112, 243, 0.2)',
                                    color: '#0070F3',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                  }}>
                                    {isRTL ? permData?.labelAr : permData?.label || perm}
                                  </span>
                                )
                              })
                            )}
                            {admin.permissions.length > 2 && (
                              <span style={{
                                padding: '4px 10px',
                                background: 'rgba(112, 66, 248, 0.2)',
                                color: '#b4a0f8',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                +{admin.permissions.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#94a3b8' }}>
                            {admin.created_at ? formatDate(admin.created_at) : (isRTL ? 'غير محدد' : 'Not specified')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin)
                                setShowPermissionsModal(true)
                              }}
                              className={styles.iconBtn}
                              title={isRTL ? 'تعديل الصلاحيات' : 'Edit Permissions'}
                              style={{ color: '#0070F3' }}
                            >
                              <EditIcon size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className={styles.iconBtn}
                              title={isRTL ? 'حذف' : 'Delete'}
                              style={{ color: '#FF4444' }}
                            >
                              <TrashIcon size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Admin Modal */}
            {showAddAdminModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}>
                <div style={{
                  background: '#1E293B',
                  borderRadius: '20px',
                  padding: '2rem',
                  width: '100%',
                  maxWidth: '500px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
                      {isRTL ? 'إضافة مسؤول جديد' : 'Add New Admin'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddAdminModal(false)
                        setSelectedUserId('')
                        setSearchUserTerm('')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        padding: '0.25rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {isRTL ? 'البحث عن مستخدم' : 'Search for User'}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={searchUserTerm}
                        onChange={(e) => setSearchUserTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                        placeholder={isRTL ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
                        className={styles.searchInput}
                        dir="ltr"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={handleSearchUsers}
                        disabled={isLoadingUsers}
                        className={styles.primaryBtn}
                        style={{ opacity: isLoadingUsers ? 0.5 : 1 }}
                      >
                        {isRTL ? 'بحث' : 'Search'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {isRTL ? 'اختر مستخدم' : 'Select User'}
                    </label>
                    <div style={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      padding: '0.5rem'
                    }}>
                      {isLoadingUsers ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                          <div style={{ 
                            width: '30px', 
                            height: '30px', 
                            border: '3px solid rgba(0, 112, 243, 0.2)', 
                            borderTop: '3px solid #0070F3', 
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                          {searchUserTerm ? (isRTL ? 'لم يتم العثور على مستخدمين - جرب كلمات مفتاحية مختلفة' : 'No matching users found - try different keywords') : (isRTL ? 'لا يوجد مستخدمون متاحون' : 'No available users')}
                        </p>
                      ) : (
                        availableUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem',
                              borderRadius: '12px',
                              border: 'none',
                              background: selectedUserId === u.id ? '#0070F3' : 'rgba(255, 255, 255, 0.05)',
                              color: selectedUserId === u.id ? '#fff' : '#94a3b8',
                              cursor: 'pointer',
                              marginBottom: '0.5rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #9B59B6, #E91E63)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold'
                              }}>
                                {u.display_name?.charAt(0) || u.email?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div style={{ textAlign: isRTL ? 'right' : 'left', flex: 1 }}>
                              <div style={{ fontWeight: '500', marginBottom: '0.2rem' }}>
                                {u.display_name || u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : 'No name'}
                              </div>
                              <div style={{ fontSize: '0.85rem', opacity: 0.8 }} dir="ltr">{u.email}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={handleAddAdmin}
                      disabled={!selectedUserId || isSubmitting}
                      className={styles.primaryBtn}
                      style={{ flex: 1, opacity: (!selectedUserId || isSubmitting) ? 0.5 : 1 }}
                    >
                      {isSubmitting ? (isRTL ? 'جاري الإضافة...' : 'Adding...') : (isRTL ? 'إضافة' : 'Add')}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddAdminModal(false)
                        setSelectedUserId('')
                        setSearchUserTerm('')
                      }}
                      className={styles.secondaryBtn}
                      style={{ flex: 1 }}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Permissions Modal */}
            {showPermissionsModal && selectedAdmin && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}>
                <div style={{
                  background: '#1E293B',
                  borderRadius: '20px',
                  padding: '2rem',
                  width: '100%',
                  maxWidth: '500px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
                      {isRTL ? 'إدارة الصلاحيات' : 'Manage Permissions'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowPermissionsModal(false)
                        setSelectedAdmin(null)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        padding: '0.25rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {isRTL ? 'المسؤول:' : 'Admin:'} <span style={{ color: '#fff' }}>{selectedAdmin.user?.display_name || selectedAdmin.user?.email || selectedAdmin.user_id}</span>
                    </p>
                  </div>

                  <PermissionsModalContent
                    admin={selectedAdmin}
                    onClose={() => {
                      setShowPermissionsModal(false)
                      setSelectedAdmin(null)
                    }}
                    onSave={handleUpdatePermissions}
                    isSubmitting={isSubmitting}
                    isRTL={isRTL}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.controllers.activity.title}</h2>
              <button className={styles.secondaryBtn}>{t.controllers.activity.filter}</button>
            </div>

            <div className={styles.activityTimeline}>
              {activities.map(activity => (
                <div key={activity.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <strong>{activity.user}</strong>
                      <span className={styles.timelineTime}>{formatDateTime(activity.time)}</span>
                    </div>
                    <p className={styles.timelineAction}>{isRTL ? activity.action : activity.actionEn}</p>
                    <p className={styles.timelineDetails}>{isRTL ? activity.details : activity.detailsEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ==================== Draggable Progress Line Bar Component ====================
function DraggableProgressBar({
  items,
  completedIds,
  isRTL,
  onUpdatePercent,
  onToggleComplete,
  onEdit,
  onRemove,
  isFinished,
  onFinishToggle,
}: {
  items: { id: string; title: string; percent: number }[]
  completedIds: string[]
  isRTL: boolean
  onUpdatePercent: (itemId: string, percent: number) => void
  onToggleComplete: (itemId: string, isCompleted: boolean) => void
  onEdit: (item: { id: string; title: string; percent: number }) => void
  onRemove: (itemId: string) => void
  isFinished: boolean
  onFinishToggle: (checked: boolean) => void
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [localPercents, setLocalPercents] = useState<Record<string, number>>({})

  // Sync local percents when items change
  useEffect(() => {
    const percents: Record<string, number> = {}
    items.forEach(item => { percents[item.id] = item.percent })
    setLocalPercents(percents)
  }, [items])

  const getPercentFromX = (clientX: number): number => {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.round((x / rect.width) * 100)
    return Math.max(0, Math.min(100, percent))
  }

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingId(itemId)

    const handleMouseMove = (ev: MouseEvent) => {
      const newPercent = getPercentFromX(ev.clientX)
      setLocalPercents(prev => ({ ...prev, [itemId]: newPercent }))
    }

    const handleMouseUp = (ev: MouseEvent) => {
      const finalPercent = getPercentFromX(ev.clientX)
      setDraggingId(null)
      onUpdatePercent(itemId, finalPercent)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    e.stopPropagation()
    setDraggingId(itemId)
    const touch = e.touches[0]
    setLocalPercents(prev => ({ ...prev, [itemId]: getPercentFromX(touch.clientX) }))

    const handleTouchMove = (ev: TouchEvent) => {
      ev.preventDefault()
      const t = ev.touches[0]
      const newPercent = getPercentFromX(t.clientX)
      setLocalPercents(prev => ({ ...prev, [itemId]: newPercent }))
    }

    const handleTouchEnd = (ev: TouchEvent) => {
      const t = ev.changedTouches[0]
      const finalPercent = getPercentFromX(t.clientX)
      setDraggingId(null)
      onUpdatePercent(itemId, finalPercent)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
  }

  // Color palette for items
  const colors = ['#0070F3', '#00C781', '#FF8C00', '#FF4444', '#A855F7', '#EC4899', '#14B8A6', '#F59E0B']
  const getColor = (index: number) => colors[index % colors.length]

  // Sort items by percent for visual clarity
  const sortedItems = [...items].sort((a, b) => {
    const pA = localPercents[a.id] ?? a.percent
    const pB = localPercents[b.id] ?? b.percent
    return pA - pB
  })

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Percentage marks */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 0 0.25rem',
        fontSize: '0.7rem',
        color: '#64748b',
        userSelect: 'none',
      }}>
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>

      {/* The unified line bar */}
      <div
        ref={barRef}
        style={{
          position: 'relative',
          height: '8px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '3.5rem',
          marginBottom: '1rem',
        }}
      >
        {/* Colored fill segments — fill from 0 to max percent (or 100% if isFinished) */}
        {/* Only checked (completed) items contribute to the fill */}
        {(sortedItems.length > 0 || isFinished) && (() => {
          const completedItems = sortedItems.filter(it => completedIds.includes(it.id))
          const maxPercent = isFinished
            ? 100
            : completedItems.length > 0
              ? Math.max(...completedItems.map(it => localPercents[it.id] ?? it.percent))
              : 0
          return (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${maxPercent}%`,
              background: isFinished
                ? 'linear-gradient(90deg, #0070F3, #00C781, #FFD700)'
                : 'linear-gradient(90deg, rgba(0,112,243,0.3), rgba(0,199,129,0.3))',
              borderRadius: '4px',
              boxShadow: isFinished ? '0 0 8px rgba(255,215,0,0.4)' : 'none',
              transition: 'width 0.5s ease, background 0.5s ease, box-shadow 0.5s ease',
            }} />
          )
        })()}

        {/* Tick marks at 25% intervals */}
        {[25, 50, 75].map(tick => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              left: `${tick}%`,
              top: '-4px',
              width: '1px',
              height: '16px',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
        ))}

        {/* Fixed "Finish Project" marker at 100% */}
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 25,
          }}
        >
          {/* Label above */}
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FFD700',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {isRTL ? 'إنهاء المشروع' : 'Finish'}
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FFD700', marginTop: '2px' }}>100%</div>
          </div>
          {/* Fixed circle — not draggable */}
          <div
            title={isRTL ? 'نقطة نهاية المشروع — لا يمكن تغييرها' : 'Project finish point — cannot be changed'}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: isFinished
                ? 'radial-gradient(circle at 35% 35%, #FFD700, #B8860B)'
                : 'radial-gradient(circle at 35% 35%, #FFD70088, #B8860B55)',
              border: `3px solid ${isFinished ? '#FFD700' : '#FFD70066'}`,
              boxShadow: isFinished
                ? '0 0 20px #FFD700aa, 0 0 40px #FFD70050'
                : '0 0 8px #FFD70030',
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.4s ease',
            }}
          >
            {isFinished ? (
              /* Checkmark when done */
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: 'absolute' }}>
                <path d="M2.5 6.5L5.5 9.5L10.5 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              /* Star / flag icon */
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: 'absolute' }}>
                <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z" fill="#fff" opacity="0.5" />
              </svg>
            )}
          </div>
        </div>

        {/* Draggable circles for each item */}
        {items.map((item, index) => {
          const percent = localPercents[item.id] ?? item.percent
          const isCompleted = completedIds.includes(item.id)
          const isDragging = draggingId === item.id
          const isHovered = hoveredId === item.id
          const color = isCompleted ? '#00C781' : getColor(index)

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${percent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: isDragging ? 20 : isHovered ? 15 : 10,
                transition: isDragging ? 'none' : 'left 0.3s ease',
              }}
            >
              {/* Task name label above */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem',
                  fontWeight: isDragging || isHovered ? 700 : 500,
                  color: isDragging || isHovered ? color : '#cbd5e1',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  opacity: isDragging || isHovered ? 1 : 0.85,
                  transition: 'all 0.2s ease',
                  textShadow: isDragging ? `0 0 8px ${color}40` : 'none',
                }}
              >
                {item.title}
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: color,
                  marginTop: '2px',
                }}>
                  {percent}%
                </div>
              </div>

              {/* The draggable circle */}
              <div
                onMouseDown={(e) => handleMouseDown(e, item.id)}
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  width: isDragging ? '28px' : isHovered ? '24px' : '20px',
                  height: isDragging ? '28px' : isHovered ? '24px' : '20px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${color}, ${color}cc)`,
                  border: `3px solid ${isDragging ? '#fff' : isCompleted ? '#00C781' : color}`,
                  boxShadow: isDragging
                    ? `0 0 20px ${color}80, 0 0 40px ${color}40`
                    : isHovered
                      ? `0 0 12px ${color}60, 0 0 4px ${color}30`
                      : `0 2px 8px rgba(0,0,0,0.3)`,
                  cursor: 'grab',
                  transition: isDragging ? 'none' : 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Completed checkmark */}
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: 'absolute' }}>
                    <path d="M2 5L4.5 7.5L8 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {/* Pulse animation when dragging */}
                {isDragging && (
                  <div style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: `2px solid ${color}40`,
                    animation: 'progressPulse 1s ease-out infinite',
                  }} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Items legend / actions list below the bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '1rem',
      }}>
        {items.map((item, index) => {
          const percent = localPercents[item.id] ?? item.percent
          const isCompleted = completedIds.includes(item.id)
          const color = isCompleted ? '#00C781' : getColor(index)

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: hoveredId === item.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                border: `1px solid ${hoveredId === item.id ? color + '40' : 'rgba(255,255,255,0.05)'}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                {/* Color dot */}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${color}40`,
                }} />
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => onToggleComplete(item.id, isCompleted)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: color }}
                />
                {/* Title */}
                <span style={{
                  color: isCompleted ? '#64748b' : '#e2e8f0',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                }}>
                  {item.title}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: color, fontWeight: 700, fontSize: '0.85rem', minWidth: '38px', textAlign: 'center' }}>
                  {percent}%
                </span>
                <button
                  onClick={() => onEdit(item)}
                  style={{
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(0, 112, 243, 0.12)',
                    border: '1px solid rgba(0, 112, 243, 0.25)',
                    borderRadius: '6px',
                    color: '#0070F3',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <EditIcon size={13} />
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  style={{
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(255, 68, 68, 0.12)',
                    border: '1px solid rgba(255, 68, 68, 0.25)',
                    borderRadius: '6px',
                    color: '#FF4444',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fixed "Finish Project" legend entry */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          background: isFinished ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.05)',
          borderRadius: '10px',
          border: isFinished ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid rgba(255, 215, 0, 0.2)',
          marginTop: '0.25rem',
          boxShadow: isFinished ? '0 0 12px rgba(255,215,0,0.15)' : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onClick={() => onFinishToggle(!isFinished)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {/* Gold dot */}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#FFD700',
            flexShrink: 0,
            boxShadow: isFinished ? '0 0 10px #FFD70090' : '0 0 6px #FFD70060',
          }} />
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isFinished}
            onChange={(e) => { e.stopPropagation(); onFinishToggle(e.target.checked) }}
            style={{
              width: '17px',
              height: '17px',
              cursor: 'pointer',
              accentColor: '#FFD700',
              flexShrink: 0,
            }}
          />
          <span style={{
            color: isFinished ? '#FFD700' : '#b8960a',
            fontSize: '0.88rem',
            fontWeight: 700,
            transition: 'color 0.3s ease',
          }}>
            {isRTL ? '🏁 إنهاء المشروع' : '🏁 Finish Project'}
          </span>
          {isFinished && (
            <span style={{ fontSize: '0.75rem', color: '#00C781', fontWeight: 600 }}>
              {isRTL ? '✓ مكتمل!' : '✓ Done!'}
            </span>
          )}
        </div>
        <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.85rem', minWidth: '38px', textAlign: 'center' }}>
          100%
        </span>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes progressPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// Permissions Modal Component
function PermissionsModalContent({
  admin,
  onClose,
  onSave,
  isSubmitting,
  isRTL
}: {
  admin: ProjectAdmin
  onClose: () => void
  onSave: (permissions: string[]) => void
  isSubmitting: boolean
  isRTL: boolean
}) {
  const [permissions, setPermissions] = useState<string[]>(admin.permissions || [])

  const togglePermission = (key: string) => {
    setPermissions(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {AVAILABLE_PERMISSIONS.map(perm => (
          <label
            key={perm.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '0.75rem',
              background: permissions.includes(perm.key) ? 'rgba(0, 112, 243, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: permissions.includes(perm.key) ? '1px solid rgba(0, 112, 243, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s'
            }}
          >
            <input
              type="checkbox"
              checked={permissions.includes(perm.key)}
              onChange={() => togglePermission(perm.key)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#0070F3'
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: '500', marginBottom: '0.25rem' }}>
                {isRTL ? perm.labelAr : perm.label}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                {isRTL ? perm.descriptionAr : perm.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => onSave(permissions)}
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#0070F3',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            opacity: isSubmitting ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isSubmitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          {isRTL ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}

export default function ControllersPage() {
  return (
    <LanguageProvider>
      <ControllersContent />
    </LanguageProvider>
  )
}
