export interface RiskyFile {
  file: string
  reason: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export interface PRExplanation {
  summary: string
  risky_files: RiskyFile[]
  architecture_impact: string
  onboarding_tip: string
  risk_score: number
}

export interface PRResult {
  repo: string
  pr_number: number
  title: string
  author: string
  changed_files: string[]
  summary: PRExplanation
  risk_score: number
}

export interface SearchHit {
  file_path: string
  chunk_text: string
  similarity: number
}

export interface SearchResponse {
  query: string
  repo: string
  results: SearchHit[]
  total: number
}

export interface IndexResponse {
  repo: string
  status: string
  message: string
}

export interface IndexStatus {
  repo_url: string
  status: 'not_indexed' | 'pending' | 'indexing' | 'done' | 'error'
  file_count?: number
  chunk_count?: number
  indexed_at?: string
}

export interface Finding {
  rule_id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  message: string
  file: string
  line?: number
  cve?: string
  package?: string
  version?: string
  fix_version?: string
}

export interface ScanResult {
  id: string
  repo_url: string
  status: 'pending' | 'running' | 'done' | 'error'
  semgrep_findings: Finding[]
  snyk_findings: Finding[]
  ai_report?: string
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface ScanStartResponse {
  scan_id: string
  message: string
}

export interface ImportantDirectory {
  path: string
  purpose: string
}

export interface Architecture {
  repo: string
  overview: string
  tech_stack: string[]
  important_directories: ImportantDirectory[]
  entry_points: string[]
  quick_start: string
  file_count: number
}

export interface LocalSetup {
  repo: string
  language: string
  framework: string
  docker_compose: string
  makefile: string
  instructions: string[]
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type Provider = 'github' | 'gitlab'
