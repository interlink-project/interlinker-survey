from app.database import db
from fastapi.encoders import jsonable_encoder
from app.model import SurveySchema
import uuid 

async def get(id: str):
    return await db["surveys"].find_one({"_id": id})

async def get_all():
    return await db["surveys"].find().to_list(1000)

async def create(survey: dict):
    survey = jsonable_encoder(survey)
    survey["_id"] = uuid.uuid4().hex
    # Validate
    survey = SurveySchema(**survey)
    # Encode
    survey = jsonable_encoder(survey)
    db_survey = await db["surveys"].insert_one(survey)
    return await get(db_survey.inserted_id)

async def delete(id: str):
    return await db["surveys"].delete_one({"_id": id})