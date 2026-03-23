import { useMutation, useQuery } from '@tanstack/react-query'
import { startScan, getScanResult } from '../api'

export const useStartScan = () => {
  return useMutation({
    mutationFn: (repo: string) => startScan(repo),
  })
}

export const useScanResult = (scanId: string | null) => {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => getScanResult(scanId!),
    enabled: !!scanId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'pending' || status === 'running' ? 4000 : false
    },
  })
}
