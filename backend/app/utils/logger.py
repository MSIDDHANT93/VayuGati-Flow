import logging
import sys
from app.config import get_settings

settings = get_settings()


def setup_logging() -> logging.Logger:
    """Configure centralized logging for the application."""
    logger = logging.getLogger("vayugati")
    
    # Set log level based on debug setting
    log_level = logging.DEBUG if settings.debug else logging.INFO
    logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger


# Initialize logger
logger = setup_logging()
