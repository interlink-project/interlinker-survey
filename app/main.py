import os
from typing import List

from fastapi import APIRouter, Body, FastAPI, File, HTTPException, UploadFile, status, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware

import app.crud as crud
import json
from app.config import settings
from app.model import SurveySchema
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

templates = Jinja2Templates(directory="react/build")
templates2 = Jinja2Templates(directory="templates")

BASE_PATH = os.getenv("BASE_PATH", "")

app = FastAPI(
    title="Surveys API Wrapper", openapi_url=f"/openapi.json", docs_url="/docs", root_path=BASE_PATH
)
app.mount("/static", StaticFiles(directory="react/build/static"), name="static")
app.mount("/scripts", StaticFiles(directory="static"), name="scripts")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

"""
from fastapi_utils.tasks import repeat_every
@apirouter.on_event("startup")
@repeat_every(seconds=60 * 60)  # 1 hour
def repetitive_task() -> None:
    pass
    # clean(db)
"""

mainrouter = APIRouter()

@mainrouter.get("/")
def main():
    return RedirectResponse(url=f"{BASE_PATH}/docs")

@mainrouter.get("/healthcheck/")
def healthcheck():
    return True

specificrouter = APIRouter()

defaultrouter = APIRouter()

@defaultrouter.post("/surveys/", response_description="Add new survey", response_model=SurveySchema, status_code=201)
async def create_survey(survey: dict = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "title": "Long Description",
      "type": "string"
    },
    "done": {
      "type": "boolean"
    },
    "due_date": {
      "type": "string",
      "format": "date"
    },
    "rating": {
      "type": "integer",
      "maximum": 5
    },
    "recurrence": {
      "type": "string",
      "enum": ["Never", "Daily", "Weekly", "Monthly"]
    },
    "recurrence_interval": {
      "type": "integer"
    }
  },
  "required": ["name", "due_date"]
}):
    return await crud.create(survey)


@defaultrouter.get(
    "/surveys/", response_description="List all surveys", response_model=List[SurveySchema]
)
async def list_surveys():
    return await crud.get_all()


@defaultrouter.get(
    "/surveys/{id}", response_description="Get a single survey", response_model=SurveySchema
)
async def show_survey(id: str):
    survey = await crud.get(id)
    if survey is not None:
        return survey

    raise HTTPException(status_code=404, detail="Survey {id} not found")

@defaultrouter.post(
    "/surveys/{id}/clone", response_description="Clone specific survey", response_model=SurveySchema, status_code=201
)
async def clone_survey(id: str):
    survey = crud.get(id)
    if survey is not None:
        return await crud.create(survey)

    raise HTTPException(status_code=404, detail="Survey {id} not found")


@defaultrouter.delete("/surveys/{id}", response_description="Delete an survey")
async def delete_survey(id: str):
    if crud.get(id) is not None:
        delete_result = await crud.delete(id)
        if delete_result.deleted_count == 1:
            return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail="Survey {id} not found")

@defaultrouter.get(
    "/surveys/{id}/gui", response_description="GUI for specific survey"
)
async def gui_survey(id: str, request: Request):
    survey = await crud.get(id)
    if survey is not None:
        response = templates.TemplateResponse(
            "index.html", {"request": request, "data": json.dumps(survey)})
        return response

    raise HTTPException(status_code=404, detail=f"Survey {id} not found")

@defaultrouter.get(
    "/example", response_description="GUI for example survey"
)
async def example(request: Request):
    response = templates2.TemplateResponse(
            "example.html", {"request": request})
    return response

app.include_router(mainrouter, tags=["main"])
app.include_router(defaultrouter, prefix=settings.API_V1_STR, tags=["default"])
app.include_router(specificrouter, prefix=settings.API_V1_STR, tags=["specific"])
