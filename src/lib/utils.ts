import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ModelGroup } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function findModelById(modelGroups: ModelGroup[], modelId: string) {
  for (const group of modelGroups) {
    const model = group.models.find((m) => m.id === modelId)
    if (model) return model
  }
  return null
}
