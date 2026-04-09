from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import numpy as np
import pandas as pd
import pickle
import io
import json
from model import SmartCityModel

app = FastAPI(title="Smart City Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SmartCityModel()
model.train()

class CityInput(BaseModel):
    population_density: float
    literacy_rate: float
    internet_penetration: float
    public_transport: str
    aqi: float
    waste_management: float
    water_supply: float
    energy_consumption: float
    gdp_per_capita: float
    crime_rate: float
    smart_governance: float

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probability_smart: float
    probability_not_smart: float
    feature_importance: dict
    insights: list

@app.get("/")
def root():
    return {"message": "Smart City Prediction API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: CityInput):
    try:
        result = model.predict(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-bulk")
async def predict_bulk(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        required_cols = ["population_density","literacy_rate","internet_penetration",
                        "public_transport","aqi","waste_management","water_supply",
                        "energy_consumption","gdp_per_capita","crime_rate","smart_governance"]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")
        
        results = []
        for _, row in df.iterrows():
            r = model.predict(row.to_dict())
            results.append({
                "prediction": r["prediction"],
                "confidence": r["confidence"],
                **{c: row[c] for c in required_cols}
            })
        
        output = pd.DataFrame(results)
        stream = io.StringIO()
        output.to_csv(stream, index=False)
        stream.seek(0)
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=predictions.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-info")
def model_info():
    return model.get_info()
