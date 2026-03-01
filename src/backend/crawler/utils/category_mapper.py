import unicodedata
from utils.text_utils import slugify_vn

def normalize_vn_comparison(text: str) -> str:
    """Normalize text for consistent comparison (NFC)."""
    return unicodedata.normalize('NFC', text.lower().strip())

# Mapping synonyms and ensuring consistent naming/slugging
# Key: Normalized raw name (lower case, NFC)
# Value: (Normalized Display Name, Slug)
GENRE_MAP = {
    # Manual Alias Mappings
    normalize_vn_comparison("ngoại tình"): ("Cheating", "cheating"),
    normalize_vn_comparison("oneshot"): ("Truyện ngắn (Oneshot)", "truyen-ngan-oneshot"),
    normalize_vn_comparison("truyện ngắn"): ("Truyện ngắn (Oneshot)", "truyen-ngan-oneshot"),
    normalize_vn_comparison("truyện ngắn (oneshot)"): ("Truyện ngắn (Oneshot)", "truyen-ngan-oneshot"),
    
    # Full list from HentaiVN
    normalize_vn_comparison("3D"): ("3D", "3d"),
    normalize_vn_comparison("Ahegao"): ("Ahegao", "ahegao"),
    normalize_vn_comparison("Animal Girl"): ("Animal Girl", "animal-girl"),
    normalize_vn_comparison("Bị thuốc"): ("Bị thuốc", "bi-thuoc"),
    normalize_vn_comparison("Blackmail"): ("Blackmail", "blackmail"),
    normalize_vn_comparison("Bondage"): ("Bondage", "bondage"),
    normalize_vn_comparison("Cháu gái"): ("Cháu gái", "chau-gai"),
    normalize_vn_comparison("Cheating"): ("Cheating", "cheating"),
    normalize_vn_comparison("Chị / Em"): ("Chị / Em", "chi-em"),
    normalize_vn_comparison("Chị/Em gái | Chị/Em dâu"): ("Chị/Em gái | Chị/Em dâu", "chi-em-gai-chi-em-dau"),
    normalize_vn_comparison("Cô/Dì"): ("Cô/Dì", "co-di"),
    normalize_vn_comparison("Con gái"): ("Con gái", "con-gai"),
    normalize_vn_comparison("Con gái (dâu)"): ("Con gái (dâu)", "con-gai-dau"),
    normalize_vn_comparison("Dark Skin"): ("Dark Skin", "dark-skin"),
    normalize_vn_comparison("Defloration"): ("Defloration", "deforestation"),
    normalize_vn_comparison("Demon Girl"): ("Demon Girl", "demon-girl"),
    normalize_vn_comparison("Đeo kính"): ("Đeo kính", "deo-kinh"),
    normalize_vn_comparison("Doujinshi"): ("Doujinshi", "doujinshi"),
    normalize_vn_comparison("Elf"): ("Elf", "elf"),
    normalize_vn_comparison("Femdom"): ("Femdom", "femdom"),
    normalize_vn_comparison("Futanari"): ("Futanari", "futanari"),
    normalize_vn_comparison("Gender Bender"): ("Gender Bender", "gender-bender"),
    normalize_vn_comparison("Ghost"): ("Ghost", "ghost"),
    normalize_vn_comparison("Gia đình"): ("Gia đình", "gia-dinh"),
    normalize_vn_comparison("Giáo viên"): ("Giáo viên", "giao-vien"),
    normalize_vn_comparison("Góa phụ"): ("Góa phụ", "goa-phu"),
    normalize_vn_comparison("Gyaru"): ("Gyaru", "gyaru"),
    normalize_vn_comparison("Hàng xóm"): ("Hàng xóm", "hang-xom"),
    normalize_vn_comparison("Hấp diêm"): ("Hấp diêm", "hap-diem"),
    normalize_vn_comparison("Harem"): ("Harem", "harem"),
    normalize_vn_comparison("Họ hàng"): ("Họ hàng", "ho-hang"),
    normalize_vn_comparison("Horror"): ("Horror", "horror"),
    normalize_vn_comparison("Housewife"): ("Housewife", "housewife"),
    normalize_vn_comparison("Isekai"): ("Isekai", "isekai"),
    normalize_vn_comparison("Không che"): ("Không che", "khong-che"),
    normalize_vn_comparison("Kimono"): ("Kimono", "kimono"),
    normalize_vn_comparison("Lingerie"): ("Lingerie", "lingerie"),
    normalize_vn_comparison("Lỗ nhị"): ("Lỗ nhị", "lo-nhi"),
    normalize_vn_comparison("Maid"): ("Maid", "maid"),
    normalize_vn_comparison("Manhwa"): ("Manhwa", "manhwa"),
    normalize_vn_comparison("Mẹ con"): ("Mẹ con", "me-con"),
    normalize_vn_comparison("MILFs"): ("MILFs", "milfs"),
    normalize_vn_comparison("Mind Break"): ("Mind Break", "mind-break"),
    normalize_vn_comparison("Mind Control"): ("Mind Control", "mind-control"),
    normalize_vn_comparison("Mông to"): ("Mông to", "mong-to"),
    normalize_vn_comparison("Monster"): ("Monster", "monster"),
    normalize_vn_comparison("Netori"): ("Netori", "netori"),
    normalize_vn_comparison("Ngoài trời"): ("Ngoài trời", "ngoai-troi"),
    normalize_vn_comparison("Nhóm"): ("Nhóm", "nhom"),
    normalize_vn_comparison("NTR"): ("NTR", "ntr"),
    normalize_vn_comparison("Nữ văn phòng"): ("Nữ văn phòng", "nu-van-phong"),
    normalize_vn_comparison("Paizuri"): ("Paizuri", "paizuri"),
    normalize_vn_comparison("Petite"): ("Petite", "petite"),
    normalize_vn_comparison("Pregnant"): ("Pregnant", "pregnant"),
    normalize_vn_comparison("Say xỉn"): ("Say xỉn", "say-xin"),
    normalize_vn_comparison("Schoolgirl Uniform"): ("Schoolgirl Uniform", "schoolgirl-uniform"),
    normalize_vn_comparison("Sex Toys"): ("Sex Toys", "sex-toys"),
    normalize_vn_comparison("Shotacon"): ("Shotacon", "shotacon"),
    normalize_vn_comparison("Sleeping"): ("Sleeping", "sleeping"),
    normalize_vn_comparison("Stockings"): ("Stockings", "stockings"),
    normalize_vn_comparison("Succubus"): ("Succubus", "succubus"),
    normalize_vn_comparison("Swimsuit"): ("Swimsuit", "swimsuit"),
    normalize_vn_comparison("Tentacles"): ("Tentacles", "tentacles"),
    normalize_vn_comparison("Thủ dâm"): ("Thủ dâm", "thu-dam"),
    normalize_vn_comparison("Time Stop"): ("Time Stop", "time-stop"),
    normalize_vn_comparison("Tomboy"): ("Tomboy", "tomboy"),
    normalize_vn_comparison("Trâu già"): ("Trâu già", "trau-gia"),
    normalize_vn_comparison("Truyện dài"): ("Truyện dài", "truyen-dai"),
    normalize_vn_comparison("Truyện Màu"): ("Truyện Màu", "truyen-mau"),
    normalize_vn_comparison("Truyện ngắn"): ("Truyện ngắn", "truyen-ngan"),
    normalize_vn_comparison("Truyện ngọt"): ("Truyện ngọt", "truyen-ngot"),
    normalize_vn_comparison("Tsundere"): ("Tsundere", "tsundere"),
    normalize_vn_comparison("Vét máng"): ("Vét máng", "vet-mang"),
    normalize_vn_comparison("Vếu nhỏ"): ("Vếu nhỏ", "veu-nho"),
    normalize_vn_comparison("Vếu to"): ("Vếu to", "veu-to"),
    normalize_vn_comparison("Virgins"): ("Virgins", "virgins"),
    normalize_vn_comparison("Webtoon"): ("Webtoon", "webtoon"),
    normalize_vn_comparison("Y tá"): ("Y tá", "y-ta"),
    normalize_vn_comparison("Yandere"): ("Yandere", "yandere"),
    normalize_vn_comparison("Yuri"): ("Yuri", "yuri"),
}

def normalize_category_name(raw_name: str) -> tuple[str, str]:
    """
    Normalizes a category name and returns (Display Name, ID/Slug).
    If no mapping exists, treats the raw_name as the display name and slugifies it.
    """
    if not raw_name:
        return "", ""
        
    key = normalize_vn_comparison(raw_name)
    
    if key in GENRE_MAP:
        return GENRE_MAP[key]
        
    # Default behavior: Use the original name but ensure it's stripped, and slugify
    display_name = raw_name.strip()
    slug = slugify_vn(display_name)
    return display_name, slug
