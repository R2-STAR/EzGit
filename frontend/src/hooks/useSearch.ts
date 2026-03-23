import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { searchCode, indexRepo, getIndexStatus } from '../api'

export const useSearch = () => {
  return useMutation({
    mutationFn: ({
      repo,
      query,
      topK,
    }: {
      repo: string
      query: string
      topK?: number
    }) => searchCode(repo, query, topK),
  })
}

export const useIndexRepo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (repo: string) => indexRepo(repo),
    onSuccess: (_, repo) => {
      queryClient.invalidateQueries({ queryKey: ['indexStatus', repo] })
    },
  })
}

export const useIndexStatus = (repo: string) => {
  return useQuery({
    queryKey: ['indexStatus', repo],
    queryFn: () => getIndexStatus(repo),
    enabled: !!repo,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'indexing' || status === 'pending' ? 3000 : false
    },
  })
}
