import time
import redis
from app.core.config import settings

_redis_client = None
# In-memory fallback cache: key -> (value, expires_at_epoch)
_memory_cache = {}

# Sentinel used to mark a revoked token/session so it is rejected even after
# the Redis entry is gone (avoids "logout does not actually invalidate").
REVOKED = "__revoked__"

# TTL applied when revoking a token. Must cover max access-token lifetime.
_REVOKE_TTL_SECONDS = 24 * 7 * 3600


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


def _mem_set(key: str, value: str, ttl: int):
    _memory_cache[key] = (value, time.time() + max(ttl, 0))


def _mem_get(key: str):
    entry = _memory_cache.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        _memory_cache.pop(key, None)
        return None
    return value


def cache_user_token(user_id: str, token: str, expires_seconds: int = 60 * 60 * 24 * 7):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"user_token:{user_id}", expires_seconds, token)
            return
        except Exception:
            pass
    _mem_set(f"user_token:{user_id}", token, expires_seconds)


def get_user_token(user_id: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"user_token:{user_id}")
        except Exception:
            pass
    return _mem_get(f"user_token:{user_id}")


def invalidate_user_token(user_id: str):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"user_token:{user_id}", _REVOKE_TTL_SECONDS, REVOKED)
            return
        except Exception:
            pass
    _mem_set(f"user_token:{user_id}", REVOKED, _REVOKE_TTL_SECONDS)


def cache_data(key: str, data: str, expires_seconds: int = 3600):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"data:{key}", expires_seconds, data)
            return
        except Exception:
            pass
    _mem_set(f"data:{key}", data, expires_seconds)


def get_cached_data(key: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"data:{key}")
        except Exception:
            pass
    return _mem_get(f"data:{key}")


def cache_analysis_result(user_id: str, analysis_type: str, result: str, expires_seconds: int = 60 * 60 * 24):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"analysis:{user_id}:{analysis_type}", expires_seconds, result)
            return
        except Exception:
            pass
    _mem_set(f"analysis:{user_id}:{analysis_type}", result, expires_seconds)


def get_cached_analysis(user_id: str, analysis_type: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"analysis:{user_id}:{analysis_type}")
        except Exception:
            pass
    return _mem_get(f"analysis:{user_id}:{analysis_type}")


def cache_recommendation(user_id: str, result: str, expires_seconds: int = 60 * 60 * 12):
    r = _get_redis_client()
    if r:
        try:
            r.setex(f"recommendation:{user_id}", expires_seconds, result)
            return
        except Exception:
            pass
    _mem_set(f"recommendation:{user_id}", result, expires_seconds)


def get_cached_recommendation(user_id: str) -> str:
    r = _get_redis_client()
    if r:
        try:
            return r.get(f"recommendation:{user_id}")
        except Exception:
            pass
    return _mem_get(f"recommendation:{user_id}")