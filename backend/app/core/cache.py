"""Redis cache configuration."""

from typing import Optional, Any
import json
import redis.asyncio as aioredis

from app.config import settings


class CacheManager:
    """Redis cache manager."""

    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None

    async def connect(self):
        """Connect to Redis."""
        self.redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis:
            return None

        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache."""
        if not self.redis:
            return False

        ttl = ttl or settings.REDIS_CACHE_TTL
        serialized = json.dumps(value)
        return await self.redis.setex(key, ttl, serialized)

    async def delete(self, key: str) -> bool:
        """Delete value from cache."""
        if not self.redis:
            return False

        return await self.redis.delete(key) > 0

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self.redis:
            return False

        return await self.redis.exists(key) > 0


cache = CacheManager()