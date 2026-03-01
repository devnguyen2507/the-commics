from utils.text_utils import slugify_vn
from utils.category_mapper import normalize_category_name

def test_slugify_vn():
    assert slugify_vn("Gia đình") == "gia-dinh"
    assert slugify_vn("Nữ văn phòng") == "nu-van-phong"
    assert slugify_vn("Lỗ nhị") == "lo-nhi"
    assert slugify_vn("Cheating (Ngoại tình)") == "cheating-ngoai-tinh"

def test_normalize_category_name():
    # Test synonym mapping
    name, slug = normalize_category_name("Ngoại tình")
    assert name == "Cheating"
    assert slug == "cheating"
    
    # Test complex names from full list
    name, slug = normalize_category_name("Chị / Em")
    assert name == "Chị / Em"
    assert slug == "chi-em"
    
    name, slug = normalize_category_name("Chị/Em gái | Chị/Em dâu")
    assert name == "Chị/Em gái | Chị/Em dâu"
    assert slug == "chi-em-gai-chi-em-dau"
    
    name, slug = normalize_category_name("Con gái (dâu)")
    assert name == "Con gái (dâu)"
    assert slug == "con-gai-dau"

    # Test Vietnamese normalization fallback
    name, slug = normalize_category_name("Thể loại mới")
    assert name == "Thể loại mới"
    assert slug == "the-loai-moi"

if __name__ == "__main__":
    test_slugify_vn()
    test_normalize_category_name()
    print("All tests passed!")
