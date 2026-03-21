# Báo Cáo Chiến Lược Từ Khóa SEO — FanManga.net
> Phiên bản: 2.0 | Cập nhật: 2025 | Thị trường: Việt Nam | Niche: Manga / Manhwa 18+ / Hentai

---

## Tổng Quan Chiến Lược

Chiến lược này được xây dựng theo mô hình **Topic Cluster + Keyword Funnel** gồm 4 tầng (Tier), đi từ nhận thức thương hiệu (Tier 1) đến hành động đọc truyện cụ thể (Tier 4). Mỗi tier ánh xạ trực tiếp vào một loại trang trong kiến trúc website, đảm bảo không có nội dung bị lãng phí hay trùng lặp keyword (keyword cannibalization).

**Mục tiêu cốt lõi:**
- Thu hút lưu lượng tìm kiếm tự nhiên (Organic Traffic)
- Tăng tỷ lệ giữ chân người dùng (Retention)
- Xây dựng Entity Authority cho FanManga.net trong lĩnh vực truyện tranh 18+

---

## 1. Kiến Trúc Phân Tầng Từ Khóa (Keyword Tier Framework)

```
[Tier 1 – Homepage]          Volume: Triệu/tháng  |  Cạnh tranh: Cực cao
        ↓
[Tier 2 – Category Pages]    Volume: Cao           |  Cạnh tranh: Trung bình–Cao
        ↓
[Tier 3 – Comic Detail]      Volume: Trung bình    |  Cạnh tranh: Thấp–Trung bình
        ↓
[Tier 4 – Chapter Pages]     Volume: Theo độ hot   |  Cạnh tranh: Thấp
```

**Nguyên tắc vàng:** Mỗi từ khóa chỉ được nhắm đến DUY NHẤT MỘT loại trang. Không để tier 1 keyword xuất hiện ở title của chapter page và ngược lại.

---

## 2. Tier 1 — Core / Seed Keywords (Từ Khóa Lõi)

**Mục tiêu trang:** Trang Chủ (Homepage — `fanmanga.net/`)

### 2.1 Danh Sách Từ Khóa Tier 1

| Từ Khóa | Search Intent | Ưu tiên |
|---|---|---|
| `đọc truyện tranh 18+` | Navigational / Informational | ⭐⭐⭐ |
| `manhwa 18+` | Navigational | ⭐⭐⭐ |
| `truyện tranh không che` | Informational | ⭐⭐⭐ |
| `hentai vietsub` | Informational | ⭐⭐⭐ |
| `đọc manhwa` | Navigational | ⭐⭐ |
| `truyện người lớn` | Informational | ⭐⭐ |
| `truyện tranh 18+` | Informational | ⭐⭐⭐ |
| `doujinshi tiếng việt` | Informational | ⭐⭐ |
| `truyện hentai tiếng việt` | Informational | ⭐⭐ |

### 2.2 Template Meta Tags — Homepage

```
Meta Title:
FanManga – Đọc Truyện Tranh 18+, Manhwa, Doujinshi Tiếng Việt Không Che

Meta Description:
Đọc truyện tranh 18+ cập nhật nhanh nhất tại FanManga. Kho truyện manhwa,
doujinshi, truyện người lớn vietsub bản dịch chuẩn không che. Cập nhật hàng ngày.
```

### 2.3 Schema JSON-LD — Homepage

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "FanManga",
  "url": "https://fanmanga.net",
  "description": "Đọc truyện tranh 18+, manhwa, doujinshi tiếng việt không che",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://fanmanga.net/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

Kết hợp thêm `Organization` schema để xây dựng Brand Entity:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FanManga",
  "url": "https://fanmanga.net",
  "logo": "https://fanmanga.net/logo.png",
  "sameAs": ["https://t.me/fanmangaofficial"]
}
```

### 2.4 Ghi Chú Implementation

- File: `src/pages/index.astro`
- Hàm: `generateWebsiteSchema({ siteName: 'FanManga' })`
- Cần sửa: Nội dung `<title>` và `<meta name="description">` theo template trên
- Ưu tiên: **Cao nhất** — đây là nền tảng của toàn bộ Domain Authority

---

## 3. Tier 2 — Category / Genre Keywords (Từ Khóa Thể Loại)

**Mục tiêu trang:** Trang Thể Loại (`fanmanga.net/the-loai/[slug]/`)

### 3.1 Danh Sách Thể Loại Và Từ Khóa

| Thể Loại | Slug URL | Từ Khóa Nhắm Đến | Ưu Tiên |
|---|---|---|---|
| NTR | `/the-loai/ntr/` | `truyện ntr 18+`, `manhwa ntr vietsub` | ⭐⭐⭐ |
| Harem | `/the-loai/harem/` | `truyện harem 18+`, `manhwa harem không che` | ⭐⭐⭐ |
| Học đường | `/the-loai/hoc-duong/` | `truyện học đường 18+`, `hentai học sinh` | ⭐⭐⭐ |
| MILF | `/the-loai/milf/` | `truyện milf`, `manhwa milf tiếng việt` | ⭐⭐⭐ |
| Incest | `/the-loai/incest/` | `truyện incest 18+` | ⭐⭐ |
| Hàn Quốc | `/the-loai/han-quoc/` | `truyện 18+ hàn quốc`, `manhwa trưởng thành` | ⭐⭐⭐ |
| Doujinshi | `/the-loai/doujinshi/` | `doujinshi vietsub`, `đọc doujinshi tiếng việt` | ⭐⭐ |
| Yaoi | `/the-loai/yaoi/` | `manhwa yaoi 18+` | ⭐⭐ |
| Yuri | `/the-loai/yuri/` | `truyện yuri không che`, `manhwa yuri 18+` | ⭐⭐ |
| Fantasy | `/the-loai/fantasy/` | `manhwa fantasy 18+`, `truyện isekai 18+` | ⭐⭐ |
| Vanilla | `/the-loai/vanilla/` | `manhwa vanilla 18+`, `truyện ngọt ngào 18+` | ⭐⭐ |
| Netori | `/the-loai/netori/` | `truyện netori 18+` | ⭐ |
| Shounen | `/the-loai/shounen/` | `truyện shounen 18+` | ⭐ |

### 3.2 Template Meta Tags — Category Page

```
Meta Title:
Đọc Truyện {Tên Thể Loại} 18+ Hay Nhất | FanManga

Meta Description:
Danh sách truyện tranh {Tên Thể Loại} 18+ manhwa, doujinshi vietsub mới nhất,
cập nhật liên tục bản đẹp không che tại FanManga.
```

**Ví dụ cụ thể — Thể loại NTR:**
```
Title: Đọc Truyện NTR 18+ Hay Nhất | FanManga
Description: Danh sách truyện tranh NTR 18+ manhwa, doujinshi vietsub mới nhất,
cập nhật liên tục bản đẹp không che tại FanManga.
```

### 3.3 Schema JSON-LD — Category Page

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Đọc Truyện {Tên Thể Loại} 18+ Hay Nhất | FanManga",
  "description": "Danh sách truyện tranh {Tên Thể Loại} 18+ manhwa vietsub mới nhất tại FanManga",
  "url": "https://fanmanga.net/the-loai/{slug}/",
  "isPartOf": {
    "@type": "WebSite",
    "name": "FanManga",
    "url": "https://fanmanga.net"
  }
}
```

### 3.4 Ghi Chú Implementation

- File: `src/pages/the-loai/[slug].astro`
- Hàm: `generateCollectionSchema({ title, description })` — cần truyền `title` và `description` động theo template trên
- Lỗi hiện tại: `generateCollectionSchema` đang nhận `description` rỗng mặc định — **cần sửa**

---

## 4. Tier 3 — Title / Entity Keywords (Từ Khóa Tên Truyện)

**Mục tiêu trang:** Trang Chi Tiết Truyện (`fanmanga.net/truyen/[comic-slug]/`)

### 4.1 Cấu Trúc Từ Khóa Tier 3

Mỗi trang truyện tự động tạo các từ khóa sau dựa trên `{Tên Truyện}`:

| Pattern | Ví dụ |
|---|---|
| `đọc truyện {Tên Truyện}` | đọc truyện My Stepmom |
| `{Tên Truyện} tiếng việt` | My Stepmom tiếng việt |
| `{Tên Truyện} không che` | My Stepmom không che |
| `{Tên Truyện} manhwa` | My Stepmom manhwa |
| `{Tên Truyện} vietsub` | My Stepmom vietsub |
| `{Tên Truyện} 18+` | My Stepmom 18+ |

### 4.2 Template Meta Tags — Comic Detail Page

```
Meta Title:
Đọc {Tên Truyện} 18+ Tiếng Việt Không Che | FanManga

Meta Description:
Đọc truyện {Tên Truyện} bản vietsub không che bản đẹp.
{Tóm tắt nội dung gốc của truyện - 80-120 ký tự}.
Cập nhật chap mới nhất tại FanManga.
```

### 4.3 Schema JSON-LD — Comic Detail Page

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "{Tên Truyện} 18+",
  "description": "{Tên Truyện} vietsub không che - {Mô tả gốc của truyện}",
  "url": "https://fanmanga.net/truyen/{comic-slug}/",
  "author": {
    "@type": "Person",
    "name": "{Tên Tác Giả}"
  },
  "genre": ["{Thể Loại 1}", "{Thể Loại 2}"],
  "inLanguage": "vi",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{Điểm trung bình}",
    "reviewCount": "{Số lượt đánh giá}"
  }
}
```

> **Lưu ý:** `aggregateRating` chỉ thêm nếu website có hệ thống đánh giá thực sự. Schema sai dữ liệu sẽ bị Google penalize.

### 4.4 Ghi Chú Implementation

- File: `src/pages/truyen/[comicSlug].astro`
- Hàm: `generateComicSchema({ name, description, author, genres, rating })`
- Cần sửa: Inject keyword vào `name` (thêm " 18+") và `description` (thêm "vietsub không che" vào đầu) một cách tự động

---

## 5. Tier 4 — Action / Chapter Keywords (Từ Khóa Hành Động Đọc Chap)

**Mục tiêu trang:** Trang Đọc Chương (`fanmanga.net/doc/[comic-slug]/chap-[X]/`)

### 5.1 Cấu Trúc Từ Khóa Tier 4

| Pattern | Ví dụ |
|---|---|
| `{Tên Truyện} chap {X}` | My Stepmom chap 5 |
| `đọc {Tên Truyện} chap {X}` | đọc My Stepmom chap 5 |
| `{Tên Truyện} chap {X} tiếng việt` | My Stepmom chap 5 tiếng việt |
| `{Tên Truyện} chap {X} vietsub` | My Stepmom chap 5 vietsub |
| `{Tên Truyện} chap mới nhất` | My Stepmom chap mới nhất |

### 5.2 Template Meta Tags — Chapter Page

```
Meta Title:
{Tên Truyện} Chap {Số} Vietsub Không Che | FanManga

Meta Description:
Đọc ngay {Tên Truyện} Chap {Số} tiếng việt bản đẹp, hình ảnh sắc nét,
load nhanh tại FanManga.
```

### 5.3 Schema JSON-LD — Chapter Page

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Tên Truyện} Chap {Số} Vietsub Không Che | FanManga",
  "description": "Đọc ngay {Tên Truyện} Chap {Số} tiếng việt bản đẹp tại FanManga",
  "url": "https://fanmanga.net/doc/{comic-slug}/chap-{X}/",
  "datePublished": "{ISO 8601 date}",
  "isPartOf": {
    "@type": "Book",
    "name": "{Tên Truyện} 18+",
    "url": "https://fanmanga.net/truyen/{comic-slug}/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FanManga",
    "url": "https://fanmanga.net"
  }
}
```

### 5.4 Ghi Chú Implementation

- File: `src/pages/doc/[comicSlug]/[chapterSlug].astro`
- Hàm: `generateChapterSchema({ headline, description, datePublished, comicName, comicSlug })`
- Cần sửa: `headline` và `description` phải dùng template Tier 4 thay vì giá trị mặc định
- **Critical:** `datePublished` phải là ngày upload chap thực tế (ISO 8601: `2025-03-15T10:00:00+07:00`)

---

## 6. Technical SEO — Yêu Cầu Kỹ Thuật Bắt Buộc

### 6.1 Cấu Trúc URL

```
Homepage:        fanmanga.net/
Category:        fanmanga.net/the-loai/ntr/
Comic Detail:    fanmanga.net/truyen/ten-truyen-18-plus/
Chapter:         fanmanga.net/doc/ten-truyen-18-plus/chap-1/
```

**Quy tắc slug:**
- Viết thường, không dấu, dùng dấu gạch ngang `-`
- Không dùng số ID thuần túy (`/truyen/1234/` — SAI)
- Tối đa 60 ký tự cho slug

### 6.2 Canonical Tags

Chapter pages PHẢI có canonical để tránh duplicate content:
```html
<link rel="canonical" href="https://fanmanga.net/doc/{comic-slug}/chap-{X}/" />
```

Nếu cùng nội dung xuất hiện ở nhiều URL (ví dụ: phân trang ảnh), canonical trỏ về URL đầu tiên.

### 6.3 Sitemap Strategy

Phân tách sitemap theo loại trang để tối ưu Crawl Budget:

```
/sitemap.xml              → Index sitemap (trỏ đến các sitemap con)
/sitemap-static.xml       → Homepage, About, Trang tĩnh
/sitemap-categories.xml   → Tất cả trang thể loại
/sitemap-comics.xml       → Tất cả trang chi tiết truyện
/sitemap-chapters.xml     → Tất cả trang chapter (chia nhỏ theo batch nếu > 50,000 URL)
```

Cập nhật `lastmod` cho sitemap-chapters.xml mỗi khi có chapter mới.

### 6.4 Internal Linking (Breadcrumb)

Mọi trang phải có breadcrumb chuẩn Schema và hiển thị:

```
Homepage → Thể Loại → Tên Truyện → Chap X
```

Schema Breadcrumb:
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "FanManga", "item": "https://fanmanga.net/" },
    { "@type": "ListItem", "position": 2, "name": "NTR", "item": "https://fanmanga.net/the-loai/ntr/" },
    { "@type": "ListItem", "position": 3, "name": "My Stepmom 18+", "item": "https://fanmanga.net/truyen/my-stepmom-18-plus/" },
    { "@type": "ListItem", "position": 4, "name": "Chap 5", "item": "https://fanmanga.net/doc/my-stepmom-18-plus/chap-5/" }
  ]
}
```

### 6.5 Hreflang (Nếu Có Bản Gốc Tiếng Anh/Hàn)

```html
<link rel="alternate" hreflang="vi" href="https://fanmanga.net/truyen/ten-truyen/" />
<link rel="alternate" hreflang="en" href="https://fanmanga.net/en/comic/title/" />
<link rel="alternate" hreflang="x-default" href="https://fanmanga.net/truyen/ten-truyen/" />
```

### 6.6 Core Web Vitals (Ảnh Hưởng Ranking)

Chapter pages có nhiều ảnh → ảnh hưởng trực tiếp LCP và CLS:

- Dùng `loading="lazy"` cho tất cả ảnh trừ ảnh đầu tiên
- Ảnh đầu tiên: `loading="eager"` + `fetchpriority="high"`
- Luôn khai báo `width` và `height` trên thẻ `<img>` để tránh CLS
- Dùng WebP format + CDN

---

## 7. Bản Đồ Keyword Toàn Trang (Quick Reference)

| Loại Trang | URL Pattern | Schema Type | Tier | Từ Khóa Mẫu |
|---|---|---|---|---|
| Homepage | `/` | WebSite + Organization | 1 | `đọc truyện 18+`, `manhwa 18+` |
| Category | `/the-loai/{slug}/` | CollectionPage | 2 | `truyện {thể loại} 18+` |
| Comic Detail | `/truyen/{slug}/` | Book (ComicSeries) | 3 | `đọc {tên truyện} vietsub` |
| Chapter | `/doc/{slug}/chap-{X}/` | Article | 4 | `{tên truyện} chap {X} tiếng việt` |

---

## 8. Lộ Trình Triển Khai (Priority Roadmap)

### Sprint 1 (Tuần 1–2) — Nền tảng
- [ ] Sửa Meta Title + Description theo template Tier 1 cho Homepage
- [ ] Cập nhật `generateWebsiteSchema` và `generateOrganizationSchema`
- [ ] Kiểm tra và sửa `generateCollectionSchema` nhận dynamic title/description

### Sprint 2 (Tuần 3–4) — Mở rộng
- [ ] Cập nhật `generateComicSchema` — inject keyword vào `name` và `description`
- [ ] Chuẩn hoá URL slug toàn bộ trang truyện
- [ ] Thiết lập Sitemap phân tách theo loại trang

### Sprint 3 (Tuần 5–6) — Hoàn thiện
- [ ] Sửa `generateChapterSchema` với `headline`, `description`, `datePublished` chuẩn
- [ ] Triển khai Breadcrumb Schema trên toàn bộ trang
- [ ] Thêm Canonical tag cho chapter pages
- [ ] Audit Core Web Vitals — tối ưu ảnh chapter
