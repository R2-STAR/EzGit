import axios from 'axios'
import type {
  PRResult, SearchResponse, IndexResponse,
  IndexStatus, ScanStartResponse, ScanResult,
  Architecture, LocalSetup,
} from '../types'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
})

client.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || err.message
    return Promise.reject(new Error(msg))
  },
)

export const explainPR = async (
  repo: string, prNumber: number, provider: 'github' | 'gitlab' = 'github'
): Promise<PRResult> => {
  const { data } = await client.post('/pr/explain', { repo, pr_number: prNumber, provider })
  return data
}

export const getPRHistory = async (repo: string) => {
  const { data } = await client.get(`/pr/history/${repo}`)
  return data
}

export const searchCode = async (
  repo: string, query: string, topK = 10
): Promise<SearchResponse> => {
  const { data } = await client.post('/search/', { repo, query, top_k: topK })
  return data
}

export const indexRepo = async (repo: string): Promise<IndexResponse> => {
  const { data } = await client.post('/search/index', { repo })
  return data
}

export const getIndexStatus = async (repo: string): Promise<IndexStatus> => {
  const { data } = await client.get(`/search/index-status/${repo}`)
  return data
}

export const startScan = async (repo: string): Promise<ScanStartResponse> => {
  const { data } = await client.post('/scan/start', { repo })
  return data
}

export const getScanResult = async (scanId: string): Promise<ScanResult> => {
  const { data } = await client.get(`/scan/${scanId}`)
  return data
}

export const getArchitecture = async (
  repo: string, provider: 'github' | 'gitlab' = 'github'
): Promise<Architecture> => {
  const { data } = await client.post('/onboard/architecture', { repo, provider })
  return data
}

export const getLocalSetup = async (repo: string): Promise<LocalSetup> => {
  const { data } = await client.post('/onboard/setup', { repo })
  return data
}
