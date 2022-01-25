from pydantic import BaseModel, Field, Extra
from typing import Union

class SurveySchema(BaseModel, extra=Extra.allow):
    id: str = Field(..., alias='_id')
    

class SurveyCreateUpdateSchema(BaseModel, extra=Extra.allow):
    title: Union[str, object]