import aiohttp
import ssl
from aiohttp_socks import ProxyConnector
from fake_useragent import UserAgent

ua = UserAgent()

def get_random_headers(referer="https://hentaivn.ch/"):
    return {
        "User-Agent": ua.random,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": referer,
    }

async def fetch_html(url: str, proxy: str | None = None) -> str:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    if proxy:
        connector = ProxyConnector.from_url(proxy, ssl=ssl_context)
    else:
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        
    async with aiohttp.ClientSession(connector=connector, headers=get_random_headers(referer=url)) as session:
        async with session.get(url) as response:
            response.raise_for_status()
            return await response.text()
