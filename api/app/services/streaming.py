import json


def format_sse(data: str, event: str = "message") -> str:
    return f"event: {event}\ndata: {json.dumps({'content': data})}\n\n"


def format_sse_done() -> str:
    return "event: done\ndata: {}\n\n"


def format_sse_error(message: str) -> str:
    return f"event: error\ndata: {json.dumps({'error': message})}\n\n"
