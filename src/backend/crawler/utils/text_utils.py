import re
import unicodedata

def slugify_vn(text: str) -> str:
    """
    Standard slugifier for Vietnamese text.
    - Normalizes to NFKD
    - Removes accents
    - Replaces special characters with hyphens
    - Lowercases
    """
    if not text:
        return ""
        
    # Standard decomposition
    text = unicodedata.normalize('NFKD', text)
    # Filter out non-spacing marks (accents)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    
    # Handle 'đ' manually as it doesn't decompose simply in all envs
    text = text.replace('đ', 'd').replace('Đ', 'D')
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace non-alphanumeric with hyphen
    text = re.sub(r'[^a-z0-9]+', '-', text)
    
    # Strip leading/trailing hyphens
    return text.strip('-')
