from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    MODEL_PATH: str = "yolov8n.pt"

    class Config:
        env_file = ".env"


settings = Settings()
