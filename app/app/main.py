from app.defaults import formio
import json
import os
from typing import List

from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware

import app.crud as crud
from app.config import settings
from app.model import SurveySchema

BASE_PATH = os.getenv("BASE_PATH", "")

app = FastAPI(
    title="Surveys API Wrapper", openapi_url=f"/openapi.json", docs_url="/docs", root_path=BASE_PATH
)

#templates = Jinja2Templates(directory="react")
#app.mount("/static", StaticFiles(directory="react/static"), name="static")
#app.mount("/scripts", StaticFiles(directory="static"), name="scripts")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

mainrouter = APIRouter()


@mainrouter.get("/")
def main():
    return RedirectResponse(url=f"{BASE_PATH}/docs")


@mainrouter.get("/healthcheck/")
def healthcheck():
    return True


specificrouter = APIRouter()

defaultrouter = APIRouter()


@defaultrouter.post("/assets/", response_description="Add new survey", response_model=SurveySchema, status_code=201)
async def create_survey(survey: dict = formio):
    return await crud.create(survey)


@defaultrouter.get(
    "/assets/", response_description="List all surveys", response_model=List[SurveySchema]
)
async def list_surveys():
    return await crud.get_all()


@defaultrouter.get(
    "/assets/{id}", response_description="Get a single survey", response_model=SurveySchema
)
async def show_survey(id: str):
    survey = await crud.get(id)
    if survey is not None:
        return survey

    raise HTTPException(status_code=404, detail="Survey {id} not found")


@defaultrouter.post(
    "/assets/{id}/clone/", response_description="Clone specific survey", response_model=SurveySchema, status_code=201
)
async def clone_survey(id: str):
    survey = crud.get(id)
    if survey is not None:
        return await crud.create(survey)

    raise HTTPException(status_code=404, detail="Survey {id} not found")


@defaultrouter.delete("/assets/{id}", response_description="Delete an survey")
async def delete_survey(id: str):
    if crud.get(id) is not None:
        delete_result = await crud.delete(id)
        if delete_result.deleted_count == 1:
            return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail="Survey {id} not found")


# GUI

@defaultrouter.get(
    "/assets/{id}/gui/", response_description="GUI for specific survey"
)
async def gui_survey(id: str, request: Request):
    survey = await crud.get(id)
    if survey is not None:
        response = templates.TemplateResponse("viewer.html", {"request": request, "BASE_PATH": BASE_PATH, "data": json.dumps(survey)})
        return response

    raise HTTPException(status_code=404, detail=f"Survey {id} not found")

@defaultrouter.get(
    "/assets/{id}/modify/", response_description="GUI for modifying survey"
)
async def gui_survey(id: str, request: Request):
    survey = await crud.get(id)
    if survey is not None:
        response = templates.TemplateResponse("instantiator.html", {"request": request, "BASE_PATH": BASE_PATH, "data": json.dumps(survey)})
        return response

    raise HTTPException(status_code=404, detail=f"Survey {id} not found")


@defaultrouter.get(
    "/assets/instantiator/", response_description="Survey creator"
)
async def creator(request: Request):
    return templates.TemplateResponse("instantiator.html", {"request": request, "BASE_PATH": BASE_PATH})


@mainrouter.get(
    "/example/", response_description="GUI for example survey"
)
async def example():
    survey_id = "548843c87b344cedaa0554276888da6b"
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">

    <head>
    <title>Integration example</title>
    </head>

    <body>
    Aquí estaría el interlinker y todo su contenido
    <script src="http://localhost:8921/static/load.js" id="survey-script" data-surveyid="{survey_id}"></script>
    </body>

    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)



app.include_router(mainrouter, tags=["main"])
app.include_router(defaultrouter, prefix=settings.API_V1_STR, tags=["default"])
app.include_router(specificrouter, prefix=settings.API_V1_STR, tags=["specific"])
