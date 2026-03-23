from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class PRExplainRequest(BaseModel):
    repo: str
    pr_number: int
    provider: Optional[str] = "github"


class RiskyFile(BaseModel):
    file: str
    reason: str
    severity: str = "medium"


class PRExplanation(BaseModel):
    summary: str
    risky_files: List[RiskyFile]
    architecture_impact: str
    onboarding_tip: str
    risk_score: int


class PRSummaryResponse(BaseModel):
    id: int
    repo_url: str
    pr_number: int
    title: Optional[str]
    summary: PRExplanation
    risk_score: int
    created_at: datetime

    class Config:
        from_attributes = True
