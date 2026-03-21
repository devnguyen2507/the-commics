# Báo Cáo Chiến Lược Từ Khóa SEO (SEO Keyword Strategy)
> ⚠️ File này là phiên bản cập nhật v2.0 — Đã bổ sung đầy đủ thể loại, schema chi tiết, và ghi chú impl.
> Xem file đầy đủ: `seo-keyword-strategy-fanmanga.md`

Chiến lược từ khóa này được xây dựng dựa trên đặc thù nội dung của FanManga (truyện tranh 18+, manhwa, doujinshi) ở thị trường Việt Nam. Phân tầng từ khóa (Tiers) giúp bạn lập kế hoạch Content SEO bài bản, đi từ việc thu hút lưu lượng truy cập lớn đến việc chốt tỷ lệ chuyển đổi (người dùng quay lại đọc truyện).

---

## 1. Phân Tầng Từ Khóa (Tiers)

### 🚀 Tier 1: Core / Seed Keywords (Từ khóa lõi)
**Đặc điểm:** Volume (lượng tìm kiếm) cực khủng, độ cạnh tranh CỰC CAO.
**Mục tiêu trang:** Trang Chủ (Homepage — `fanmanga.net/`).
**Từ khóa:** `truyện tranh 18+`, `đọc truyện 18+`, `manhwa 18+`, `truyện người lớn`, `hentai vietsub`, `đọc manhwa`, `truyện tranh không che`, `doujinshi tiếng việt`, `truyện hentai tiếng việt`.

**Template Meta Title (v2):**
`FanManga – Đọc Truyện Tranh 18+, Manhwa, Doujinshi Tiếng Việt Không Che`

**Template Meta Description (v2):**
`Đọc truyện tranh 18+ cập nhật nhanh nhất tại FanManga. Kho truyện manhwa, doujinshi, truyện người lớn vietsub bản dịch chuẩn không che. Cập nhật hàng ngày.`

> **TODO impl:** Sửa `index.astro` — cập nhật `<title>` và `<meta description>` theo template trên. `generateWebsiteSchema` hiện đã đúng, cần thêm `generateOrganizationSchema`.

---

### 📌 Tier 2: Category / Genre Keywords (Từ khóa ngách/Thể loại)
**Đặc điểm:** Volume cao, độ cạnh tranh Cao tới Trung Bình. Người dùng bắt đầu có chủ đích tìm thể loại cụ thể.
**Mục tiêu trang:** Trang Thể Loại (`fanmanga.net/the-loai/[slug]/`).

**Danh sách thể loại đầy đủ (bổ sung v2):**

| Thể Loại | Slug | Từ Khóa Chính |
|---|---|---|
| NTR | `/the-loai/ntr/` | `truyện ntr 18+`, `manhwa ntr vietsub` |
| Harem | `/the-loai/harem/` | `truyện harem 18+`, `manhwa harem không che` |
| Học đường | `/the-loai/hoc-duong/` | `truyện học đường 18+`, `hentai học sinh` |
| MILF | `/the-loai/milf/` | `truyện milf`, `manhwa milf tiếng việt` |
| Incest | `/the-loai/incest/` | `truyện incest 18+` |
| Hàn Quốc | `/the-loai/han-quoc/` | `truyện 18+ hàn quốc`, `manhwa trưởng thành` |
| Doujinshi | `/the-loai/doujinshi/` | `doujinshi vietsub`, `đọc doujinshi tiếng việt` |
| Yaoi | `/the-loai/yaoi/` | `manhwa yaoi 18+` |
| Yuri | `/the-loai/yuri/` | `truyện yuri không che`, `manhwa yuri 18+` |
| Fantasy | `/the-loai/fantasy/` | `manhwa fantasy 18+`, `truyện isekai 18+` |
| Vanilla | `/the-loai/vanilla/` | `manhwa vanilla 18+`, `truyện ngọt ngào 18+` |

**Cấu trúc từ khóa:** `Đọc truyện tranh [Tên Thể Loại] 18+`

**Template Meta Title (v2):**
`Đọc Truyện {Tên Thể Loại} 18+ Hay Nhất | FanManga`

**Template Meta Description (v2):**
`Danh sách truyện tranh {Tên Thể Loại} 18+ manhwa, doujinshi vietsub mới nhất, cập nhật liên tục bản đẹp không che tại FanManga.`

> **TODO impl:** `generateCollectionSchema` phải nhận dynamic `title` và `description` theo template — **HIỆN ĐANG BỊ THIẾU** (đang nhận description rỗng mặc định).

---

### 🎯 Tier 3: Title / Entity Keywords (Từ khóa Tên Truyện / Tác Giả)
**Đặc điểm:** Volume trung bình đến tốt, độ cạnh tranh Thấp - Trung bình. Lượng CTR cực cao vì intent rất sát.
**Mục tiêu trang:** Trang Chi tiết Truyện (`fanmanga.net/truyen/[comic-slug]/`).

**Patterns từ khóa tự động:**
- `đọc truyện [Tên Truyện]`
- `[Tên Truyện] tiếng việt`
- `[Tên Truyện] không che`
- `[Tên Truyện] manhwa`
- `[Tên Truyện] vietsub`
- `[Tên Truyện] 18+`

**Template Meta Title (v2):**
`Đọc {Tên Truyện} 18+ Tiếng Việt Không Che | FanManga`

**Template Meta Description (v2):**
`Đọc truyện {Tên Truyện} bản vietsub không che bản đẹp. {Tóm tắt nội dung gốc — 80–120 ký tự}. Cập nhật chap mới nhất tại FanManga.`

**Schema (Book / ComicSeries) — v2:**
```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "{Tên Truyện} 18+",
  "description": "{Tên Truyện} vietsub không che - {Mô tả gốc}",
  "author": { "@type": "Person", "name": "{Tên Tác Giả}" },
  "genre": ["{Thể Loại 1}", "{Thể Loại 2}"],
  "inLanguage": "vi",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{Điểm TB}",
    "reviewCount": "{Số lượt}"
  }
}
```

> **TODO impl:** Cập nhật `generateComicSchema` để tự động inject " 18+" vào `name` và thêm "vietsub không che - " vào đầu `description`. Thêm `aggregateRating` nếu có hệ thống rating.

---

### 🔥 Tier 4: Action / Chapter Keywords (Từ khóa hành động vi mô)
**Đặc điểm:** Volume thay đổi theo độ hot của truyện, độ cạnh tranh Thấp. Ý định bắt buộc phải click ngay.
**Mục tiêu trang:** Trang Đọc Truyện (`fanmanga.net/doc/[comic-slug]/chap-[X]/`).

**Patterns từ khóa:**
- `[Tên Truyện] chap [X]`
- `đọc [Tên Truyện] chap [X]`
- `[Tên Truyện] chap [X] tiếng việt / vietsub`
- `[Tên Truyện] chap mới nhất`

**Template Meta Title (v2):**
`{Tên Truyện} Chap {Số} Vietsub Không Che | FanManga`

**Template Meta Description (v2):**
`Đọc ngay {Tên Truyện} Chap {Số} tiếng việt bản đẹp, hình ảnh sắc nét, load nhanh tại FanManga.`

**Schema (Article) — v2:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Tên Truyện} Chap {Số} Vietsub Không Che | FanManga",
  "description": "Đọc ngay {Tên Truyện} Chap {Số} tiếng việt bản đẹp tại FanManga",
  "datePublished": "{ISO 8601}",
  "isPartOf": {
    "@type": "Book",
    "name": "{Tên Truyện} 18+",
    "url": "https://fanmanga.net/truyen/{comic-slug}/"
  }
}
```

> **TODO impl:** Sửa `slug/[chapterSlug].astro` — truyền đúng `headline` và `description` theo template v2. `datePublished` bắt buộc phải là ngày upload thực tế (format ISO 8601).

---

## 2. Chiến Lược Tối Ưu Từng Loại Trang (Page-Level Strategy)

### 2.1. Trang Chủ (Homepage) — Tier 1
*   **Mục tiêu:** Rank các từ khóa mang tính thương hiệu và bao trùm (`đọc truyện 18+`, `manhwa 18+`, `truyện tranh không che`).
*   **Note Impl:** `generateWebsiteSchema` trong `index.astro` đang đúng hướng. **Cần sửa title và description theo template v2.**
*   **Thêm mới v2:** Bổ sung `generateOrganizationSchema` để xây dựng Brand Entity.

### 2.2. Trang Danh Mục Thể Loại (Category Page) — Tier 2
*   **Mục tiêu:** Rank các từ khóa ngách theo thể loại.
*   **Note Impl:** `generateCollectionSchema` **ĐANG BỊ LỖI** — nhận `description` rỗng mặc định. Phải sửa để nhận dynamic title/description chứa từ khóa Tier 2.
*   **Thêm mới v2:** Bổ sung đầy đủ 11 thể loại + slug URL chuẩn trong bảng ở trên.

### 2.3. Trang Chi Tiết Truyện (Comic Page) — Tier 3
*   **Mục tiêu:** Rank các từ khóa tìm kiếm theo tên truyện cụ thể.
*   **Note Impl:** `generateComicSchema` cần tự động inject keyword vào `name` và `description`. **Thêm `aggregateRating` nếu site có hệ thống rating.**
*   **Thêm mới v2:** Schema type thay đổi từ `ComicSeries` sang `Book` — tương thích tốt hơn với Google Search.

### 2.4. Trang Đọc Chương (Chapter Page) — Tier 4
*   **Mục tiêu:** Thu hút lưu lượng người đọc theo chap mới nhất.
*   **Note Impl:** Sửa `slug/[chapterSlug].astro` — `headline` và `description` phải theo template v2. **`datePublished` bắt buộc.**
*   **Thêm mới v2:** Thêm `canonical` tag + `isPartOf` trỏ về Comic Detail để truyền link equity.

---

## 3. Technical SEO Bổ Sung (Mới v2)

### 3.1 Cấu Trúc URL Chuẩn
```
/                              → Homepage
/the-loai/{slug}/              → Category
/truyen/{comic-slug}/          → Comic Detail
/doc/{comic-slug}/chap-{X}/    → Chapter
```

### 3.2 Sitemap Phân Tách (Crawl Budget Optimization)
```
/sitemap.xml              → Index
/sitemap-categories.xml   → Trang thể loại
/sitemap-comics.xml       → Trang truyện
/sitemap-chapters.xml     → Trang chapter (cập nhật khi có chap mới)
```

### 3.3 Breadcrumb Schema
Triển khai trên tất cả trang — xem schema mẫu trong `seo-keyword-strategy-fanmanga.md` mục 6.4.

### 3.4 Core Web Vitals — Chapter Pages
- Ảnh đầu tiên: `loading="eager"` + `fetchpriority="high"`
- Ảnh còn lại: `loading="lazy"`
- Luôn khai báo `width` + `height` trên thẻ `<img>` để tránh CLS
- Ưu tiên WebP + CDN

---

## 4. Lộ Trình Triển Khai (Priority Roadmap)

| Sprint | Tuần | Việc Cần Làm | File |
|---|---|---|---|
| Sprint 1 | 1–2 | Sửa meta Homepage theo template v2 | `index.astro` |
| Sprint 1 | 1–2 | Sửa `generateCollectionSchema` nhận dynamic title/desc | Category page |
| Sprint 2 | 3–4 | Cập nhật `generateComicSchema` inject keyword | Comic detail |
| Sprint 2 | 3–4 | Chuẩn hoá URL slug + Sitemap phân tách | Config/sitemap |
| Sprint 3 | 5–6 | Sửa `generateChapterSchema` — `headline`, `datePublished` | Chapter page |
| Sprint 3 | 5–6 | Breadcrumb Schema + Canonical tags | All pages |
| Sprint 3 | 5–6 | Audit Core Web Vitals — tối ưu ảnh chapter | Chapter images |
