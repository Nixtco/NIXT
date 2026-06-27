import type { ProjectMediaItem } from '@/app/Projects/apiFunctions'

const storageKey = (projectId: string) => `nixt_project_media_${projectId}`

export function loadProjectMedia(
  projectId: string,
  apiMedia?: ProjectMediaItem[]
): ProjectMediaItem[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId))
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectMediaItem[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...parsed].sort(
          (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
        )
      }
    }
  } catch {
    /* ignore */
  }

  if (apiMedia?.length) {
    return [...apiMedia].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    )
  }

  return []
}

export function saveProjectMedia(projectId: string, media: ProjectMediaItem[]): void {
  localStorage.setItem(storageKey(projectId), JSON.stringify(media))
}

export function getProjectMediaCount(
  projectId: string,
  apiMedia?: ProjectMediaItem[]
): number {
  return loadProjectMedia(projectId, apiMedia).length
}
