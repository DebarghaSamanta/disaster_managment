from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
import joblib
import datetime
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import os
# importing necessary functions from dotenv library
from dotenv import load_dotenv, dotenv_values 
# loading variables from .env file
load_dotenv() 
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN")],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#LOading the file from where it is kept
model = joblib.load("disaster_releif_calculator.pkl")

client = MongoClient(os.getenv("MONGODB_URL"))
db = client["disaster_db"]
collection = db["predictions"]
#pydantic for checking importaing basemodel from that package
class InputData(BaseModel):
    Disaster_Type: str
    Severity: int
    Area_Size_sq_km: float
    Population_Affected: int
    Duration_days: int
    Babies_0_2: int
    Elderly_60_plus: int
    Women_18_60: int
    Adults_18_60: int
#sends post request to /predict making sure the input is in df format because of column transformer and then using : to make sure the column name on the left matches wth what it was tested with and then the input
@app.post("/predict")
def predict(data: InputData):
    input_df = pd.DataFrame([{
        'Disaster Type': data.Disaster_Type,
        'Severity': data.Severity,
        'Area Size (sq km)': data.Area_Size_sq_km,
        'Population Affected': data.Population_Affected,
        'Duration (days)': data.Duration_days,
        'Babies (0-2)': data.Babies_0_2,
        'Elderly (60+)': data.Elderly_60_plus,
        'Women (18-60)': data.Women_18_60,
        'Adults (18-60)': data.Adults_18_60
    }])
    
    prediction_values = model.predict(input_df).tolist()[0]
    print("Prediction complete.")
    y_labels = [
        'Rice Supply (kg)',
        'Vegetables Supply (kg)',
        'Dry Food Supply (kg)',
        'Water Supply (liters)',
        'Baby Food Supply (kg)',
        'Sanitary Pads Supply (pcs)',
        'Medicine Supply (kg)'
    ]
    prediction = {
    label: round(value)
    for label, value in zip(y_labels, prediction_values)
    }
    print("Saving to MongoDB...")
    #Save both input and output to MongoDB
    collection.insert_one({
        "input": data.dict(),
        "prediction": prediction,
        "timestamp": datetime.datetime.now()
    })

    return {"prediction": prediction}
