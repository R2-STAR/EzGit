from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ScanRequest(BaseModel):
    repo: str


class Finding(BaseModel):
    severity: str
    message: str
    file: str
    line: Optional[int] = None
    rule_id: Optional[str] = None
    cve: Optional[str] = None
    package: Optional[str] = None
    version: Optional[str] = None
    fix_version: Optional[str] = None


class ScanResult(BaseModel):
    id: str
    repo_url: str
    status: str
    semgrep_findings: Optional[List[Finding]] = []
    snyk_findings: Optional[List[Finding]] = []
    ai_report: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScanStartResponse(BaseModel):
    scan_id: str
    message: str = "Scan started. Poll GET /scan/{scan_id} for results."
