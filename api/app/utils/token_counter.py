import tiktoken


# def count_tokens(text: str, model: str = "gpt-4o") -> int:
def count_tokens(text: str, model: str = "llama-3.1-8b-instant") -> int:
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))
