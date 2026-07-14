"""Reusable Pydantic field factories for common domain field patterns.

Centralizes field definitions that were previously duplicated across the domain
models and schemas (entity identifiers and auto-generated timestamps).
"""

from datetime import datetime

from pydantic import Field
from pydantic.fields import FieldInfo

ID_MIN_LENGTH = 1
ID_MAX_LENGTH = 50


def entity_id_field(description: str) -> FieldInfo:
    """Required string identifier constrained to the standard entity-id length."""
    return Field(..., description=description, min_length=ID_MIN_LENGTH, max_length=ID_MAX_LENGTH)


def auto_timestamp_field(description: str) -> FieldInfo:
    """Timestamp field that defaults to the current time when not provided."""
    return Field(default_factory=lambda: datetime.now(), description=description)
