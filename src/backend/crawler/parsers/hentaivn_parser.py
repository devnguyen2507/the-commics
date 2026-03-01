import re
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from parsers.base_parser import BaseParser
from core.logger import logger

def extract_slug(source_url: str, fallback_title: str = "") -> str:
    # hentaivn patterns:
    # /truyen/21966-2-slug-name/
    # /truyenhentai/slug-name/
    # /21966-doc-truyen-slug-name-.html
    match = re.search(r'/(?:truyen|truyenhentai)/([\w-]+)', source_url)
    if not match:
        match = re.search(r'/(\d+-[a-zA-Z0-9-]+)', source_url)
        
    if match:
        return match.group(1).strip('-')
    
    import unicodedata
    # Fallback basic slugifier
    text = unicodedata.normalize('NFKD', fallback_title).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text) or "unknown-slug"

class HentaiVNParser(BaseParser):
    def parse_comic_metadata(self, html: str, source_url: str) -> Dict[str, Any]:
        soup = BeautifulSoup(html, 'html.parser')
        
        # Madara theme mapping for HentaiVN
        title_el = soup.select_one('.post-title h1')
        title = title_el.text.strip() if title_el else ""
        
        if not title:
            # Fallback to OG meta tags
            og_title = soup.find('meta', property='og:title')
            if og_title:
                title = str(og_title.get('content', '')).split('|')[0].strip()
        
        if not title:
            title = "Unknown Title"

        author_els = soup.select('.author-content a')
        author = ", ".join([a.text.strip() for a in author_els]) if author_els else "Unknown"

        status_el = soup.select_one('.post-status .summary-content')
        status = status_el.text.strip() if status_el else "Ongoing"
        if status == "Hoàn thành": 
            status = "Completed"

        cat_els = soup.select('.genres-content a')
        categories = [a.text.strip() for a in cat_els] if cat_els else []

        desc_el = soup.select_one('.summary__content')
        description = desc_el.text.strip().replace('\n', ' ') if desc_el else ""
        
        thumb_el = soup.select_one('.summary_image img')
        thumbnail_path = ""
        if thumb_el:
            thumbnail_path = str(thumb_el.get('data-src') or thumb_el.get('src') or "")
        
        if not thumbnail_path:
            og_image = soup.find('meta', property='og:image')
            if og_image:
                thumbnail_path = str(og_image.get('content', ''))
        
        return {
            "id": extract_slug(source_url, title),
            "title": title,
            "author": author,
            "description": description,
            "status": status,
            "categories": categories,
            "thumbnail_path": thumbnail_path
        }

    def parse_chapter_list(self, html: str, source_url: str) -> List[Dict[str, str]]:
        comic_slug = extract_slug(source_url)
        chapters = []
        soup = BeautifulSoup(html, 'html.parser')
        chap_links = soup.select('li.wp-manga-chapter a')
        
        if not chap_links:
            # Fallback 1: Broad search for links containing "chap" or "chuong"
            # often Madara places them in .listing-chapters_wrap
            chap_links = soup.select('.listing-chapters_wrap a')
            
        if not chap_links:
            # Fallback 2: Direct link scan
            all_links = soup.select('a')
            for link in all_links:
                href = link.get('href', '')
                text = link.text.lower()
                # Ensure the link contains the comic slug or is under the truyen prefix for this comic
                if comic_slug in href and ('/chapter-' in href or '/chap-' in href or 'chuong-' in href) and ('chap' in text or 'chương' in text):
                    chap_links.append(link)
        
        # Deduplicate and basic sort
        seen_urls = set()
        unique_chaps = []
        for link in chap_links:
            chap_href = link.get('href', '')
            if not chap_href or chap_href in seen_urls:
                continue
            seen_urls.add(chap_href)
            
            chap_title = link.text.strip()
            
            if "oneshot" in chap_title.lower() or "one shot" in chap_title.lower():
                chap_num = "1"
            else:
                match = re.search(r'(?:chap|chương)\s*([\d\.]+)', chap_title, re.IGNORECASE)
                if match:
                    chap_num = match.group(1)
                else:
                    # Try extracting from href
                    h_match = re.search(r'(?:chap|chapter|chuong)-([\d\.]+)', str(chap_href), re.IGNORECASE)
                    chap_num = h_match.group(1) if h_match else chap_title
            
            chap_url = urljoin(source_url, str(chap_href))
            chapter_slug = f"{comic_slug}-{chap_num}"
            
            unique_chaps.append({
                "id": chapter_slug,
                "chapter_number": chap_num,
                "url": chap_url
            })
            
        return unique_chaps

    def parse_chapter_images(self, html: str, source_url: str) -> List[str]:
        soup = BeautifulSoup(html, 'html.parser')
        
        # Madara standard container
        container = soup.select_one('.reading-content')
        if not container:
            container = soup.select_one('.page-break')
        if not container:
            container = soup
            
        temp_list = []
        target_imgs = container.select('img')
        for img in target_imgs:
            src_val = img.get('data-src') or img.get('src')
            if src_val:
                # Cleanup multiline src/data-src
                src = "".join(str(src_val).split()).strip()
                if not src.startswith("http"):
                    src = urljoin(source_url, src)
                
                img_id = img.get('id', '')
                # Basic validation: must be an image extension and from a cdn
                if re.search(r'\.(jpe?g|png|webp|gif)', src, re.I):
                    if "logo" not in src.lower() and "icon" not in src.lower():
                        temp_list.append((img_id, src))
        
        # Sort by ID if they follow image-0, image-1 pattern
        def sort_key(item):
            id_val, src = item
            match = re.search(r'image-(\d+)', id_val)
            if match:
                return int(match.group(1))
            return 9999 # Sink others
            
        temp_list.sort(key=sort_key)
        return [item[1] for item in temp_list if item[1]]
