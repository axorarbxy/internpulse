from fastapi import FastAPI, HTTPException, Query

from app.models.schemas import (
    Grievance,
    GrievanceCreate,
    GrievanceListResponse,
    GrievanceStatus,
    StatusUpdate,
)
from app.services.manager import GrievanceManager

app = FastAPI(
    title="AI-Assisted Grievance & Reclamation System",
    version="1.0.0",
    description="Triage, draft resolution, route, and track student grievances.",
)
manager = GrievanceManager()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/grievances", response_model=Grievance, status_code=201)
def create_grievance(request: GrievanceCreate) -> Grievance:
    return manager.create(request)


@app.get("/grievances/{grievance_id}", response_model=Grievance)
def get_grievance(grievance_id: str) -> Grievance:
    grievance = manager.repository.get(grievance_id)
    if grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return grievance


@app.get("/grievances", response_model=GrievanceListResponse)
def list_grievances(
    student_id: str | None = Query(default=None, alias="studentId"),
) -> GrievanceListResponse:
    grievances = manager.repository.list(student_id)
    return GrievanceListResponse(grievances=grievances, total=len(grievances))


@app.patch("/grievances/{grievance_id}/status", response_model=Grievance)
def update_status(grievance_id: str, request: StatusUpdate) -> Grievance:
    grievance = manager.repository.update_status(grievance_id, request.status, request.resolution_note)
    if grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return grievance
