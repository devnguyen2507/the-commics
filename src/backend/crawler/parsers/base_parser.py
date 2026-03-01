from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseParser(ABC):
    @abstractmethod
    def parse_comic_metadata(self, html: str, source_url: str) -> Dict[str, Any]:
        """
        Parses comic metadata from the HTML.
        Expected return format:
        {
            "title": str,
            "description": str,
            "author": str,
            "categories": List[str],
            "thumbnail_path": str,
            "status": str
        }
        """
        pass

    @abstractmethod
    def parse_chapter_list(self, html: str, source_url: str) -> List[Dict[str, str]]:
        """
        Parses the list of chapters for a comic.
        Expected return format:
        [
            {"chapter_number": "1", "url": "https://..."},
            {"chapter_number": "2", "url": "https://..."}
        ]
        """
        pass

    @abstractmethod
    def parse_chapter_images(self, html: str, source_url: str) -> List[str]:
        """
        Parses a single chapter page to retrieve list of image URLs.
        """
        pass
