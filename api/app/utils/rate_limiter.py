import time
from collections import defaultdict
from fastapi import HTTPException


class RateLimiter:
    """In-memory sliding window rate limiter.

    NOTE: This only works correctly in single-process deployments.
    For multi-worker setups (e.g., multiple uvicorn workers), use a shared
    store such as Redis to synchronize state across processes.
    """
    def __init__(self, max_requests: int = 20, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def check(self, user_id: str):
        now = time.time()
        window_start = now - self.window_seconds
        self._requests[user_id] = [t for t in self._requests[user_id] if t > window_start]
        if len(self._requests[user_id]) >= self.max_requests:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        self._requests[user_id].append(now)


rate_limiter = RateLimiter()
