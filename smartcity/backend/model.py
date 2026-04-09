import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings("ignore")


def generate_synthetic_data(n=1200):
    np.random.seed(42)
    
    transport_map = {"Low": 0, "Medium": 1, "High": 2}
    transports = np.random.choice(["Low", "Medium", "High"], n, p=[0.3, 0.4, 0.3])
    transport_encoded = np.array([transport_map[t] for t in transports])

    pop_density = np.random.uniform(500, 15000, n)
    literacy = np.random.uniform(40, 100, n)
    internet = np.random.uniform(10, 100, n)
    aqi = np.random.uniform(20, 400, n)
    waste = np.random.uniform(20, 100, n)
    water = np.random.uniform(30, 100, n)
    energy = np.random.uniform(500, 5000, n)
    gdp = np.random.uniform(2000, 80000, n)
    crime = np.random.uniform(1, 100, n)
    governance = np.random.uniform(10, 100, n)

    smart_score = (
        (literacy / 100) * 20 +
        (internet / 100) * 20 +
        transport_encoded * 5 +
        (1 - aqi / 400) * 15 +
        (waste / 100) * 10 +
        (water / 100) * 10 +
        (1 - energy / 5000) * 5 +
        (gdp / 80000) * 10 +
        (1 - crime / 100) * 5 +
        (governance / 100) * 10
    )
    
    noise = np.random.normal(0, 5, n)
    smart_score += noise
    label = (smart_score > 50).astype(int)

    df = pd.DataFrame({
        "population_density": pop_density,
        "literacy_rate": literacy,
        "internet_penetration": internet,
        "public_transport": transports,
        "aqi": aqi,
        "waste_management": waste,
        "water_supply": water,
        "energy_consumption": energy,
        "gdp_per_capita": gdp,
        "crime_rate": crime,
        "smart_governance": governance,
        "smart_city": label
    })
    return df


class SmartCityModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.le = LabelEncoder()
        self.feature_names = [
            "population_density", "literacy_rate", "internet_penetration",
            "public_transport_enc", "aqi", "waste_management", "water_supply",
            "energy_consumption", "gdp_per_capita", "crime_rate", "smart_governance"
        ]
        self.accuracy = 0
        self.trained = False

    def _preprocess(self, df: pd.DataFrame):
        transport_map = {"Low": 0, "Medium": 1, "High": 2}
        df = df.copy()
        if "public_transport" in df.columns:
            df["public_transport_enc"] = df["public_transport"].map(transport_map).fillna(1)
            df.drop(columns=["public_transport"], inplace=True)
        if "smart_city" in df.columns:
            df.drop(columns=["smart_city"], inplace=True)
        return df[self.feature_names]

    def train(self):
        df = generate_synthetic_data(1200)
        X = self._preprocess(df)
        y = df["smart_city"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.model = RandomForestClassifier(
            n_estimators=150, max_depth=10, min_samples_split=5,
            random_state=42, n_jobs=-1
        )
        self.model.fit(X_train_scaled, y_train)
        
        preds = self.model.predict(X_test_scaled)
        self.accuracy = round(accuracy_score(y_test, preds) * 100, 2)
        self.trained = True
        print(f"[Model] Trained | Accuracy: {self.accuracy}%")

    def predict(self, data: dict) -> dict:
        if not self.trained:
            self.train()

        row = pd.DataFrame([data])
        X = self._preprocess(row)
        X_scaled = self.scaler.transform(X)

        proba = self.model.predict_proba(X_scaled)[0]
        pred_class = self.model.predict(X_scaled)[0]
        
        prob_smart = round(float(proba[1]) * 100, 2)
        prob_not = round(float(proba[0]) * 100, 2)
        confidence = round(max(prob_smart, prob_not), 2)
        prediction = "Smart City" if pred_class == 1 else "Not Smart City"

        importances = dict(zip(
            self.feature_names,
            [round(float(v) * 100, 2) for v in self.model.feature_importances_]
        ))

        insights = self._generate_insights(data, pred_class, importances)

        return {
            "prediction": prediction,
            "confidence": confidence,
            "probability_smart": prob_smart,
            "probability_not_smart": prob_not,
            "feature_importance": importances,
            "insights": insights
        }

    def _generate_insights(self, data: dict, pred: int, importance: dict) -> list:
        insights = []
        
        aqi = float(data.get("aqi", 100))
        internet = float(data.get("internet_penetration", 50))
        water = float(data.get("water_supply", 60))
        literacy = float(data.get("literacy_rate", 70))
        governance = float(data.get("smart_governance", 50))
        crime = float(data.get("crime_rate", 30))
        waste = float(data.get("waste_management", 60))
        transport = data.get("public_transport", "Medium")
        gdp = float(data.get("gdp_per_capita", 20000))

        if aqi > 200:
            insights.append({"type": "negative", "icon": "warning", "text": f"High AQI ({aqi:.0f}) severely impacts smart classification — air quality is critical."})
        elif aqi < 80:
            insights.append({"type": "positive", "icon": "check", "text": f"Excellent air quality (AQI {aqi:.0f}) contributes positively to the smart score."})

        if internet > 75:
            insights.append({"type": "positive", "icon": "wifi", "text": f"Strong internet penetration ({internet:.0f}%) significantly boosts digital infrastructure score."})
        elif internet < 40:
            insights.append({"type": "negative", "icon": "warning", "text": f"Low internet penetration ({internet:.0f}%) limits smart city potential."})

        if water < 50:
            insights.append({"type": "negative", "icon": "drop", "text": f"Low water supply coverage ({water:.0f}%) reduces urban efficiency rating."})
        elif water > 85:
            insights.append({"type": "positive", "icon": "check", "text": f"High water supply coverage ({water:.0f}%) indicates strong infrastructure."})

        if literacy > 85:
            insights.append({"type": "positive", "icon": "book", "text": f"High literacy rate ({literacy:.0f}%) drives innovation and civic participation."})
        elif literacy < 55:
            insights.append({"type": "negative", "icon": "warning", "text": f"Low literacy rate ({literacy:.0f}%) creates barriers to smart technology adoption."})

        if governance > 75:
            insights.append({"type": "positive", "icon": "gov", "text": f"High smart governance score ({governance:.0f}%) enables efficient city management."})

        if crime > 60:
            insights.append({"type": "negative", "icon": "warning", "text": f"Elevated crime rate ({crime:.0f}) negatively affects livability and smart index."})

        if transport == "High":
            insights.append({"type": "positive", "icon": "bus", "text": "High public transport availability reduces congestion and boosts sustainability."})
        elif transport == "Low":
            insights.append({"type": "negative", "icon": "warning", "text": "Low public transport coverage increases dependency on private vehicles."})

        if gdp > 40000:
            insights.append({"type": "positive", "icon": "chart", "text": f"Strong GDP per capita (${gdp:,.0f}) supports investment in smart infrastructure."})
        elif gdp < 8000:
            insights.append({"type": "negative", "icon": "warning", "text": f"Low GDP per capita (${gdp:,.0f}) may constrain smart city investments."})

        return insights[:6]

    def get_info(self):
        return {
            "accuracy": self.accuracy,
            "model_type": "RandomForestClassifier",
            "n_estimators": 150,
            "features": self.feature_names,
            "trained": self.trained
        }
