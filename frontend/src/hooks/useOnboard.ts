import { useMutation } from '@tanstack/react-query'
import { getArchitecture, getLocalSetup } from '../api'

export const useArchitecture = () => {
  return useMutation({
    mutationFn: ({
      repo,
      provider,
    }: {
      repo: string
      provider: 'github' | 'gitlab'
    }) => getArchitecture(repo, provider),
  })
}

export const useLocalSetup = () => {
  return useMutation({
    mutationFn: (repo: string) => getLocalSetup(repo),
  })
}
