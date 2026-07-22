from datetime import datetime

from pydantic import BaseModel, EmailStr


# ---------- Auth ----------
class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    picture: str | None = None
    pro: bool = False
    plan: str | None = None
    aiModel: str | None = None
    accessToken: str | None = None
    createdAt: datetime | None = None


class UpdatePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


# ---------- Analysis ----------
class ClauseAnalysis(BaseModel):
    clauseText: str
    simplifiedExplanation: str
    riskLevel: str
    riskReason: str
    negotiationSuggestion: str
    suggestedRewrite: str | None = None


class KeyTerm(BaseModel):
    term: str
    definition: str


class KeyDate(BaseModel):
    date: str
    description: str


class MissingClause(BaseModel):
    clauseName: str
    reason: str


class ChunkSummary(BaseModel):
    chunkIndex: int
    summary: str


class AnalysisResponse(BaseModel):
    summary: str
    clauses: list[ClauseAnalysis]
    keyTerms: list[KeyTerm]
    keyDates: list[KeyDate]
    missingClauses: list[MissingClause]
    chunkSummaries: list[ChunkSummary] | None = None


class StoredAnalysis(BaseModel):
    id: str
    userId: str
    fileName: str
    analysisDate: str
    analysisResult: AnalysisResponse
    documentText: str


class AnalyzeRequest(BaseModel):
    text: str
    role: str = ""
    fileName: str = "document"


class SimulateRequest(BaseModel):
    documentText: str
    scenario: str


# ---------- Negotiation copilot ----------
class NegotiationPoint(BaseModel):
    clauseText: str
    concern: str = ""  # why the clause is a problem (e.g. the risk reason)
    request: str = ""  # the change to ask for (e.g. the negotiation suggestion)
    desiredRewrite: str | None = None  # preferred wording, if the user picked one


class NegotiationDraftRequest(BaseModel):
    points: list[NegotiationPoint]
    tone: str = "polite"  # polite | neutral | firm
    format: str = "email"  # email | message | letter
    counterparty: str = ""  # who the message is addressed to (e.g. "Landlord")
    senderName: str = ""  # optional name to sign off with


class NegotiationDraftResponse(BaseModel):
    subject: str = ""  # empty for non-email formats
    body: str


# ---------- Lawyer Referral ----------
class LawyerProfile(BaseModel):
    id: str
    name: str
    specializations: list[str]
    bio: str
    experienceYears: int
    city: str
    email: str
    phone: str | None = None
    rating: float | None = 0.0
    verified: bool = False
    createdAt: datetime


class ContactLawyerRequest(BaseModel):
    lawyerId: str
    message: str
    contactEmail: str


class LawyerRegistrationRequest(BaseModel):
    name: str
    email: EmailStr
    specializations: list[str]
    bio: str
    experienceYears: int
    city: str
    phone: str | None = None
