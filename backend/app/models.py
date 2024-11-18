from pydantic import BaseModel, Field, validator
from typing import List


# Data Models
class JobDetailsRequest(BaseModel):
    jd: str


class PeopleSearchRequest(BaseModel):
    company_name: str
    target_role: str
    relevant_titles: List[str]
    location: str
    job_summary: str


class SearchKeywords(BaseModel):
    company_name: str = Field(description="Company name extracted from job posting")
    target_role: str = Field(description="The exact role you're applying for")
    relevant_titles: List[str] = Field(
        description="List of three most relevant job titles to search for",
        max_items=3,
    )
    location: str = Field(
        description="Physical location of the job (city, state, or country)"
    )
    job_summary: str = Field(description="Job Summary extracted from job posting")

    @validator("relevant_titles", pre=True, always=True)
    def validate_titles(cls, v, values):
        if not v:
            return [values.get("target_role")]
        return v

    @validator("location", pre=True, always=True)
    def clean_location(cls, v):
        location = v.lower()
        remove_terms = ["remote", "hybrid", "work from home", "wfh"]
        for term in remove_terms:
            location = location.replace(term, "").strip()
        return location.strip(", ").title()


class ProfileScore(BaseModel):
    profile_id: str = Field(description="LinkedIn profile ID")
    name: str = Field(description="Full name of the person")
    current_position: str = Field(description="Current role/title")
    relevance_score: int = Field(description="Relevance score from 1-10", ge=1, le=10)
    reasoning: str = Field(
        description="Brief explanation for the score (max 2 sentences)"
    )


class BatchProfileScoring(BaseModel):
    scored_profiles: List[ProfileScore] = Field(
        description="List of scored profiles ordered by relevance"
    )
