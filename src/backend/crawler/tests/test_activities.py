from bs4 import BeautifulSoup
import re
from models.comic_models import ChapterInfo

def test_chapter_parsing_logic():
    # Simulate a fake HTML chunk representing what we receive from admin-ajax
    fake_html = """
    <ul class="main version-chap no-volumn">
        <li class="wp-manga-chapter">
            <a href="https://hnt.ch/oneshot/">Oneshot</a>
        </li>
        <li class="wp-manga-chapter">
            <a href="https://hnt.ch/chap-2/">Chap 2</a>
        </li>
        <li class="wp-manga-chapter">
            <a href="https://hnt.ch/chuong-1/">Chương 1</a>
        </li>
        <li class="wp-manga-chapter">
            <a href="https://hnt.ch/chuong-0-5/">Chương 0.5</a>
        </li>
    </ul>
    """
    chap_soup = BeautifulSoup(fake_html, 'html.parser')
    chap_links = chap_soup.select('li.wp-manga-chapter a')
    
    chapters = []
    idx = len(chap_links)
    
    for link in chap_links:
        chap_href = link['href']
        chap_title = link.text.strip()
        
        if "oneshot" in chap_title.lower() or "one shot" in chap_title.lower():
            chap_num = "1"
            order_index = 1.0
        else:
            match = re.search(r'(?:chap|chương)\s*([\d\.]+)', chap_title, re.IGNORECASE)
            if match:
                chap_num = match.group(1)
                order_index = float(chap_num)
            else:
                chap_num = chap_title
                order_index = float(idx)
        
        chapters.append(ChapterInfo(
            id="",
            chapter_number=chap_num,
            order_index=order_index,
            source_url=chap_href
        ))
        idx -= 1
        
    assert len(chapters) == 4
    
    assert chapters[0].chapter_number == "1"
    assert chapters[0].order_index == 1.0
    
    assert chapters[1].chapter_number == "2"
    assert chapters[1].order_index == 2.0
    
    assert chapters[2].chapter_number == "1"
    assert chapters[2].order_index == 1.0
    
    assert chapters[3].chapter_number == "0.5"
    assert chapters[3].order_index == 0.5

def test_comic_parser_metadata_logic():
    fake_html = """
    <div class="post-title"><h1> My Epic Comic </h1></div>
    <div class="author-content"><a href="#">Author A</a> <a href="#">Author B</a></div>
    <div class="post-status"><div class="summary-content">Hoàn thành</div></div>
    <div class="genres-content"><a href="#">Action</a><a href="#">Drama</a></div>
    <div class="summary__content"><p>A great story!</p></div>
    <div class="summary_image"><img data-src="https://img.com/a.jpg" alt="thumbnail"/></div>
    """
    
    soup = BeautifulSoup(fake_html, 'html.parser')
    
    title_el = soup.select_one('.post-title h1')
    title = title_el.text.strip() if title_el else "Unknown Title"
    assert title == "My Epic Comic"

    author_els = soup.select('.author-content a')
    author = ", ".join([a.text.strip() for a in author_els]) if author_els else "Unknown"
    assert author == "Author A, Author B"

    status_el = soup.select_one('.post-status .summary-content')
    status = status_el.text.strip() if status_el else "Ongoing"
    if status == "Hoàn thành": 
        status = "Completed"
    assert status == "Completed"

    cat_els = soup.select('.genres-content a')
    categories = [a.text.strip() for a in cat_els] if cat_els else []
    assert categories == ["Action", "Drama"]

    desc_el = soup.select_one('.summary__content')
    description = desc_el.text.strip().replace('\n', ' ') if desc_el else ""
    assert description == "A great story!"
    
    thumb_el = soup.select_one('.summary_image img')
    thumbnail_path = ""
    if thumb_el:
        thumbnail_path = thumb_el.get('data-src') or thumb_el.get('src') or ""
    assert thumbnail_path == "https://img.com/a.jpg"

def test_chapter_image_parser_logic():
    fake_html = """
    <div class="reading-content">
        <img data-src="1.jpg" />
        <img src="2.jpg" />
        <img data-src="https://other.com/3.jpg" />
    </div>
    """
    
    soup = BeautifulSoup(fake_html, 'html.parser')
    
    reading_content = soup.select_one('.reading-content')
    assert reading_content is not None
        
    image_list = []
    source_url = "https://base.com/chap1/"
    for img in reading_content.select('img'):
        src = img.get('data-src') or img.get('src')
        if src:
            src = src.strip()
            if not src.startswith('http'):
                from urllib.parse import urljoin
                src = urljoin(source_url, src)
            image_list.append(src)
            
    assert len(image_list) == 3
    assert image_list[0] == "https://base.com/chap1/1.jpg"
    assert image_list[1] == "https://base.com/chap1/2.jpg"
    assert image_list[2] == "https://other.com/3.jpg"

