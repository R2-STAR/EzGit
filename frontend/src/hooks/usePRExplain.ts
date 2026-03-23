import { useMutation } from '@tanstack/react-query'
import { explainPR } from '../api'

export const usePRExplain = () => {
  return useMutation({
    mutationFn: ({
      repo,
      prNumber,
      provider,
    }: {
      repo: string
      prNumber: number
      provider: 'github' | 'gitlab'
    }) => explainPR(repo, prNumber, provider),
  })
}
