from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


load_dotenv()
openai.api_base = "https://openrouter.ai/api/v1"
openai.api_key = os.getenv("OPENROUTER_API_KEY")

MODELS = {
    "MISTRAL": "mistralai/mistral-7b-instruct-v0.3",
}

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    try:
        # Detailed logging of input
        print(f"Translation Request Details:")
        print(f"Original Text: {request.text}")
        print(f"Source Language: {request.source_lang}")
        print(f"Target Language: {request.target_lang}")

        # Perform specialized medical translation
        translation = await perform_medical_translation(
            request.text, 
            request.source_lang, 
            request.target_lang
        )

        return {
            "original": request.text,
            "translation": translation
        }
    except Exception as e:
        print(f"Translation Process Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Translation error: {str(e)}"
        )

async def perform_medical_translation(text: str, source_lang: str, target_lang: str):
    try:
        # Comprehensive medical translation prompt
        response = openai.ChatCompletion.create(
            model=MODELS["MISTRAL"],
            messages=[
                {
                    "role": "system",
                    "content": """You are a Professional Medical Translator with the following critical guidelines:

TRANSLATION PROTOCOL:
1. Context Preservation
- Maintain the precise medical context of the original text
- Ensure clinical accuracy is never compromised
- Translate specialized medical terminology with extreme precision

2. Terminology Handling
- Use standardized medical terminology in the target language
- Preserve exact medical meanings
- Replace region-specific medical terms with internationally recognized equivalents

3. Translation Approach
- Prioritize clarity and medical accuracy
- Use professional medical language
- Avoid colloquial or imprecise medical descriptions

4. Special Considerations
- If a direct translation might cause medical misunderstanding, provide the most clinically appropriate alternative
- Maintain the technical level of the original text
- Ensure the translation is suitable for healthcare professionals

5. Language-Specific Medical Nuances
- Consider linguistic and cultural medical terminology differences
- Adapt medical terms that might not have direct translations
- Ensure the translation remains scientifically and medically precise"""
                },
                {
                    "role": "user",
                    "content": f"""Perform a precise medical translation:
- Original Text: {text}
- Source Language: {source_lang}
- Target Language: {target_lang}

Please translate maintaining strict medical accuracy."""
                }
            ],
            temperature=0.2,  # Low randomness to ensure precision
            max_tokens=300    # Limit response length
        )
        
        translated_text = response.choices[0].message.content.strip()
        
        # Logging translation details
        print("Medical Translation - Input:", text)
        print("Medical Translation - Output:", translated_text)
        
        return translated_text
    
    except Exception as e:
        print(f"Medical Translation Error: {e}")
        return text  # Return original text if translation fails

# Additional error handling and startup configuration
@app.on_event("startup")
async def startup_event():
    print("Medical Translation Service is online")
    print(f"Active Translation Model: {MODELS['MISTRAL']}")

# Optional: Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Medical Translation Service",
        "model": MODELS['MISTRAL']
    }
    

# Serve static files (like .css, .js, images, etc.)
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)