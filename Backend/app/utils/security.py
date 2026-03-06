from passlib.context import CryptContext
import hashlib
from typing import Any

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def _ensure_str(value: Any) -> str:
    if isinstance(value, str):
        return value
    return str(value)


def _prehash_if_needed(text: str) -> str:
    """If the UTF-8 encoding of text is longer than 72 bytes, replace it
    with its SHA256 hex digest so bcrypt (72-byte limit) is not exceeded.
    """
    text = _ensure_str(text)
    password_bytes = text.encode("utf-8")
    if len(password_bytes) > 72:
        return hashlib.sha256(password_bytes).hexdigest()
    return text


def hash_password(password: str) -> str:
    """Hash a password safely, pre-hashing long inputs if necessary.

    This function will also retry with a pre-hashed value if the
    underlying bcrypt implementation raises an error for long inputs.
    """
    candidate = _ensure_str(password)
    try:
        return pwd_context.hash(candidate)
    except Exception:
        # Fallback: force a SHA256 hex digest and hash again
        candidate = hashlib.sha256(_ensure_str(password).encode("utf-8")).hexdigest()
        return pwd_context.hash(candidate)


def verify_password(plain_password: Any, hashed_password: str) -> bool:
    """Verify a password against a stored hash, handling long inputs."""
    candidate = _ensure_str(plain_password)
    try:
        return pwd_context.verify(candidate, hashed_password)
    except Exception:
        # Fallback: force SHA256 hex digest and try again
        candidate = hashlib.sha256(_ensure_str(plain_password).encode("utf-8")).hexdigest()
        return pwd_context.verify(candidate, hashed_password)
