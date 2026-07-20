import redis
from app.core.config import settings

redis_client = redis.Redis(
    host=settings.REDIS_URL.split("://")[1].split(":")[0],
    port=int(settings.REDIS_URL.split(":")[-1].split("/")[0]),
    db=int(settings.REDIS_URL.split("/")[-1]),
    decode_responses=True
)

def get_redis():
    return redis_client

def cache_user_token(user_id: str, token: str, expires_seconds: int = 60 * 60 * 24 * 7):
    redis_client.setex(f"user_token:{user_id}", expires_seconds, token)

def get_user_token(user_id: str) -> str:
    return redis_client.get(f"user_token:{user_id}")

def invalidate_user_token(user_id: str):
    redis_client.delete(f"user_token:{user_id}")

def cache_data(key: str, data: str, expires_seconds: int = 3600):
    redis_client.setex(f"data:{key}", expires_seconds, data)

def get_cached_data(key: str) -> str:
    return redis_client.get(f"data:{key}")

def cache_analysis_result(user_id: str, analysis_type: str, result: str, expires_seconds: int = 60 * 60 * 24):
    redis_client.setex(f"analysis:{user_id}:{analysis_type}", expires_seconds, result)

def get_cached_analysis(user_id: str, analysis_type: str) -> str:
    return redis_client.get(f"analysis:{user_id}:{analysis_type}")

def cache_recommendation(user_id: str, result: str, expires_seconds: int = 60 * 60 * 12):
    redis_client.setex(f"recommendation:{user_id}", expires_seconds, result)

def get_cached_recommendation(user_id: str) -> str:
    return redis_client.get(f"recommendation:{user_id}")