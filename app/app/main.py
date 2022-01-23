from app.defaults import formio
import json
import os
from typing import List

from fastapi import APIRouter, FastAPI, HTTPException, Request, status, Depends
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware

import app.crud as crud
from app.config import settings
from app.model import SurveySchema, SurveyCreateUpdateSchema
from app.database import connect_to_mongo, close_mongo_connection, AsyncIOMotorCollection, get_collection

BASE_PATH = os.getenv("BASE_PATH", "")

app = FastAPI(
    title="Surveys API Wrapper", openapi_url=f"/openapi.json", docs_url="/docs", root_path=BASE_PATH
)
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

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


defaultrouter = APIRouter()


@defaultrouter.post("/assets/", response_description="Add new survey", response_model=SurveySchema, status_code=201)
async def create_survey(survey: SurveyCreateUpdateSchema = formio, collection: AsyncIOMotorCollection = Depends(get_collection)):
    return await crud.create(collection, survey)


@defaultrouter.get(
    "/assets/", response_description="List all surveys", response_model=List[SurveySchema]
)
async def list_surveys(collection: AsyncIOMotorCollection = Depends(get_collection)):
    return await crud.get_all(collection)


@defaultrouter.get(
    "/assets/{id}", response_description="Get a single survey", response_model=SurveySchema
)
async def show_survey(id: str, collection: AsyncIOMotorCollection = Depends(get_collection)):
    survey = await crud.get(collection, id)
    if survey is not None:
        return survey

    raise HTTPException(status_code=404, detail="Survey {id} not found")


# SPECIFIC
@defaultrouter.put(
    "/assets/{id}", response_description="Update survey"
)
async def update_asset(id: str, asset_in: SurveyCreateUpdateSchema, collection: AsyncIOMotorCollection = Depends(get_collection)):
    asset = await crud.get(collection, id)
    if asset:
        return await crud.update(collection, id, asset_in.dict())

    raise HTTPException(status_code=404, detail="Asset {id} not found")


integrablerouter = APIRouter()

@integrablerouter.get(
    "/assets/{id}/gui/", response_description="GUI for specific survey"
)
async def gui_survey(id: str, request: Request, collection: AsyncIOMotorCollection = Depends(get_collection)):
    survey = await crud.get(collection, id)
    if survey is not None:
        response = templates.TemplateResponse("surveyjsinstantiator.html", {"request": request, "BASE_PATH": BASE_PATH, "data": json.dumps(survey)})
        return response

    raise HTTPException(status_code=404, detail=f"Survey {id} not found")

@integrablerouter.get(
    "/assets/instantiator/", response_description="Survey creator"
)

async def creator(request: Request):
    return templates.TemplateResponse("surveyjsinstantiator.html", {"request": request, "BASE_PATH": BASE_PATH})


@integrablerouter.post(
    "/assets/{id}/clone/", response_description="Clone specific survey", response_model=SurveySchema, status_code=201
)
async def clone_survey(id: str, collection: AsyncIOMotorCollection = Depends(get_collection)):
    survey = crud.get(collection, id)
    if survey is not None:
        return await crud.create(collection, survey)

    raise HTTPException(status_code=404, detail="Survey {id} not found")


@integrablerouter.delete("/assets/{id}", response_description="Delete an survey")
async def delete_survey(id: str, collection: AsyncIOMotorCollection = Depends(get_collection)):
    if crud.get(collection, id) is not None:
        delete_result = await crud.delete(collection, id)
        if delete_result.deleted_count == 1:
            return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail="Survey {id} not found")


customrouter = APIRouter()

@customrouter.get(
    "/assets/{id}/answer/", response_description="GUI for modifying survey"
)
async def gui_survey(id: str, request: Request, collection: AsyncIOMotorCollection = Depends(get_collection)):
    survey = await crud.get(collection, id)
    if survey is not None:
        response = templates.TemplateResponse("surveyjsviewer.html", {"request": request, "BASE_PATH": BASE_PATH, "data": json.dumps(survey)})
        return response

    raise HTTPException(status_code=404, detail=f"Survey {id} not found")

@customrouter.get(
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
app.include_router(integrablerouter, tags=["Integrable"])
app.include_router(customrouter, tags=["Custom endpoints"])
app.include_router(defaultrouter, prefix=settings.API_V1_STR, tags=["Default operations"])
