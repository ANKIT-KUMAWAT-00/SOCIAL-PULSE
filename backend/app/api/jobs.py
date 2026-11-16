import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.job import ProcessingJob
from app.schemas.experiment import JobResponse

router = APIRouter(prefix="", tags=["Jobs"])

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SocialPulse Backend Intelligence Engine",
        "timestamp": datetime.utcnow().isoformat()
    }
