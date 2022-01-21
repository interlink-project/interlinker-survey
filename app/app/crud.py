from fastapi.encoders import jsonable_encoder
from app.model import SurveySchema
import uuid 

async def get(collection, id: str):
    return await collection.find_one({"_id": id})

async def get_all(collection):
    return await collection.find().to_list(1000)

async def create(collection, survey: dict):
    survey = jsonable_encoder(survey)
    survey["_id"] = uuid.uuid4().hex
    # Validate
    survey = SurveySchema(**survey)
    # Encode
    survey = jsonable_encoder(survey)
    db_survey = await collection.insert_one(survey)
    return await get(collection, db_survey.inserted_id)

async def update(collection, id: str, data):
    await collection.update_one( { "_id": id }, { "$set": data })
    return await get(collection,id)
    
async def delete(collection, id: str):
    return await collection.delete_one({"_id": id})