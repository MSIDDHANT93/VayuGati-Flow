"""Shared helpers for building standardized API responses in routers.

These utilities remove the repeated try/except and APIResponse wrapping that
previously lived in every router endpoint, while preserving structured logging
and hiding internal error details from clients.
"""

from typing import Callable, Optional, TypeVar

from fastapi import HTTPException

from app.schemas.common import APIResponse
from app.utils.logger import logger

T = TypeVar("T")


def success_response(data: T) -> APIResponse[T]:
    """Wrap a result payload in a successful APIResponse."""
    return APIResponse[T](success=True, data=data, errors=None)


def execute_service(
    operation: Callable[[], T],
    error_message: str,
    log_message: Optional[str] = None,
    *log_args: object,
) -> APIResponse[T]:
    """Run a service call and wrap the outcome in a standardized APIResponse.

    Args:
        operation: Zero-argument callable that performs the service work.
        error_message: Client-facing detail returned in the HTTP 500 response.
            Kept generic so internal error details are not leaked.
        log_message: Optional ``logger``-style format string logged (with a
            traceback) when the operation raises. Defaults to ``error_message``.
        *log_args: Arguments interpolated into ``log_message``.

    Returns:
        A successful APIResponse containing the operation result.

    Raises:
        HTTPException: Re-raised as-is if raised by the operation, otherwise a
            500 with ``error_message`` as the detail.
    """
    try:
        return success_response(operation())
    except HTTPException:
        raise
    except Exception:
        logger.exception(log_message or error_message, *log_args)
        raise HTTPException(status_code=500, detail=error_message)
