# 📘 SEO CONTENT RULES — WEB ĐỌC TRUYỆN MANGA / MANHWA
> Version: 2.0 | Cập nhật: 2025–2026 | Dựa trên phân tích thực tế: TruyenQQ, NetTruyen, BlogTruyen, ZTruyen
> ⚠️ Rules có dấu 🔴 = lỗi **đặc biệt phổ biến** quan sát thực tế ở các site VN top traffic

---

## 📋 MỤC LỤC NHANH
- Phần 1: Rules Chung
- Phần 2: Đặc thù Manga/Manhwa
- Phần 3: Index Bloat & Crawl Budget ← **MỚI — vấn đề cốt lõi của manga site**
- Phần 4: Domain Instability Strategy ← **MỚI — học từ NetTruyen/BlogTruyen**

---

## PHẦN 1: RULES CHUNG CHO TẤT CẢ OUTPUT

---

### 1.1 — CẤU TRÚC URL

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | URL phải chứa keyword chính, viết thường, dùng dấu `-` thay dấu cách |
| ✅ BẮT BUỘC | Không dùng tham số động (`?id=123`) cho trang quan trọng |
| ✅ BẮT BUỘC | Độ dài URL tối đa **75 ký tự** |
| ✅ BẮT BUỘC | URL phải **nhất quán** — không đổi slug sau khi đã index |
| ❌ CẤM | Ký tự đặc biệt, dấu tiếng Việt trong URL |
| ❌ CẤM | URL lồng quá 3 cấp (`/category/genre/title/chapter` = tối đa) |
| 🔴 LỖI PHỔ BIẾN | URL dùng ID số (`/truyen/12345`) thay slug có keyword → mất SEO value |

**Cấu trúc URL chuẩn:**
```
/truyen-tranh/[ten-truyen]/              → trang truyện
/truyen-tranh/[ten-truyen]/chuong-1/     → trang chương
/the-loai/[ten-the-loai]/               → trang thể loại
/tag/[ten-tag]/                         → trang tag
/tim-kiem/                              → NOINDEX bắt buộc
```

---

### 1.2 — TITLE TAG

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | Độ dài: **50–60 ký tự** (pixel limit ~600px) |
| ✅ BẮT BUỘC | Keyword chính đặt **đầu title** |
| ✅ BẮT BUỘC | Mỗi trang có title **duy nhất**, không trùng lặp |
| ✅ NÊN | Thêm brand name ở cuối: `\| TênSite` |
| ✅ NÊN | Title **khác** với H1: title tối ưu CTR, H1 tối ưu on-page |
| ❌ CẤM | Nhồi keyword (keyword stuffing) |
| ❌ CẤM | Viết hoa toàn bộ title |
| 🔴 LỖI PHỔ BIẾN | Title giống nhau cho nhiều trang (chapter template y hệt không có differentiator) |
| 🔴 LỖI PHỔ BIẾN | Google **tự ý thay title** bằng H1 khi title không liên quan query → title và H1 phải aligned chủ đề |

**Template chuẩn:**
```
[Keyword Chính] - [Differentiator] | [Brand]
```

**Ví dụ tốt / xấu:**
```
✅ TỐT: Đọc One Piece - Full 1100+ Chương Tiếng Việt | TruyenVN
❌ XẤU: Đọc Truyện Tranh Online Miễn Phí - Đọc Manga - Đọc Manhwa | TruyenVN
```

---

### 1.3 — META DESCRIPTION

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | Độ dài: **140–160 ký tự** |
| ✅ BẮT BUỘC | Phải chứa keyword chính (tự nhiên, không nhồi) |
| ✅ BẮT BUỘC | Phải có **call-to-action** (Đọc ngay, Xem miễn phí,...) |
| ✅ NÊN | Chứa số liệu cụ thể (số chương, trạng thái full/đang ra) |
| ✅ NÊN | Dùng **emoji** ở đầu — tăng CTR mobile SERP (1 emoji = ~10 ký tự) |
| ❌ CẤM | Copy meta từ trang khác |
| ❌ CẤM | Để trống (Google tự lấy snippet bất kỳ) |
| 🔴 LỖI PHỔ BIẾN | Meta không khớp với content thực → Google override bằng snippet tự chọn |

**Template:**
```
[Emoji] [Keyword] – [USP 1 câu]. [Số liệu cụ thể]. [CTA].
```

---

### 1.4 — H1

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | **1 H1 duy nhất** mỗi trang |
| ✅ BẮT BUỘC | H1 phải chứa **keyword chính** |
| ✅ BẮT BUỘC | H1 khác với Title Tag nhưng **aligned về chủ đề** |
| ✅ BẮT BUỘC | Độ dài H1: **20–70 ký tự** |
| ✅ BẮT BUỘC | H1 phải nằm trong `<body>`, **visible**, không bị CSS ẩn |
| ❌ CẤM | H1 nằm trong element ẩn, sidebar, footer, hay display:none |
| 🔴 LỖI PHỔ BIẾN | Theme đặt logo hoặc site name vào H1 thay vì tiêu đề trang |

---

### 1.5 — H2 / H3 / H4

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | H2 phải chứa **LSI keyword** hoặc **long-tail keyword** |
| ✅ BẮT BUỘC | Thứ tự heading theo cấp bậc (H1 → H2 → H3, **không nhảy cấp**) |
| ✅ NÊN | Mỗi bài content dài (>800 chữ) có ít nhất **3–5 H2** |
| ✅ NÊN | H2 dạng câu hỏi → trigger **Featured Snippet** |
| ❌ CẤM | Dùng heading chỉ để styling, không có ý nghĩa semantic |
| ❌ CẤM | Nhảy từ H1 sang H3 không có H2 ở giữa |

---

### 1.6 — NỘI DUNG (BODY CONTENT)

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | **Keyword density**: ~1% (đọc tự nhiên là chuẩn, không đếm cứng) |
| ✅ BẮT BUỘC | Paragraph ngắn: tối đa **3–4 dòng** |
| ✅ BẮT BUỘC | 300 chữ đầu phải có keyword chính |
| ✅ BẮT BUỘC | Nội dung **unique** — không duplicate từ site khác |
| ✅ NÊN | **Bold** keyword quan trọng (max 2–3 chỗ/trang) |
| ✅ NÊN | Danh sách ul/ol cho readability và snippet |
| ❌ CẤM | Spin content bằng tool |
| ❌ CẤM | Content dưới 300 chữ cho trang category/landing page |
| ❌ CẤM | **AI content mass-generate không review** → Google March 2024 Update đã deindex nhiều site dạng này |

---

### 1.7 — HÌNH ẢNH (IMAGE SEO)

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | Alt text: mô tả nội dung ảnh, có keyword liên quan |
| ✅ BẮT BUỘC | Tên file: `ten-truyen-chuong-1-trang-5.webp` |
| ✅ BẮT BUỘC | Format **WebP** (ưu tiên) hoặc JPEG; < 150KB/ảnh thường |
| ✅ BẮT BUỘC | `width` + `height` attribute → tránh CLS |
| ✅ BẮT BUỘC | **Lazy load** (`loading="lazy"`) cho ảnh below-the-fold |
| ✅ NÊN | Preload ảnh đầu tiên (LCP image) với `<link rel="preload">` |
| ❌ CẤM | Alt text để trống |
| ❌ CẤM | Alt text nhồi keyword |

---

### 1.8 — INTERNAL LINKING

| Rule | Chi tiết |
|------|----------|
| ✅ BẮT BUỘC | Mỗi trang có ít nhất **3–5 internal link** |
| ✅ BẮT BUỘC | Anchor text **mô tả rõ trang đích** (không dùng "xem thêm", "click here") |
| ✅ BẮT BUỘC | Internal link trỏ đến **canonical URL**, không trỏ URL redirect |
| ✅ NÊN | Link từ trang mới → trang cũ có authority cao |
| ✅ NÊN | Breadcrumb với structured data |
| ❌ CẤM | Broken internal link (404) |
| ❌ CẤM | Quá 100 link/trang (loãng crawl budget) |

---

### 1.9 — SCHEMA MARKUP

**Schema bắt buộc theo loại trang:**
```
BreadcrumbList    → TẤT CẢ trang (bắt buộc)
WebSite           → Homepage (kèm SearchAction)
Book/ComicSeries  → Trang series truyện
ImageObject       → Trang chapter (có ảnh)
FAQPage           → Trang category / landing (tăng CTR snippet)
AggregateRating   → Trang truyện (nếu có hệ thống rating)
```

**Lưu ý quan trọng:**
- Schema phải nằm trong **raw HTML**, không chỉ JS-rendered DOM
- Dùng **JSON-LD** (không dùng Microdata hoặc RDFa)
- Validate tại: https://validator.schema.org trước khi deploy

---

### 1.10 — CORE WEB VITALS & TECHNICAL

| Chỉ số | Target | Ý nghĩa với manga site |
|--------|--------|----------------------|
| LCP | < **2.5s** | Ảnh bìa truyện thường là LCP element → preload |
| INP (thay FID 2024) | < **200ms** | Tương tác next/prev chapter phải mượt |
| CLS | < **0.1** | Ảnh không có width/height → CLS cao → mất rank |
| Mobile-friendly | ✅ | >70% traffic manga site đến từ mobile |
| HTTPS | ✅ | Bắt buộc |
| Canonical | ✅ mỗi trang | Raw HTML, không JS-rendered |
| Robots.txt | Cấu hình kỹ | Xem chi tiết Phần 3 |
| XML Sitemap | Submit GSC | Chỉ include URL muốn index |

---

### 1.11 — CHECKLIST VERIFY TRƯỚC KHI PUBLISH

```
ON-PAGE:
[ ] Title tag: 50–60 ký tự, có keyword đầu, unique
[ ] Meta description: 140–160 ký tự, có CTA, có số liệu
[ ] H1: duy nhất, có keyword chính, visible (không CSS ẩn)
[ ] H2+: có LSI/long-tail keyword, đúng cấp bậc
[ ] Keyword xuất hiện trong 300 chữ đầu
[ ] Alt text cho TẤT CẢ hình ảnh
[ ] Ít nhất 3–5 internal link với anchor text rõ ràng

TECHNICAL:
[ ] Canonical tag đúng, nằm trong <head> raw HTML
[ ] Schema markup hợp lệ (validate tại schema.org)
[ ] Lazy load ảnh below-the-fold
[ ] width + height attribute trên tất cả <img>
[ ] Tốc độ trang < 3 giây trên mobile
[ ] URL: không dấu tiếng Việt, có keyword, < 75 ký tự

CONTENT:
[ ] Không duplicate content với trang khác cùng site
[ ] Không copy từ site khác
[ ] Content > 300 chữ (category/landing)
[ ] Trang tìm kiếm / sort/filter đã NOINDEX
```

---
---

## PHẦN 2: ĐẶC THÙ — WEB ĐỌC TRUYỆN MANGA / MANHWA

---

### 2.1 — PHÂN LOẠI TRANG VÀ KEYWORD TARGET

```
┌──────────────────┬────────────────────────────────────┬────────────┐
│ LOẠI TRANG       │ KEYWORD MỤC TIÊU                   │ INDEX?     │
├──────────────────┼────────────────────────────────────┼────────────┤
│ Homepage         │ đọc truyện tranh, đọc manga online │ ✅ INDEX   │
│ Trang thể loại   │ đọc truyện [thể loại] online       │ ✅ INDEX   │
│ Trang truyện     │ đọc [tên truyện], [tên truyện] full│ ✅ INDEX   │
│ Trang chương     │ [tên truyện] chương [số]           │ ✅ INDEX(*) │
│ Trang tag        │ truyện [tag], [tag] hay nhất       │ ✅ INDEX(*) │
│ Trang tìm kiếm   │ —                                  │ ❌ NOINDEX │
│ Trang lọc/sort   │ —                                  │ ❌ NOINDEX │
│ Trang đăng nhập  │ —                                  │ ❌ NOINDEX │
│ Trang hồ sơ user │ —                                  │ ❌ NOINDEX │
└──────────────────┴────────────────────────────────────┴────────────┘

(*) Chapter page: INDEX nhưng cần có text content tối thiểu (xem 2.6)
(*) Tag page: INDEX chỉ khi tag đó có đủ truyện (>5) và có mô tả unique
```

---

### 2.2 — KEYWORD MAPPING THEO SEARCH INTENT

**Informational Intent:**
```
manga là gì / manhwa là gì / manhua là gì
manhwa khác manga như thế nào
top 10 manga/manhwa hay nhất [năm]
truyện isekai gợi ý / tương tự [tên truyện]
[tên truyện] có anime chưa / khi nào ra anime
```
→ Content type: Blog, listicle, so sánh, review

**Navigational Intent:**
```
đọc [tên truyện cụ thể]
[tên truyện] chương mới nhất
[tên truyện] tiếng việt full
nettruyen / truyenqq [tên truyện]
```
→ Content type: Series page, chapter page

**Transactional / Action Intent:**
```
đọc truyện tranh online miễn phí
đọc manga full bộ tiếng việt
manhwa hay đọc ngay
truyện mới cập nhật hôm nay
truyện tranh [thể loại] cập nhật liên tục
```
→ Content type: Homepage, category page, trang hot/mới

---

### 2.3 — HOMEPAGE SEO

**Title tag (A/B test 2 variant rồi chọn CTR cao hơn):**
```
Variant A: Đọc Truyện Tranh Online - Manga Manhwa Miễn Phí | [Brand]
Variant B: Đọc Manga, Manhwa, Manhua Online Miễn Phí - Cập Nhật Hàng Ngày | [Brand]
```

**Meta description:**
```
📚 Đọc truyện tranh online miễn phí tại [Brand] – hơn [X.000]+ bộ manga,
manhwa, manhua cập nhật hàng ngày. Truyện hot, full bộ, nhanh nhất. Đọc ngay!
```

**H1:**
```
Đọc Truyện Tranh Online Miễn Phí – Manga & Manhwa Mới Nhất
```

**Cấu trúc section + H2 homepage:**
```
<section> Truyện Mới Cập Nhật                   ← H2 #1 (freshness signal)
<section> Manga/Manhwa Hot Đang Đọc Nhiều Nhất  ← H2 #2
<section> Top Truyện Full Bộ                    ← H2 #3
<section> Khám Phá Theo Thể Loại                ← H2 #4
<section> Về [Brand] - Giới Thiệu               ← H2 #5 (E-E-A-T)
```

**Insight thực tế từ TruyenQQ/NetTruyen:**
> Các site top VN không đặt mô tả dài trên homepage — họ để grid truyện chiếm phần lớn,
> text SEO đặt ở footer section. UX-first approach.
> → Áp dụng: text SEO 150–200 chữ, đặt SAU phần grid truyện, không che nội dung chính.

---

### 2.4 — TRANG THỂ LOẠI (CATEGORY PAGE)

**Keyword đặc thù VN — CẬP NHẬT 2025 (không có trong v1.0):**
```
"truyện hệ thống"    → system manhwa — trend lớn
"manhua tu tiên"     → lượng search VN rất cao
"truyện trọng sinh"  → cao hơn "isekai" trong thị trường VN
"truyện full bộ"     → modifier quan trọng, người đọc VN ưa
"chap mới nhất"      → freshness signal mạnh
"manhua cổ đại"      → niche nhưng consistent volume
```

**Bảng thể loại + keyword target:**

| Thể loại | Keyword chính | Long-tail phổ biến |
|----------|--------------|-------------------|
| Action | đọc truyện action | manhwa action hay nhất tiếng việt |
| Ngôn tình / Romance | truyện ngôn tình | manhwa ngôn tình full bộ |
| Isekai / Fantasy | đọc truyện isekai | manga isekai hệ thống hay nhất |
| Trọng sinh / Trùng sinh | truyện trọng sinh | manhua trọng sinh hay |
| Tu tiên / Tiên hiệp | truyện tu tiên | manhua tu tiên full bộ |
| Harem | truyện harem | manhwa harem tiếng việt full |
| Học đường | truyện học đường | manhwa học đường lãng mạn |
| Horror / Kinh dị | truyện kinh dị | manga horror đáng sợ nhất |
| Shounen | truyện shounen | manga shounen nổi tiếng |
| Đam mỹ / BL | truyện đam mỹ | manhwa BL ngôn tình full |

**Title tag:**
```
Đọc Truyện [Thể Loại] - [USP] | [Brand]
Ví dụ: Đọc Truyện Isekai - Manhwa Hệ Thống Hay Nhất Tiếng Việt | MangaVN
```

**Content block bắt buộc:**
```
1. H1: Đọc Truyện [Thể Loại] Online Tiếng Việt
2. Mô tả thể loại (150–250 chữ, unique) — đặt TRÊN grid truyện
3. Bộ lọc: Mới nhất / Hot nhất / Full bộ / Đang ra
   → URL filter: NOINDEX hoặc canonical về trang category gốc
4. Grid truyện (ảnh bìa + tên + thể loại + chương mới nhất)
5. FAQ (2–4 câu hỏi về thể loại) → FAQPage schema
6. Pagination: self-canonical per page, KHÔNG noindex page 2+
```

---

### 2.5 — TRANG TRUYỆN (SERIES PAGE)

**Title tag:**
```
Đọc [Tên Truyện] - Full [X] Chương Tiếng Việt | [Brand]

Truyện ongoing:
Đọc [Tên Truyện] - Cập Nhật Chương [X] Mới Nhất | [Brand]
→ Update title khi có chương mới để giữ freshness signal
```

**H1:**
```
[Tên Truyện] – Đọc Truyện Tranh Online Tiếng Việt
```

**Cấu trúc content bắt buộc:**
```
[Ảnh bìa + metadata zone]
  → Tác giả, thể loại, tình trạng, số chương, lượt xem, rating

H2: Giới Thiệu [Tên Truyện]
  → 200–400 chữ UNIQUE (KHÔNG copy từ Wikipedia/MAL)
  → Tóm tắt plot hấp dẫn
  → "Tại sao nên đọc [Tên Truyện]?" — trigger featured snippet

H2: Thông Tin Chi Tiết
  → Table: Tác giả | Thể loại | Năm | Tình trạng | Số chương

H2: Nội Dung [Tên Truyện] Có Gì Đặc Sắc?
  → 100–200 chữ — điểm mạnh, art style, điểm khác biệt

H2: Danh Sách Chương [Tên Truyện]
  → Full list, sắp xếp mới nhất lên đầu
  → Phân trang nếu > 100 chương (self-canonical per page)

H2: Truyện Tương Tự [Tên Truyện]
  → 6–10 truyện related (internal link)

H2: Bình Luận & Đánh Giá
  → UGC — Google đánh giá cao freshness từ comment
```

**Schema JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "[Tên Truyện]",
  "author": {"@type": "Person", "name": "[Tác giả]"},
  "genre": ["[Thể loại 1]", "[Thể loại 2]"],
  "inLanguage": "vi",
  "url": "https://[domain]/truyen-tranh/[slug]/",
  "image": "https://[domain]/images/[slug]-cover.webp",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "bestRating": "5",
    "worstRating": "1",
    "reviewCount": "500"
  }
}
```

---

### 2.6 — TRANG CHƯƠNG (CHAPTER PAGE)

> 🔴 **Nguồn gốc của hầu hết vấn đề SEO trên manga site VN**
> TruyenQQ, NetTruyen đều có hàng trăm nghìn chapter page — xử lý sai = index bloat nghiêm trọng

**Khi nào INDEX chapter page:**
```
✅ Truyện nổi tiếng — "[tên truyện] chương X" có search volume thực
✅ Chương có text content (tóm tắt, tên nhân vật, dialogue key)
✅ Title chương unique và có giá trị
```

**Khi nào NOINDEX chapter page:**
```
❌ Truyện ít người biết (< 1000 lượt đọc)
❌ Chapter page chỉ có ảnh, không có text gì
❌ Truyện drop (bỏ dịch giữa chừng)
```

**Cấu trúc bắt buộc cho chapter page được INDEX:**
```
Title:      [Tên Truyện] Chương [X][: Tên chương nếu có] | [Brand]
H1:         [Tên Truyện] - Chương [X]
Breadcrumb: Home > Truyện Tranh > [Tên Truyện] > Chương [X]
Content:
  - Tóm tắt ngắn chương (50–100 chữ) — QUAN TRỌNG cho text signal
  - Ảnh trang truyện (lazy load, alt: "[tên truyện] chương X trang Y")
  - Điều hướng: ← Chương trước | Chương sau →
  - Internal link về series page và thể loại
Canonical:  self-referencing
```

**Canonical strategy — chọn 1, nhất quán toàn site:**
```
Muốn rank "[tên truyện] chương X"  → self-canonical
Chỉ muốn pass authority về series  → canonical về /truyen-tranh/[slug]/
→ KHÔNG làm cả 2 cùng lúc
```

---

### 2.7 — LSI KEYWORDS & SEMANTIC CLUSTER

**Cluster đầy đủ cho thị trường VN (2025):**
```
CORE:
đọc truyện tranh, đọc manga, đọc manhwa, đọc manhua
web đọc truyện, trang đọc truyện

MODIFIERS QUAN TRỌNG NHẤT:
online, miễn phí, tiếng việt, full bộ, cập nhật mới nhất
hay nhất, hot nhất, đề xuất, nổi tiếng, nhanh nhất

THỂ LOẠI TRENDING VN 2025:
isekai, hệ thống, trọng sinh, trùng sinh, tu tiên, ngôn tình
cổ đại, xuyên không, hậu cung, học đường, đam mỹ, BL
harem, action, romance, kinh dị, comedy

PLATFORM/DEVICE:
đọc truyện trên điện thoại, web đọc truyện android/iphone

BRAND KEYWORDS (đối thủ — cơ hội):
nettruyen, truyenqq, blogtruyen, ztruyen
→ Dùng trong blog comparison: "các site đọc truyện hay nhất 2025"
```

**Phân bổ trong content:**
```
H1 + Title:      Keyword chính (1 lần)
300 chữ đầu:     Keyword chính + 1–2 LSI
H2 headings:     LSI keywords, long-tail
Body:            Semantic cluster tự nhiên
Kết bài/CTA:     Keyword chính + CTA
```

---

### 2.8 — CONTENT STRATEGY ĐẶC THÙ

**Dạng bài blog SEO hoạt động tốt nhất:**
```
✅ "Top [N] Manhwa [Thể Loại] Hay Nhất 2025 Đọc Một Lèo Hết"
✅ "[Tên Truyện] - Review: Cốt Truyện, Art, Nhân Vật Có Gì Hay?"
✅ "10 Manhwa Tương Tự Solo Leveling Phải Đọc Ngay"
✅ "[Tên Truyện] Có Anime Chưa? Khi Nào Ra? - Cập Nhật 2025"
   → Extremely high CTR, topic viral thường xuyên
✅ "So Sánh: Web Đọc Truyện Nào Tốt Nhất 2025?" (brand comparison)
✅ "Truyện Manhwa Kết Thúc Hay Nhất / Tệ Nhất" (controversial = engagement cao)
```

**Độ dài content chuẩn:**
```
Homepage description:     150–200 chữ (sau grid)
Category description:     200–350 chữ (trước grid)
Series page description:  300–500 chữ (unique, không copy MAL/wiki)
Blog top list:            1500–3000 chữ (tùy competition)
Blog review:              800–1500 chữ
FAQ answer:               50–120 chữ/câu (featured snippet)
Chapter summary:          50–100 chữ (freshness + text signal)
```

---

### 2.9 — LỖI SEO ĐẶC THÙ MANGA SITE (QUAN SÁT THỰC TẾ)

| # | Lỗi | Hậu quả | Fix |
|---|-----|---------|-----|
| 1 | 🔴 **Index bloat từ chapter page** (hàng trăm nghìn trang chỉ có ảnh) | Crawl budget cạn, thin content penalty, site-wide rank drop | NOINDEX chapter ít đọc; thêm text summary cho chapter index |
| 2 | 🔴 **Trang filter/sort bị index** (?sort=new, ?page=2&genre=action) | Duplicate content, index bloat | NOINDEX hoặc canonical về trang cha |
| 3 | 🔴 **Tên truyện không nhất quán** (slug khác nhau cho cùng 1 truyện) | Phân tán authority, duplicate | Chọn 1 slug chính → 301 redirect tất cả về đó |
| 4 | 🔴 **Truyện drop không xử lý** (trang orphan) | Trang chất lượng thấp, waste crawl budget | 301 về thể loại hoặc thêm "Tình trạng: Dropped" + NOINDEX |
| 5 | 🔴 **Load toàn bộ ảnh chapter cùng lúc** | LCP > 5s, CLS cao, Core Web Vitals fail | Lazy load ảnh, preload chỉ ảnh đầu tiên |
| 6 | Alt text trống cho ảnh chapter | Mất traffic Google Images | Alt: `[tên truyện] chương [X] trang [Y]` |
| 7 | Meta description giống nhau cho nhiều series page | CTR thấp, Google tự thay | Template dynamic: tên truyện + số chương + thể loại |
| 8 | Tag page với < 3 truyện bị index | Thin content | NOINDEX tag ít truyện |
| 9 | Internal link trỏ về URL redirect chain | Mất link equity, crawl chậm | Luôn link thẳng đến canonical URL |
| 10 | Không có text content trên chapter page | Thin content, mất Google Image traffic | Thêm tóm tắt 50–100 chữ per chapter |

---

### 2.10 — KPI & TRACKING

**Theo dõi hàng tuần:**
```
GSC (Google Search Console):
  □ Impressions / Clicks / CTR / Position
  □ Top keywords mới xuất hiện (cơ hội)
  □ Trang CTR < 2% → A/B test title/meta
  □ Coverage report: "Excluded" loại nào nhiều nhất?
  □ Crawl stats: số trang crawled/day có giảm không?

Core Web Vitals:
  □ LCP / INP / CLS per page type
  □ Mobile vs Desktop score

Traffic:
  □ Organic traffic trending so tuần trước
  □ Landing pages top 50 — trang nào mất traffic đột ngột?
```

**Công cụ:**
```
Google Search Console   → keyword, index, crawl budget
Google Analytics 4      → session, bounce, engagement
Ahrefs / SEMrush        → keyword gap, competitor, backlink
Screaming Frog          → site audit, duplicate, broken link
PageSpeed Insights      → Core Web Vitals per URL
```

---

### 2.11 — QUICK REFERENCE TEMPLATE

**Series Page:**
```
URL:         /truyen-tranh/[slug-ten-truyen]/
Title:       Đọc [Tên Truyện] - Full [X] Chương Tiếng Việt | [Brand]
Meta Desc:   📖 [Tên Truyện] – [hook 1 câu]. Đọc [X]+ chương dịch
             tiếng Việt tại [Brand], cập nhật nhanh nhất. Đọc miễn phí!
H1:          [Tên Truyện] – Đọc Truyện Tranh Online Tiếng Việt
H2 list:     Giới Thiệu | Thông Tin | Đặc Sắc | Danh Sách Chương | Related | Bình Luận
Canonical:   https://[domain]/truyen-tranh/[slug]/
Schema:      BreadcrumbList + Book + AggregateRating
Alt ảnh bìa: [Tên Truyện] ảnh bìa manga tiếng việt
Internal:    ≥ 5 link (breadcrumb + related + thể loại + tác giả)
```

**Category Page:**
```
URL:         /the-loai/[slug]/
Title:       Đọc Truyện [Thể Loại] - Manga Manhwa Hay Nhất | [Brand]
Meta Desc:   🔥 Khám phá [X]+ truyện [thể loại] hay nhất: manga, manhwa,
             manhua tiếng Việt cập nhật hàng ngày. Đọc miễn phí ngay!
H1:          Đọc Truyện [Thể Loại] Online Tiếng Việt
Schema:      BreadcrumbList + FAQPage
Filter URLs: NOINDEX hoặc canonical về trang gốc
```

---
---

## PHẦN 3: INDEX BLOAT & CRAWL BUDGET

> 🆕 **Vấn đề QUAN TRỌNG NHẤT và thường bị bỏ qua nhất của manga site**

---

### 3.1 — TẠI SAO INDEX BLOAT LÀ VẤN ĐỀ CỐT LÕI?

Ví dụ thực tế: Site với **50.000 bộ truyện × 100 chương = 5.000.000 URL**

Nếu tất cả bị index mà không có nội dung text:
- Google tốn toàn bộ crawl budget vào trang chất lượng thấp
- Series page (quan trọng hơn) bị crawl ít hơn → mất rank
- **Site-wide quality signal giảm** → tất cả trang đều rank thấp hơn
- Rủi ro: Google March 2024 Update deindex nhiều site dạng này

---

### 3.2 — CHIẾN LƯỢC CRAWL BUDGET

**Tier 1 — INDEX + PRIORITY (Sitemap XML chính):**
```
✅ Homepage
✅ Category pages (thể loại)
✅ Series pages (tất cả)
✅ Chapter pages của top 500 series hot nhất
✅ Blog/article pages
```

**Tier 2 — INDEX nhưng không trong Sitemap chính:**
```
⚠️ Chapter pages của truyện trung bình
⚠️ Tag pages có đủ truyện (>10 bộ)
```

**Tier 3 — NOINDEX hoặc DISALLOW:**
```
❌ Trang tìm kiếm (/tim-kiem/?q=...)
❌ Trang lọc/sort (?sort=new, ?genre=action&status=ongoing)
❌ Trang đăng nhập, hồ sơ user, lịch sử đọc
❌ Chapter pages truyện < 1000 lượt đọc
❌ Chapter pages truyện dropped/kết thúc lâu + không có traffic
❌ Tag pages có < 5 truyện
```

---

### 3.3 — CẤU HÌNH ROBOTS.TXT CHUẨN

```robots
User-agent: *
Allow: /

# Disallow dynamic/filter pages
Disallow: /tim-kiem/
Disallow: /*?sort=
Disallow: /*?filter=
Disallow: /*?page=*&sort=
Disallow: /dang-nhap/
Disallow: /dang-ky/
Disallow: /ho-so/
Disallow: /lich-su-doc/
Disallow: /bookmark/
Disallow: /admin/

Sitemap: https://[domain]/sitemap.xml
Sitemap: https://[domain]/sitemap-series.xml
Sitemap: https://[domain]/sitemap-categories.xml
```

---

### 3.4 — XML SITEMAP STRATEGY

```
sitemap-index.xml (master)
  ├── sitemap-homepage.xml         (1 URL)
  ├── sitemap-categories.xml       (50–200 URLs)
  ├── sitemap-series.xml           (tất cả series)
  ├── sitemap-chapters-hot.xml     (chapter của top 500 series)
  ├── sitemap-blog.xml             (bài viết)
  └── sitemap-tags.xml             (chỉ tag đủ truyện)

RULES:
✅ Chỉ include URL muốn index trong sitemap
✅ Sitemap không nên có URL đang NOINDEX
✅ <lastmod> cập nhật khi content thực sự thay đổi
✅ Submit từng sitemap riêng lên Google Search Console
```

---
---

## PHẦN 4: DOMAIN INSTABILITY STRATEGY

> 🆕 **Thực tế VN**: NetTruyen, BlogTruyen, TruyenQQ liên tục thay domain do bị chặn/DMCA

---

### 4.1 — QUAN SÁT TỪ CÁC SITE TOP VN

```
NetTruyen:  .vn → bị chặn 2022 → nettruyenviet.com → nettruyenviet1.com → ...
BlogTruyen: .vn → bán 2022 → blogtruyenmoi.com → đóng cửa 2024
TruyenQQ:   .com → truyenqqno.com → truyenqqto.com → ...

→ Vấn đề: Mỗi lần đổi domain = mất toàn bộ SEO authority đã build
→ Giải pháp: Minimize damage khi buộc phải migrate
```

---

### 4.2 — CHECKLIST KHI MIGRATE DOMAIN

```
TRƯỚC KHI MIGRATE:
[ ] Export toàn bộ URL đang có traffic từ GSC (top 1000+ URLs)
[ ] Backup toàn bộ inbound backlink (Ahrefs/SEMrush)
[ ] Document canonical map hiện tại

KHI MIGRATE:
[ ] 301 redirect TẤT CẢ URL cũ → URL mới tương ứng (1:1 mapping, KHÔNG về homepage)
[ ] Cập nhật canonical tags → domain mới
[ ] Cập nhật XML sitemap → domain mới
[ ] Submit Change of Address trong Google Search Console
[ ] Cập nhật toàn bộ internal link về domain mới

SAU MIGRATE:
[ ] Monitor GSC trong 30–60 ngày (coverage drop là bình thường, sẽ recover)
[ ] Rebuild backlink profile về domain mới
[ ] Không tắt server cũ ít nhất 6 tháng (duy trì redirect)
```

---

### 4.3 — BRAND + DOMAIN STRATEGY

```
✅ Xây dựng brand name mạnh (user search brand = navigational intent mạnh)
✅ Sở hữu các domain variation: [brand].com, [brand].vn, [brand].net
✅ Social presence: Facebook page, Discord → redirect user khi domain thay
✅ Push notification / Newsletter → kênh liên lạc độc lập khỏi Google
✅ Brand mentions trên forum (VOZ, Tinhte) → brand authority
```

---

*© SEO Rules v2.0 — Cập nhật 2025–2026*
*Dựa trên phân tích: TruyenQQ, NetTruyen, BlogTruyen + Google SEO best practices mới nhất*
*Review định kỳ: Mỗi quý hoặc sau mỗi Google Core Update*
