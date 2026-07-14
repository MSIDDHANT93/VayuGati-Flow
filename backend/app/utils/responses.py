"""Shared helpers for building standardized API responses in routers.

These utilities remove the repeated try/except and APIResponse wrapping that
previously lived in every router endpoint.
"""

from typing import Callable, TypeVar

from fastapi import HTTPException

from app.schemas.common import APIResponse

T = TypeVar("T")


def success_response(data: T) -> APIResponse[T]:
    """Wrap a result payload in a successful APIResponse."""
    return APIResponse[T](success=True, data=data, errors=None)


def execute_service(operation: Callable[[], T], error_message: str) -> APIResponse[T]:
    """Run a service call and wrap the outcome in a standardized APIResponse.

    Args:
        operation: Zero-argument callable that performs the service work.
        error_message: Human-readable prefix used in the HTTP 500 detail when
            the operation raises.

    Returns:
        A successful APIResponse containing the operation result.

    Raises:
        HTTPException: With status code 500 if the operation raises.
    """
    try:
        return success_response(operation())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{error_message}: {str(e)}")
