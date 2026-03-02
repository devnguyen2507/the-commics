# Implementation Plan: Astro Frontend (`src/ui`)

## 1. Overview

Tài liệu triển khai chi tiết cho Frontend Astro, bổ sung và cụ thể hóa các nội dung mà `Spec-Frontend.md` đã đặc tả ở mức thiết kế. Bao gồm: đặc tả từng loại trang, quy chuẩn SEO nghiêm ngặt, chính sách URL, hiệu năng tải trang, và giải pháp CSS responsive cho hình ảnh truyện đa kích cỡ.

### 1.1. Dữ liệu phân tích thực tế từ Storage

Đã khảo sát 20+ ảnh truyện từ `ops/docker/storage_data/`:

| Loại ảnh | Width (px) | Height (px) | Tỉ lệ | Ghi chú |
|---|---|---|---|---|
| Cover/Title page | 850–1280 | 540–800 | ~16:9 (landscape) | Trang bìa, intro |
| Content page (Manga) | 1000–1200 | 1400–1770 | ~2:3 (portrait) | Trang nội dung chính |
| Content page (Webtoon) | 1080 | 1500–1600 | ~2:3 (dọc dài) | Cuộn liên tục |
| Square page | 1080 | 1080 | 1:1 | Trang đặc biệt |

**Kết luận**: Ảnh cực kì đa dạng kích cỡ → CSS phải dùng `width: 100%; height: auto` kết hợp `aspect-ratio` từ API (w/h) để chống CLS.

### 1.2. Khảo sát CSS từ các trang truyện (HentaiVN, Nettruyen)

| Pattern | Giá trị |
|---|---|
| Reader container | `max-width: 800–1200px; margin: 0 auto` |
| Reader image | `display: block; width: 100%; height: auto` |
| Mobile reader | Full viewport width, no padding |
| Thumbnail grid | 2 cột mobile → 6 cột desktop |
| SEO box | Cuối trang, compact, `overflow` hidden |

---

## 2. Đặc tả Chi tiết Từng Loại Trang

### 2.1. Trang Chủ (Homepage) — Route: `/`

```
┌─────────────────────────────────────────────┐
│  [Sticky Navbar] Logo | Search | Menu       │
├─────────────────────────────────────────────┤
│  [Hero/Slider] Truyện Hot/Trending          │
│  Card lớn, label ranking, auto-slide        │
├─────────────────────────────────────────────┤
│  [Grid] Truyện Mới Cập Nhật                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐             │
│  │  │ │  │ │  │ │  │ │  │ │  │  (6 cột)    │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘             │
│  [Pagination]                               │
├─────────────────────────────────────────────┤
│  [SEO Content Box] ← max-height, scrollable │
│  <h1>Đọc Truyện Hentai Online Miễn Phí</h1>│
│  <p>Mô tả text tĩnh 200-300 từ...</p>      │
├─────────────────────────────────────────────┤
│  [Footer]                                   │
└─────────────────────────────────────────────┘
```

**Chi tiết kỹ thuật:**
- **H1**: Một và chỉ một thẻ `<h1>` tĩnh đặt trong SEO Content Box, chứa keyword chính (VD: "Đọc Truyện Hentai Online Miễn Phí")
- **Grid responsive**: Mobile 2 cột → Tablet 4 cột → Desktop 6 cột
- **Thumbnail**: Tỉ lệ `2:3`, `object-fit: cover`, lazy load, CDN w=300
- **SEO Content Box**: Đặt cuối trang trước footer
  - `max-height: 120px; overflow-y: auto;` (hoặc "Xem thêm" button)
  - Nội dung SSR tĩnh, render sẵn trên server
  - Chỉ hiện khi scroll xuống cuối, không gây phiền người đọc
- **Dữ liệu**: GraphQL query `comics(first: 30, sort: LATEST)`

### 2.2. Trang Chi Tiết Truyện (Comic Detail) — Route: `/{comic-slug}`

```
┌─────────────────────────────────────────────┐
│  [Breadcrumbs] Trang chủ > Thể loại > Tên  │
├─────────────────────────────────────────────┤
│  ┌──────┐  Tên Truyện (H1)                 │
│  │ Bìa  │  Tác giả: xxx                    │
│  │ 2:3  │  Trạng thái: Hoàn thành          │
│  │      │  Rating: ★★★★☆ (4.2/5)           │
│  └──────┘  Tags: [NTR] [Webtoon] [18+]     │
│            [Xem chap đầu] [Xem chap mới]   │
├─────────────────────────────────────────────┤
│  <p>Mô tả truyện / Description SSR</p>     │
├─────────────────────────────────────────────┤
│  [Danh sách chương] scroll/pagination       │
│  Chap 1  |  Chap 2  |  Chap 3  |  ...      │
├─────────────────────────────────────────────┤
│  [Truyện cùng thể loại] (lazy load)        │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐                       │
│  └──┘ └──┘ └──┘ └──┘                       │
├─────────────────────────────────────────────┤
│  [Footer]                                   │
└─────────────────────────────────────────────┘
```

**Chi tiết kỹ thuật:**
- **H1**: `<h1>` = Tên truyện (VD: "Cô Gái Cạnh Tôi Quá Đam Đãng")
- **Box thông tin truyện**: Toàn bộ SSR render tĩnh → dữ liệu tĩnh = SEO content chính
  - Bìa, tên, tác giả, status, rating, description, tags
  - Tags bấm được (internal link đến trang thể loại)
- **Danh sách chương**: Dùng scroll container hoặc pagination nếu > 50 chương, tap target > 44px
- **Truyện cùng thể loại**: Lazy load (client-side), GraphQL query `comics(filter: {category_slug})` 
- **Dữ liệu**: GraphQL query `comic(slug: "...")` SSR, pre-render

### 2.3. Trang Đọc Chapter (Reader) — Route: `/{comic-slug}/{chapter-slug}`

```
┌─────────────────────────────────────────────┐
│  [Floating Navbar] ← ẩn khi scroll xuống   │
│  ← Prev | Tên Truyện - Chap X | Next →     │
├─────────────────────────────────────────────┤
│                                             │
│         ┌───────────────────┐               │
│         │   Reader Image 1  │               │
│         │   width: 100%     │               │
│         │   max-w: 1000px   │               │
│         └───────────────────┘               │
│         ┌───────────────────┐               │
│         │   Reader Image 2  │               │
│         │   (no gap/margin) │               │
│         └───────────────────┘               │
│         ... (20-100 ảnh cuộn dọc)           │
│                                             │
├─────────────────────────────────────────────┤
│  [Next/Prev Chapter Buttons] (lớn, dễ bấm) │
├─────────────────────────────────────────────┤
│  [SEO Content Box] SSR tĩnh                 │
│  <h1>Tên Truyện - Chapter X</h1>           │
│  <p>Nội dung keyword mô tả...</p>          │
├─────────────────────────────────────────────┤
│  [Footer]                                   │
└─────────────────────────────────────────────┘
```

**Chi tiết kỹ thuật:**
- **Nền**: `background: #000000` (đen tuyệt đối)
- **H1**: `<h1>` = "Tên Truyện - Chapter X" (đặt trong SEO Content Box cuối trang)
- **Floating Navbar**: Scroll down → `transform: translateY(-100%)` ẩn đi; scroll up → hiện lại. Passive event listener
- **SEO Content Box**: Tương tự trang chủ, compact text SSR cuối trang
- **Ảnh truyện**: KHÔNG SSR render, chỉ render placeholder box + alt text phía server → client lazy load thực tế
- **Dữ liệu**: GraphQL query `chapter(id)` trả về mảng `images[{url, w, h}]`, `next_chapter_id`, `prev_chapter_id`

### 2.4. Trang Thể loại / Tag — Route: `/the-loai/{category-slug}`

```
┌─────────────────────────────────────────────┐
│  [Breadcrumbs] Trang chủ > Thể loại > NTR  │
├─────────────────────────────────────────────┤
│  <h1>Truyện NTR - Netorare Hay Nhất</h1>   │
├─────────────────────────────────────────────┤
│  [Internal Links Bar]                       │
│  [Hot] [Mới nhất] [Thể loại khác...]       │
├─────────────────────────────────────────────┤
│  [Grid] Danh sách truyện theo thể loại     │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐             │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘             │
│  [Pagination]                               │
├─────────────────────────────────────────────┤
│  [SEO Content Box] compact, scrollable      │
│  <p>Mô tả thể loại NTR, 200 từ...</p>      │
├─────────────────────────────────────────────┤
│  [Footer]                                   │
└─────────────────────────────────────────────┘
```

**Chi tiết**: Bố cục tương tự Homepage + filter theo category. Internal links dẫn đến các thể loại khác.

### 2.5. Trang Truyện Hot / Danh sách Đặc biệt — Route: `/truyen-hot`

Tương tự trang Tag nhưng sort theo `MOST_VIEWED`. Có ranking labels (Hạng 1, 2, 3...).

### 2.6. Trang Danh sách Thể loại — Route: `/the-loai`

```
┌─────────────────────────────────────────────┐
│  [Breadcrumbs] Trang chủ > Thể loại        │
├─────────────────────────────────────────────┤
│  <h1>Thể loại Truyện</h1>                  │
├─────────────────────────────────────────────┤
│  [Grid/List tất cả thể loại]               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   NTR    │ │ Webtoon  │ │ Manhwa   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Gia đình │ │ Oneshot  │ │  18+     │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ... (tags bấm được → /the-loai/{slug})    │
├─────────────────────────────────────────────┤
│  [SEO Content Box] compact, scrollable      │
│  <p>Danh sách tất cả thể loại truyện...</p>│
├─────────────────────────────────────────────┤
│  [Footer]                                   │
└─────────────────────────────────────────────┘
```

**Chi tiết**: Hiển thị tất cả category dạng tag cloud / grid. Mỗi tag là internal link đến `/the-loai/{slug}`. Dữ liệu từ GraphQL query `categories`.

---

## 3. Quy chuẩn SEO On-Page (Bắt buộc)

### 3.1. Quy tắc H1

| Trang | Nội dung H1 | Vị trí |
|---|---|---|
| Homepage | Keyword chính site (VD: "Đọc Truyện Hentai Online") | SEO Content Box cuối trang |
| Chi tiết truyện | Tên truyện | Đầu trang, trong info box |
| Đọc chapter | "Tên Truyện - Chapter X" | SEO Content Box cuối trang |
| Thể loại | "Truyện {Tên thể loại} Hay Nhất" | Đầu trang, dưới breadcrumbs |
| Truyện hot | "Truyện Hot / Trending" | Đầu trang |

**Ràng buộc cứng:**
- Chỉ DUY NHẤT 1 thẻ `<h1>` mỗi trang
- Nội dung H2 KHÔNG ĐƯỢC trùng lặp với H1
- H1 phải chứa keyword SEO trọng tâm

### 3.2. URL Convention — Không Trailing Slash

```
✅ Đúng: domain.com/the-loai/ntr
❌ Sai:  domain.com/the-loai/ntr/

✅ Đúng: domain.com/co-gai-canh-toi/chapter-1
❌ Sai:  domain.com/co-gai-canh-toi/chapter-1/
```

**Quy tắc:**
- Mặc định load URL **KHÔNG có `/` cuối**
- Nếu user truy cập URL có trailing slash → **redirect 301** về URL không có slash
- Sitemap.xml cũng chỉ chứa URL không trailing slash
- Canonical tag trỏ về URL không trailing slash

### 3.3. Slug tiếng Việt (Không dấu)

Thống nhất dùng slug tiếng Việt không đấu cho toàn bộ URL:
```
VD: co-gai-canh-toi-qua-dam-dang
VD: ba-nguyen-tac-cho-em-gai
VD: truyen-hot
VD: the-loai/ntr
```

### 3.4. Canonical Tags

Mọi trang bắt buộc có:
```html
<link rel="canonical" href="https://domain.com/duong-dan-chinh-xac" />
```
- Canonical trỏ về **chính nó** (self-referencing)
- URL trong canonical KHÔNG có trailing slash
- Tránh tuyệt đối duplicate content giữa biến thể URL

### 3.5. Breadcrumbs (SSR + JSON-LD)

Render SSR trên mọi trang (trừ Homepage):

| Trang | Breadcrumb |
|---|---|
| Chi tiết truyện | `Trang chủ > Thể loại > Tên truyện` |
| Đọc chapter | `Trang chủ > Tên truyện > Chapter X` |
| Thể loại | `Trang chủ > Thể loại > Tên thể loại` |
| Truyện hot | `Trang chủ > Truyện Hot` |

Kèm theo JSON-LD `BreadcrumbList`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://domain.com" },
    { "@type": "ListItem", "position": 2, "name": "NTR", "item": "https://domain.com/the-loai/ntr" },
    { "@type": "ListItem", "position": 3, "name": "Tên Truyện" }
  ]
}
</script>
```

### 3.6. JSON-LD Structured Data

| Trang | Schema Type | Mục đích |
|---|---|---|
| Homepage | `WebSite` + `SearchAction` | Rich snippet tìm kiếm |
| Chi tiết truyện | `Book` / `CreativeWork` | Rich snippet truyện |
| Mọi trang | `BreadcrumbList` | Breadcrumb snippet |

VD trang chi tiết:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "Tên Truyện",
  "author": { "@type": "Person", "name": "Tác giả" },
  "description": "Mô tả truyện...",
  "image": "https://cdn.domain.com/path/to/cover.webp",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.2",
    "ratingCount": "150"
  }
}
</script>
```

---

## 4. Hiệu năng & Tải Bất đồng bộ

### 4.1. Script Loading

```html
<!-- ✅ Đúng: defer/async -->
<script src="app.js" defer></script>

<!-- ❌ Sai: blocking -->
<script src="app.js"></script>
```

Toàn bộ `<script>` dùng `defer` (ưu tiên) hoặc `async`. Không có script nào blocking render path.

### 4.2. Image Lazy Loading

```html
<!-- Mọi thẻ <img> đều phải có -->
<img src="..." loading="lazy" decoding="async" alt="..." />
```

- `loading="lazy"`: Browser tự lazy load khi gần viewport
- `decoding="async"`: Giải mã ảnh không block main thread
- Ảnh **KHÔNG render SSR** — server chỉ output placeholder box + alt text

### 4.3. Preconnect CDN

```html
<link rel="preconnect" href="https://cdn.domain.com" />
<link rel="dns-prefetch" href="https://cdn.domain.com" />
```

### 4.4. Astro Island Directives

| Directive | Dùng cho |
|---|---|
| Không JS (default) | SEO box, info text, breadcrumbs, footer |
| `client:idle` | Pagination, search, floating navbar |
| `client:visible` | Danh sách truyện recommend, lazy grids |
| `client:only` | Reader image observer, localStorage sync |

---

## 5. Giải pháp CSS Responsive cho Ảnh Truyện

### 5.1. Component `<ReaderImage>` — Trang đọc chapter

Thiết kế dựa trên data thực tế: ảnh gốc 850–1280px wide, 540–1770px tall.

```css
/* Container reader */
.reader-container {
  max-width: 1000px;    /* Desktop: giới hạn chiều rộng */
  margin: 0 auto;       /* Căn giữa */
  background: #000;     /* Nền đen */
  padding: 0;           /* Không padding */
}

/* Wrapper cho mỗi ảnh — dùng aspect-ratio từ API */
.reader-image-wrapper {
  width: 100%;
  /* aspect-ratio: {w}/{h} từ API → inject inline style */
  /* VD: style="aspect-ratio: 1200/1770" */
  content-visibility: auto;  /* Virtualization: skip render ngoài viewport */
  contain-intrinsic-size: auto 1000px auto 1500px; /* Estimated size hint */
}

/* Ảnh thực */
.reader-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;  /* Giữ nguyên tỉ lệ, không cắt */
  margin: 0;            /* Không gap giữa các ảnh */
  padding: 0;
}

/* Mobile: full viewport width */
@media (max-width: 768px) {
  .reader-container {
    max-width: 100vw;
    margin: 0;
  }
}
```

**Logic component (pseudo-code):**
```astro
---
// SSR: Chỉ render placeholder + alt, KHÔNG render <img src>
const { images, comicTitle, chapterNumber } = Astro.props;
---

<div class="reader-container">
  {images.map((img, i) => (
    <div
      class="reader-image-wrapper"
      style={`aspect-ratio: ${img.w}/${img.h}`}
    >
      <img
        class="reader-image"
        data-src={`${CDN_URL}/${img.url}`}
        alt={`${comicTitle} - Chapter ${chapterNumber} - Trang ${i + 1}`}
        loading="lazy"
        decoding="async"
        width={img.w}
        height={img.h}
      />
    </div>
  ))}
</div>
```

### 5.2. Component `<ComicCard>` — Thumbnail trang danh sách

```css
.comic-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* Mobile: 2 cột */
  gap: 12px;
  padding: 12px;
}

@media (min-width: 640px) {
  .comic-grid { grid-template-columns: repeat(4, 1fr); }  /* Tablet: 4 cột */
}
@media (min-width: 1024px) {
  .comic-grid { grid-template-columns: repeat(6, 1fr); }  /* Desktop: 6 cột */
}

.comic-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.comic-card-thumb {
  aspect-ratio: 2/3;     /* Tỷ lệ chuẩn poster dọc */
  width: 100%;
  object-fit: cover;     /* Crop fit vào khung */
  border-radius: 8px;
}

.comic-card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;  /* Giới hạn 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 600;
  margin-top: 6px;
  font-size: 0.875rem;
}
```

**CDN URL cho thumbnail:**
```
/cdn-cgi/image/w=300,h=450,f=webp/{comic-slug}/thumbnails/0000.jpg
```
→ CDN tự crop 2:3 và convert WebP, tiết kiệm bandwidth.

### 5.3. SEO Content Box Pattern

```css
.seo-content-box {
  max-height: 120px;          /* Chiều cao vừa đủ */
  overflow-y: auto;           /* Scroll nếu dài hơn */
  padding: 16px 20px;
  margin: 24px auto;
  max-width: 960px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  line-height: 1.6;
}

.seo-content-box h1 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
}

/* Scrollbar nhỏ gọn, không gây phiền */
.seo-content-box::-webkit-scrollbar {
  width: 3px;
}
.seo-content-box::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
```

---

## 6. Routing Map Tổng quan

| Route | Page Type | SSR Content | Lazy Content |
|---|---|---|---|
| `/` | Homepage | H1, SEO box, meta | Grid truyện, slider |
| `/{comic-slug}` | Detail | Info box, H1, breadcrumbs, description | Chapter list, recommend |
| `/{comic-slug}/{chapter-slug}` | Reader | H1, SEO box, alt texts, breadcrumbs | Images (lazy + aspect-ratio) |
| `/the-loai/{category-slug}` | Category | H1, SEO box, breadcrumbs | Grid truyện |
| `/truyen-hot` | Hot list | H1, SEO box, breadcrumbs | Grid ranking |
| `/the-loai` | Category Index | H1, SEO box, breadcrumbs | Tag cloud (all categories) |

**Tất cả URL không có trailing slash. Redirect 301 nếu có.**

---

## 7. GraphQL API — Dependency Gaps (Cần bổ sung trước khi làm Frontend)

> ⚠️ **BLOCKING**: 2 gap dưới đây phải được fix ở GraphQL API (`src/backend/graphql`) trước khi Frontend có thể triển khai đầy đủ.

### 7.1. GAP #1: `comics()` chưa filter theo `category_slug`

**Hiện trạng**: `ComicFilter` đã khai báo field `category_slug: Option<String>` nhưng trong `query.rs` chỉ xử lý `search_query` và `status`, **bỏ sót `category_slug`**.

**Ảnh hưởng Frontend**: Trang `/the-loai/{category-slug}` không thể lọc truyện theo thể loại.

**Cần làm** (trong `src/backend/graphql/src/graphql/query.rs`):
```rust
// Thêm vào block if let Some(f) = filter { ... }
if let Some(cat_slug) = f.category_slug {
    // JOIN comics → comic_categories → categories
    // WHERE categories.id = cat_slug (vì id = slug trong bảng categories)
    use crate::schema::{comic_categories, categories};
    let comic_ids: Vec<String> = comic_categories::table
        .inner_join(categories::table)
        .filter(categories::id.eq(cat_slug))
        .select(comic_categories::comic_id)
        .load::<String>(&mut conn)
        .await?;
    query = query.filter(crate::schema::comics::id.eq_any(comic_ids));
}
```

### 7.2. GAP #2: `chapter()` không trả thông tin Comic cha

**Hiện trạng**: `Chapter` type chỉ trả `id`, `chapter_number`, `order_index`. **Không có** `comic_id`, `comic_slug`, `comic_title`.

**Ảnh hưởng Frontend**:
- Trang Reader không build được breadcrumbs (`Trang chủ > Tên truyện > Chapter X`)
- Không render được SEO H1 ("Tên Truyện - Chapter X")
- Không có link quay lại trang chi tiết truyện
- Floating Navbar không hiển thị được tên truyện

**Cần làm** (trong `src/backend/graphql/src/graphql/types.rs`):
```rust
// Thêm field comic_id vào struct Chapter
pub struct Chapter {
    pub id: ID,
    pub comic_id: String,  // ← THÊM MỚI
    pub chapter_number: String,
    pub order_index: f64,
}

// Thêm resolver cho comic parent
#[Object]
impl Chapter {
    // ... existing fields ...

    /// Trả về thông tin comic cha (cho breadcrumbs, SEO)
    async fn comic(&self, ctx: &Context<'_>) -> Result<Option<Comic>> {
        let pool = ctx.data::<DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;
        let result = crate::schema::comics::table
            .filter(crate::schema::comics::id.eq(&self.comic_id))
            .first::<crate::models::Comic>(&mut conn)
            .await
            .optional()
            .map_err(|e| e.to_string())?;
        Ok(result.map(Comic::from))
    }
}
```

### 7.3. Tổng hợp Impact Matrix

| Gap | File cần sửa | Frontend bị block |
|---|---|---|
| #1 category_slug filter | `query.rs` | Trang `/the-loai/*` |
| #2 chapter → comic info | `types.rs`, `query.rs` | Trang Reader breadcrumbs, SEO, navbar |

---

## Tham chiếu
- [[030-Specs/Spec-Frontend]]
- [[030-Specs/Spec-GraphQL]]
- [[030-Specs/Spec-CDN]]
- [[040-Design/Design-Prototype]]
