# Healthcare.ai
### A Medical Translation Service 🩺🌐

``` Live link
https://healthcare-ai-9pyj.onrender.com
```
## Overview
A specialized medical translation service built with FastAPI, leveraging advanced AI models for precise medical terminology translation.

## Features
- 🔬 Specialized medical translation
- 🌍 Multi-language support
- 🤖 AI-powered translation using Mistral
- 🔒 Robust error handling
- 🚑 Healthcare-focused translation protocol



### Technologies
- FastAPI
- OpenAI API Key (Optional)
- OpenRouter API Key
- Mistral 7B Model
- Python 3.8+

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/medical-translation-service.git
cd medical-translation-service
```

### 2. Create Virtual Environment
```BASH
python -m venv venv
source venv/bin/activate
# On Windows, use `venv\Scripts\activate`

```
3. Install Dependencies
```BASH
pip install -r requirements.txt
```

4. Set Environment Variables
Create a .env file in the project root:
`OPENROUTER_API_KEY=your_openrouter_api_key `
### Running the Service
Development Mode
```BASH
uvicorn main:app --reload
```
### Production Deployment
```BASH
uvicorn main:app --host 0.0.0.0 --port 8000
```
### API Endpoints
- Translation Endpoint
- POST /translate
- Request Body:
```JSON

{
  "text": "Medical text to translate",
  "source_lang": "Source language code",
  "target_lang": "Target language code"
}
```
### Health Check
- GET /health
- Returns service status and active model

### Configuration
- Configurable in main.py
- Model selection via MODELS dictionary
- Customizable translation protocol

### Translation Guidelines
The service follows a strict translation protocol:
- Preserve medical context
- Maintain clinical accuracy
- Use standardized medical terminology
- Consider linguistic nuances

### Error Handling
- Comprehensive error logging
- Graceful error responses
- Fallback mechanisms

### Security
- CORS middleware configured
- Environment variable management
- Secure API key handling
