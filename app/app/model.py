from pydantic import BaseModel, Field, Extra

class SurveySchema(BaseModel, extra=Extra.allow):
    id: str = Field(..., alias='_id')
    

class SurveyCreateUpdateSchema(BaseModel):
    name: str
    translations: dict
    formSchema: dict = Field(..., alias='schema')