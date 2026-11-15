# AgriSmart AI – Backend REST API Reference

All endpoints are prefixed with `/api/v1`.
Protected endpoints require a valid Supabase JWT Bearer token passed in the `Authorization` header:
`Authorization: Bearer <supabase_jwt_token>`

In local development mode without Supabase connected, pass `Authorization: Bearer dev-farmer-token` (for farmer access) or `Authorization: Bearer dev-admin-token` (for administrative access).

---

## 1. System Endpoints

### `GET /api/v1/health`
Check API server operational status.
- **Auth:** Public
- **Response:**
  ```json
  {
    "success": true,
    "message": "AgriSmart AI API v1 Operational",
    "data": {
      "timestamp": "2026-11-06T14:49:18.754Z",
      "service": "AgriSmart AI Core Service",
      "version": "1.0.0"
    },
    "error": null
  }
  ```

### `GET /api/v1/constants`
Retrieve Indian agricultural constants (States, Soil types, Seasons).
- **Auth:** Public

---

## 2. Farmer Profile

### `GET /api/v1/profile`
Retrieve the authenticated farmer's profile.
- **Auth:** Required (Farmer/Admin)

### `PUT /api/v1/profile`
Update farmer profile and farm size.
- **Auth:** Required
- **Body:**
  ```json
  {
    "full_name": "Ramesh Chandra",
    "phone": "+919876543210",
    "state": "Punjab",
    "district": "Ludhiana",
    "village": "Samrala",
    "preferred_language": "en",
    "farm_size": 4.5,
    "farm_size_unit": "acre"
  }
  ```

### `DELETE /api/v1/profile`
Request complete deletion of account and associated records.
- **Auth:** Required

---

## 3. Crop Recommendations

### `POST /api/v1/crops/recommend`
Formulate precision crop recommendations matching soil, season, and water availability using Google Gemini.
- **Auth:** Required (Rate limited: 30 requests / 15 min)
- **Body:**
  ```json
  {
    "state": "Punjab",
    "district": "Ludhiana",
    "soilType": "Alluvial soil",
    "landArea": 2.5,
    "areaUnit": "acre",
    "season": "kharif",
    "waterAvailability": "moderate",
    "irrigationType": "Drip irrigation",
    "soilPH": 7.2,
    "nitrogen": 240,
    "phosphorus": 18,
    "potassium": 150,
    "additionalInformation": "Good drainage slope"
  }
  ```

### `GET /api/v1/crops/recommendations`
List previous recommendation sessions for the current farmer.

### `GET /api/v1/crops/recommendations/:id`
Retrieve a single recommendation record by ID.

### `DELETE /api/v1/crops/recommendations/:id`
Delete a recommendation record.

---

## 4. AI Plant Disease Detection

### `POST /api/v1/disease/analyze`
Analyze uploaded plant foliage image with Gemini multimodal vision.
- **Auth:** Required
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `image`: Image file buffer (JPG, PNG, WEBP, max 10MB)
  - `cropName`: String (e.g. "Tomato")
  - `growthStage`: String (optional)
  - `symptoms`: String (optional)

### `GET /api/v1/disease/history`
List previous disease scan reports.

### `GET /api/v1/disease/:id`
Retrieve single diagnosis report.

### `DELETE /api/v1/disease/:id`
Delete a diagnosis report.

---

## 5. Soil & Fertilizer Advisory

### `POST /api/v1/soil/advisory`
Calculate pH interpretation, nutrient status, and organic amendment schedule.
- **Auth:** Required
- **Body:**
  ```json
  {
    "cropName": "Wheat",
    "soilType": "Alluvial soil",
    "soilPH": 7.2,
    "nitrogen": 240,
    "phosphorus": 18,
    "potassium": 160,
    "organicCarbon": 0.55,
    "landArea": 1.0,
    "soilTestDate": "2026-10-15"
  }
  ```

### `GET /api/v1/soil/history`
Retrieve historical soil test advisories.

---

## 6. Weather-Aware Irrigation

### `POST /api/v1/irrigation/advisory`
Calculate actionable 48-72 hour irrigation instructions based on phenology and real weather.
- **Auth:** Required
- **Body:**
  ```json
  {
    "cropName": "Tomato",
    "growthStage": "Flowering & Anthesis",
    "soilType": "Clay loam",
    "irrigationMethod": "Drip irrigation",
    "availableWater": "moderate",
    "recentRainfallMm": 0,
    "currentWeatherContext": "Dry warm weather"
  }
  ```

---

## 7. Weather Advisory

### `GET /api/v1/weather/current`
Get live weather for coordinate or state.

### `GET /api/v1/weather/forecast`
Get 7-day daily weather forecast.

### `GET /api/v1/weather/advisory`
Get current weather, 7-day forecast, and agricultural weather alerts.

---

## 8. AI Agronomist Chatbot

### `POST /api/v1/chat/message`
Send question to Gemini AI Agronomist with conversation memory.
- **Auth:** Required
- **Body:**
  ```json
  {
    "message": "Why are my tomato leaves turning yellow with brown spots?",
    "sessionId": "optional-uuid",
    "cropContext": "Tomato"
  }
  ```

---

## 9. Bookmarks & Feedback

- `POST /api/v1/saved`: Bookmark an advisory (`advisoryType`, `advisoryId`).
- `GET /api/v1/saved`: Retrieve bookmarked advisories.
- `DELETE /api/v1/saved/:id`: Delete a bookmark.
- `POST /api/v1/feedback`: Submit rating (1-5) and feedback on any advisory.

---

## 10. Administration (Admin Role Required)

- `GET /api/v1/admin/overview`: Summary metrics (farmers, recommendations, scans).
- `GET/POST/PUT/DELETE /api/v1/admin/crops`: Manage crop knowledge base.
- `GET/POST/PUT/DELETE /api/v1/admin/articles`: Manage educational articles.

