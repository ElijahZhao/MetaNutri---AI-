import redis
from app.core.config import settings

_redis_client = None
_memory_cache = {}


def _get_redis_client():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        parsed = settings.REDIS_URL.split("://")[1]
        host_part = parsed.split(":")[0]
        port_part = parsed.split(":")[1].split("/")[0]
        db_part = parsed.split("/")[1]
        _redis_client = redis.Redis(
            host=host_part,
            port=int(port_part),
            db=int(db_part) if db_part else 0,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        _redis_client.ping()
        return _redis_client
    except Exception:
        _redis_client = None
        return None


def get_redis():
    return _get_redis_client()


def cache_user_token(user_id: str, token: str, expires_seconds: int = 60 * 60 * 24 * 7):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"user_token:{user_id}", expires_seconds, token)
            return
        except Exception:
            pass
    _memory_cache[f"user_token:{user_id}"] = token


def get_user_token(user_id: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"user_token:{user_id}")
        except Exception:
            pass
    return _memory_cache.get(f"user_token:{user_id}")


def invalidate_user_token(user_id: str):
    r = _get_redis_client()
    if r:
        try:
            r.delete(f"user_token:{user_id}")
            return
        except Exception:
            pass
    _memory_cache.pop(f"user_token:{user_id}", None)


def cache_data(key: str, data: str, expires_seconds: int = 3600):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"data:{key}", expires_seconds, data)
            return
        except Exception:
            pass
    _memory_cache[f"data:{key}"] = data


def get_cached_data(key: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"data:{key}")
        except Exception:
            pass
    return _memory_cache.get(f"data:{key}")


def cache_analysis_result(user_id: str, analysis_type: str, result: str, expires_seconds: int = 60 * 60 * 24):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"analysis:{user_id}:{analysis_type}", expires_seconds, result)
            return
        except Exception:
            pass
    _memory_cache[f"analysis:{user_id}:{analysis_type}"] = result


def get_cached_analysis(user_id: str, analysis_type: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"analysis:{user_id}:{analysis_type}")
        except Exception:
            pass
    return _memory_cache.get(f"analysis:{user_id}:{analysis_type}")


def cache_recommendation(user_id: str, result: str, expires_seconds: int = 60 * 60 * 12):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"recommendation:{user_id}", expires_seconds, result)
            return
        except Exception:
            pass
    _memory_cache[f"recommendation:{user_id}"] = result


def get_cached_recommendation(user_id: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"recommendation:{user_id}")
        except Exception:
            pass
    return _memory_cache.get(f"recommendation:{user_id}")
