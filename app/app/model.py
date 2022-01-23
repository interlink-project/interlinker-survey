from pydantic import BaseModel, Field, Extra

class SurveySchema(BaseModel, extra=Extra.allow):
    id: str = Field(..., alias='_id')
    

class SurveyCreateUpdateSchema(BaseModel, extra=Extra.allow):
    title: str