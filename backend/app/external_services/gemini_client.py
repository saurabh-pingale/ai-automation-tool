import google.generativeai as genai
from app.config import settings
from app.utils.logger import logger

class GeminiClient:
    def __init__(self):
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            logger.info("Gemini client configured successfully.")
        except Exception as e:
            logger.error(f"Failed to configure Gemini client: {e}")
            self.model = None

    def generate_text(self, prompt: str) -> str:
        if not self.model:
            raise ConnectionError("Gemini client is not configured.")
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error during Gemini API call: {e}")
            raise