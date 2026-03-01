from parsers.base_parser import BaseParser
from parsers.hentaivn_parser import HentaiVNParser
from core.logger import logger

def get_parser(url: str) -> BaseParser:
    """Factory to retrieve proper parser given a URL."""
    if "hentaivn" in url:
        logger.info(f"Routed to HentaiVNParser for URL: {url}")
        return HentaiVNParser()
    
    # Defaults or throw
    logger.error(f"No suitable parser configured for URL: {url}")
    raise ValueError(f"No parser available for URL: {url}")
