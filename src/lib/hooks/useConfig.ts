import { useQuery } from '@tanstack/react-query'

interface Config {
  isPasswordRequired: boolean
}

async function fetchConfig(): Promise<Config> {
  const response = await fetch('/api/config')
  if (!response.ok) {
    throw new Error('Failed to fetch config')
  }
  return response.json()
}

export function useConfig() {
  return useQuery<Config>({
    queryKey: ['config'],
    queryFn: fetchConfig,
  })
}
