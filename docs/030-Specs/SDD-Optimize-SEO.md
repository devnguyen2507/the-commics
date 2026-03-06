---
id: SDD-SEO-001
type: solution-design
status: draft
project: commics
owner: "DevNguyen"
tags: [seo, frontend, url-structure, schema-migration, content]
created: 2026-03-04
linked-to: [[030-Specs/Spec-Frontend]]
---

# SDD: Tối ưu SEO toàn diện

## 1. Tổng quan

Tài liệu này đặc tả kế hoạch tối ưu SEO trên toàn bộ frontend, bao gồm:
- Cấu trúc URL (routing strategy)
- SEO content box nền cho từng loại trang
- Schema markup (JSON-LD — ComicSeries, Article, FAQPage, WebSite)
- Database migration (thêm `description` cho `categories`, `chapters`)
- SEO metadata DB table cho static pages (SSR-loaded từ API)
- Trang pháp lý và hỗ trợ
- Pagination SEO strategy
- Redirect 301 mechanism cho chapter URL migration
- Internal linking strategy

---

## 2. Danh sách trang cần tối ưu

| # | Trang | Route | Trạng thái hiện tại | Cần làm |
|---|-------|-------|---------------------|---------|
| 1 | Trang chủ | `/` | Có SEO box cơ bản | Nâng cấp H1, schema, meta |
| 2 | Truyện Hot | `/truyen-hot` | Có H1, meta | Thêm SEO content box |
| 3 | Truyện Mới | `/truyen-moi` | **Chưa có trang** | Tạo mới |
| 4 | Truyện Ngắn (One-shot) | `/the-loai/truyen-ngan` | Route thể loại | SEO content box riêng |
| 5 | Danh mục Thể loại | `/the-loai` | Có H1 | Thêm SEO content box, meta |
| 6 | Chi tiết Thể loại | `/the-loai/{slug}` | Đã xong | ✅ Tích hợp description DB, render Rich HTML, có scrollbar |
| 7 | Chi tiết Truyện | `/truyen/{slug}` | Đã xong | ✅ Đã thêm prefix /truyen/, nâng cấp schema, meta |
| 8 | Chapter Reader | `/truyen/{slug}/chap-{chapterNum}` | Đã xong | ✅ Đã đồng bộ chap-N, slugify URL, nâng cấp schema |
| 9 | Footer | Layout toàn cục | Có links cơ bản | Thêm links SEO |
| 10 | Điều khoản | `/dieu-khoan` | **Chưa có** | Tạo mới |
| 11 | Chính sách | `/chinh-sach` | **Chưa có** | Tạo mới |
| 12 | Liên hệ | `/lien-he` | **Chưa có** | Tạo mới |
| 13 | FAQ | `/cau-hoi-thuong-gap` | **Chưa có** | Tạo mới |

---

## 3. Đề xuất & Tham vấn — Cấu trúc URL

### 3.1. URL Truyện: `/{slug}` vs `/truyen/{slug}`

> [!IMPORTANT]
> **Quyết định: Sử dụng `/truyen/{slug}`** — Đã triển khai để phân tách clear namespace cho comic content.

**Lý do:**
| Tiêu chí | `/{slug}` | `/truyen/{slug}` |
|----------|-----------|------------------|
| Độ ngắn URL | ✅ Ngắn nhất, clean | ❌ Dài hơn 7 ký tự |
| SEO Keyword trong URL | ✅ Slug truyện chính là keyword | ⚠️ Thêm "truyen" nhưng không keyword mới |
| Conflict với trang khác | ⚠️ Cần đảm bảo slug truyện không trùng với route tĩnh | ✅ Không conflict |
| Thay đổi hệ thống | ✅ Không thay đổi gì | ❌ Cần redirect 301 tất cả URL cũ, đổi sitemap |
| Chuẩn ngành | ✅ Nhattruyen, Nettruyen, MangaDex đều dùng `/{slug}` | ⚠️ Ít site dùng prefix |

**Về trang danh sách `/truyen`**: Nếu cần một trang "tất cả truyện" thì tạo route riêng `/danh-sach` hoặc `/truyen` mà không cần đổi cấu trúc chi tiết. Tuy nhiên, vai trò này đã được đảm nhiệm bởi `/truyen-hot`, `/truyen-moi`, và `/the-loai`.

**Kết luận**: ✅ **Giữ nguyên `/{slug}`**. Không có lợi ích SEO đáng kể khi thêm prefix, nhưng rủi ro chuyển đổi rất cao (mất index Google, cần redirect toàn bộ URL).

---

### 3.2. URL Chapter: `/{slug}/{comic-slug-N}` vs `/{slug}/chap-N`

> [!IMPORTANT]
> **Đề xuất: Đổi sang `/{slug}/chap-{N}`** — Gọn, rõ ràng, SEO-friendly hơn.

**Hiện tại**: `iraira-enanan-no-ecchi-na-nadamekata/iraira-enanan-no-ecchi-na-nadamekata-1`
- ❌ Lặp slug truyện 2 lần trong URL → URL rất dài
- ❌ Khó đọc cho người dùng
- ❌ Google trừ điểm quality cho URL quá dài

**Đề xuất**: `iraira-enanan-no-ecchi-na-nadamekata/chap-1`
- ✅ URL ngắn, rõ ràng
- ✅ Chứa keyword "chap" — giúp Google hiểu đây là trang chapter
- ✅ Trải nghiệm người dùng tốt hơn khi chia sẻ link
- ✅ Chuẩn ngành: Nhattruyen, Nettruyen, MangaDex đều dùng dạng `chap-N`

**Lưu ý triển khai**:
- Thêm cột `slug` trong bảng `chapters` để lưu slug mới (VD: `chap-1`)
- Hoặc tạo mapping trong frontend: dùng `chapter_number` để tạo `chap-{N}` URL
- Redirect 301 từ URL cũ sang URL mới (nếu đã index)

```
Trước:  /iraira-enanan-no-ecchi-na-nadamekata/iraira-enanan-no-ecchi-na-nadamekata-1
Sau:    /iraira-enanan-no-ecchi-na-nadamekata/chap-1
```

---

## 4. Đề xuất & Tham vấn — Description cho Chapter

> [!IMPORTANT]
> **Đề xuất: Thêm cột `description` vào bảng `chapters`** — Rất có giá trị SEO.

### 4.1. Tại sao cần?

- **Keyword dài (Long-tail)**: Mỗi chapter có thể chứa keyword riêng mà SEO ở trang chi tiết truyện không cover được. VD: "ngoại tình", "bồ học sinh", "chốn công sở"...
- **Meta Description**: Google hiển thị meta description trong kết quả tìm kiếm. Nội dung tóm tắt chapter giúp tăng CTR (Click-Through Rate) đáng kể.
- **Content SEO Box**: Trang reader hiện có SEO box nhưng nội dung rất generic (`Đọc ngay {title} Chương {N} online...`). Thêm description thật sẽ biến mỗi chapter thành 1 landing page riêng.

### 4.2. Kế hoạch

| Hạng mục | Chi tiết |
|----------|----------|
| Migration | `ALTER TABLE chapters ADD COLUMN description TEXT;` |
| GraphQL | Expose `description` field trong `Chapter` type |
| Frontend | Dùng `description` cho meta tag + SEO content box |
| Nội dung | Phase 1: AI-generated tóm tắt dựa trên tiêu đề truyện + chapter number. Phase 2: Viết tay bổ sung keyword chiến lược |

### 4.3. Ví dụ Impact

```
Hiện tại (generic):
  <meta description="Đọc ngay Iraira Enanan... Chương 1 online chất lượng cao">

Sau khi thêm description (targeted):
  <meta description="Cô bạn gái khó tính Enanan bị quyến rũ bởi sếp trẻ tại công ty, 
  dẫn đến tình huống ngoại tình nghẹt thở. Đọc chương 1 vietsub HD">
```

→ Keyword "ngoại tình", "quyến rũ", "công ty" giúp rank cho long-tail search mà trang chính không cover.

---

## 5. Đề xuất — Description cho Category

> [!IMPORTANT]
> **Đề xuất: Thêm cột `description` vào bảng `categories`** — Cần thiết cho SEO.

### 5.1. Hiện trạng

Trang `/the-loai/{slug}` hiện tại:
- ✅ Có H1, Breadcrumb
- ❌ **Không có SEO content box** — Google thấy trang chỉ là grid hình ảnh, không có text content
- ❌ Meta description generic: `Danh sách truyện thể loại {name} hay nhất`

### 5.2. Kế hoạch

| Hạng mục | Chi tiết |
|----------|----------|
| Migration | `ALTER TABLE categories ADD COLUMN description TEXT;` |
| Migration | `ALTER TABLE categories ADD COLUMN slug VARCHAR;` (nếu chưa có slug riêng) |
| GraphQL | Expose `description` field trong `Category` type |
| Frontend | Thêm SEO content box dưới grid truyện tại `/the-loai/{slug}` |
| Nội dung | Viết bài mô tả thể loại (50-200 từ) chứa keyword đích |

### 5.3. Ví dụ SEO Content Box

```html
<!-- /the-loai/cheating -->
<section class="seo-box">
  <h2>Truyện Cheating (Ngoại Tình) là gì?</h2>
  <p>Thể loại Cheating (Ngoại tình) tập trung vào các câu chuyện 
  về mối quan hệ ngoài luồng, sự phản bội trong tình yêu...
  Tại Commics, bạn có thể đọc hàng trăm bộ truyện cheating 
  vietsub chất lượng cao, cập nhật mỗi ngày.</p>
</section>
```

---

## 6. Trang mới cần tạo

### 6.1. Trang Truyện Mới `/truyen-moi`
- Route: `src/pages/truyen-moi.astro`
- Query: `getComics({ first: 24, sort: ComicSort.Newest })`
- SEO: H1 "Truyện Mới Cập Nhật", meta description, SEO content box

### 6.2. Trang Pháp lý

| Route | Nội dung | Ghi chú |
|-------|----------|---------|
| `/dieu-khoan` | Điều khoản sử dụng | Static Astro page |
| `/chinh-sach` | Chính sách bảo mật | Static Astro page |
| `/lien-he` | Form liên hệ + thông tin | Static + optional form |
| `/cau-hoi-thuong-gap` | FAQ | JSON-LD FAQPage schema |

**SEO Value**: Google ưu tiên site có đầy đủ trang pháp lý (E-E-A-T signal). FAQ page có thể xuất hiện dưới dạng Rich Snippet.

### 6.3. Footer SEO Links

```
Commics
├── Truyện Hot          /truyen-hot
├── Truyện Mới          /truyen-moi
├── Thể loại            /the-loai
├── Tìm kiếm            /tim-kiem
│
├── Điều khoản           /dieu-khoan
├── Chính sách           /chinh-sach
├── Liên hệ              /lien-he
└── FAQ                   /cau-hoi-thuong-gap
```

---

## 7. Database Migration Plan

```sql
-- Phase 1: Category description & slug cleanup
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
-- Lưu ý: categories.id đang dùng làm slug, không cần thêm cột slug riêng

-- Phase 2: Chapter description
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS description TEXT;
```

---

## 8. SEO Content Box Template

Mỗi trang cần có **SEO content box** (block text nền) ở cuối trang:

```astro
<section class="max-w-6xl mx-auto px-4 pb-16">
  <div class="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800">
    <h2 class="text-xl font-bold text-zinc-300 mb-4">
      {seoTitle}
    </h2>
    <div class="text-zinc-500 text-sm leading-relaxed space-y-4">
      <p>{seoContent}</p>
    </div>
  </div>
</section>
```

| Trang | SEO Box H2 | Nguồn content |
|-------|-----------|---------------|
| `/` | "Đọc truyện tranh online tại Commics" | Hardcode |
| `/truyen-hot` | "Truyện hot là gì?" | Hardcode |
| `/truyen-moi` | "Truyện mới cập nhật hôm nay" | Hardcode |
| `/the-loai/{slug}` | "Truyện {name} là gì?" | `categories.description` từ DB |
| `/{slug}` | Comic description | `comics.description` từ DB |
| `/{slug}/chap-{N}` | Tóm tắt chapter | `chapters.description` từ DB |
| `/cau-hoi-thuong-gap` | FAQ content | Hardcode + JSON-LD FAQPage |

---

## 9. Checklist Implementation

### Phase 1: Quick Wins (không cần DB change)
- [ ] Tạo `/truyen-moi` page
- [ ] Thêm SEO content box vào `/truyen-hot`
- [ ] Cải thiện SEO box trang chủ `/`
- [ ] Tạo trang pháp lý (`/dieu-khoan`, `/chinh-sach`, `/lien-he`, `/cau-hoi-thuong-gap`)
- [ ] Nâng cấp Footer với đầy đủ links
- [ ] JSON-LD: `FAQPage` cho `/cau-hoi-thuong-gap`
- [ ] JSON-LD: `WebSite` + `SearchAction` cho trang chủ
- [ ] Thêm `noindex` cho `/tim-kiem?q=...` (search params)
- [ ] Fix `twitter:url` dùng `cleanCanonical` trong `BaseHead.astro`
- [ ] Fix Google Fonts loading (non-blocking)
- [ ] Thêm `lastmod: updatedAt` vào `sitemap-comics.xml`
- [ ] Branded default OG image (user cung cấp file)
- [ ] Alt text audit cho `ComicCard.astro` và chapter reader images

### Phase 2: DB Migration + Category SEO + Schema
- [x] Migration: `categories.description` (Done)
- [x] Expose `description` trong GraphQL `Category` type (Done)
- [x] Thêm SEO content box vào `/the-loai/{slug}` (Done - styled with scrollbar)
- [x] JSON-LD: `CollectionPage` + `BreadcrumbList` cho `/the-loai/{slug}` (Done)
- [ ] JSON-LD: `ComicSeries` + `BreadcrumbList` cho `/{slug}`
- [x] Populate category descriptions (In progress - using `seo_report_cat_2.html` for missing slugs)

### Phase 3: Chapter SEO + URL Migration
- [x] Migration: `chapters.description`
- [x] Expose `description` trong GraphQL `Chapter` type
- [x] Đổi URL chapter sang `/truyen/{slug}/chap-{N}` + slugify (VD: `chap-ch-1`)
- [x] Cập nhật `sitemap-chapters.xml` dùng `chap-{N}` URLs
- [ ] JSON-LD: `Article` + `BreadcrumbList` cho chapter reader (Đã update canonical & breadcrumb)
- [ ] Nâng cấp SEO box trong chapter reader (dùng `chapters.description`)
- [ ] Populate chapter descriptions (AI-generated Phase 1)

### Phase 4: Internal Linking + Pagination
- [ ] Thêm "Truyện cùng thể loại" section vào `/{slug}` với keyword-rich anchors
- [ ] Implement pagination cho `/truyen-hot`, `/truyen-moi`, `/the-loai/{slug}` (nếu quyết định có)
- [ ] Spec và implement pagination SEO theo Section 13

---

## 11. SEO Metadata — DB-backed cho Static Pages

> [!IMPORTANT]
> **Vấn đề**: `Layout.astro` có fallback description `"Đọc truyện tranh hentai online hay nhất..."` — được inject vào **mọi trang** nếu không truyền `description` prop. Các trang mới (`/dieu-khoan`, `/chinh-sach`, `/cau-hoi-thuong-gap`) dùng fallback này sẽ có meta sai hoàn toàn.

### 11.1. Giải pháp ngắn hạn (Phase 1)

Mỗi trang `.astro` mới **BẮT BUỘC** truyền `description` rõ ràng:

| Trang | Title | Description |
|-------|-------|-------------|
| `/truyen-moi` | `"Truyện Mới Cập Nhật - Commics"` | `"Đọc truyện mới nhất hôm nay: manga, manhwa, manhua vietsub cập nhật liên tục."` |
| `/dieu-khoan` | `"Điều khoản Sử dụng - Commics"` | `"Điều khoản và quy định sử dụng dịch vụ đọc truyện tranh online tại Commics."` |
| `/chinh-sach` | `"Chính sách Bảo mật - Commics"` | `"Chính sách bảo mật, thu thập và xử lý dữ liệu người dùng của Commics."` |
| `/lien-he` | `"Liên hệ - Commics"` | `"Liên hệ với đội ngũ Commics để hỗ trợ, hợp tác hoặc báo cáo nội dung."` |
| `/cau-hoi-thuong-gap` | `"Câu hỏi Thường Gặp - Commics"` | `"Giải đáp những câu hỏi thường gặp về cách đọc truyện, tài khoản và dịch vụ Commics."` |

### 11.2. Giải pháp dài hạn — DB-backed SSR Metadata

Về lâu dài, SEO metadata (title, description, OG) cho các trang cần có thể chỉnh từ backend mà không cần redeploy frontend.

**Phương án**: Tạo bảng `page_metadata` trong DB:

```sql
-- Phase 2: Mở rộng sau khi có categories.description
CREATE TABLE page_metadata (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key   VARCHAR NOT NULL UNIQUE,  -- VD: 'truyen-moi', 'dieu-khoan'
  title      VARCHAR(70),
  description VARCHAR(160),
  og_image   VARCHAR,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**GraphQL query** (thêm vào schema):
```graphql
type PageMetadata {
  pageKey: String!
  title: String
  description: String
  ogImage: String
}

type Query {
  pageMetadata(pageKey: String!): PageMetadata
}
```

**Astro SSR usage**:
```astro
---
const meta = await getPageMetadata('truyen-moi');
---
<Layout title={meta?.title ?? 'Truyện Mới - Commics'}
        description={meta?.description ?? fallbackDescription}>
```

> [!NOTE]
> Phase 1 dùng hardcode. Phase 2+ migrate sang DB khi có nhu cầu thay đổi content marketing không cần redeploy.

---

## 12. JSON-LD Schema Markup Spec

> [!IMPORTANT]
> **Quyết định**: Dùng `ComicSeries` schema (phù hợp hơn `Book` cho manga/manhwa liên tục cập nhật).

### 12.1. Schema theo từng page type

| Trang | Schema Types | Priority |
|-------|-------------|----------|
| `/` (Trang chủ) | `WebSite` + `SearchAction` (Sitelinks Searchbox) | High |
| `/{slug}` (Chi tiết truyện) | `ComicSeries` + `BreadcrumbList` | High |
| `/{slug}/chap-{N}` (Chapter reader) | `Article` + `BreadcrumbList` | High |
| `/the-loai/{slug}` (Thể loại) | `CollectionPage` + `BreadcrumbList` | Medium |
| `/cau-hoi-thuong-gap` (FAQ) | `FAQPage` | Medium |
| `/dieu-khoan`, `/chinh-sach` | `WebPage` | Low |

### 12.2. Schema mẫu — `ComicSeries` cho `/{slug}`

```json
{
  "@context": "https://schema.org",
  "@type": "ComicSeries",
  "name": "{comic.title}",
  "description": "{comic.description}",
  "url": "https://commics.io/{comic.slug}",
  "image": "{comic.coverImage}",
  "genre": ["{category1}", "{category2}"],
  "inLanguage": "vi",
  "hasPart": [
    { "@type": "ComicIssue", "episodeNumber": 1, "url": ".../{slug}/chap-1" }
  ]
}
```

### 12.3. Schema mẫu — `WebSite` + `SearchAction` cho `/`

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Commics",
  "url": "https://commics.io",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://commics.io/tim-kiem?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 12.4. Schema mẫu — `Article` cho chapter reader

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{comicTitle} - Chương {chapterNumber}",
  "description": "{chapter.description}",
  "url": "https://commics.io/{slug}/chap-{N}",
  "image": "{firstPageImage}",
  "isPartOf": {
    "@type": "ComicSeries",
    "name": "{comicTitle}",
    "url": "https://commics.io/{slug}"
  },
  "inLanguage": "vi"
}
```

**Implementation**: Inject JSON-LD qua `<slot name="head">` trong Layout.astro, từng trang tự tạo JSON object phù hợp.

---

## 13. Pagination SEO Strategy

### 13.1. Hiện trạng

**Qua code review**: `/truyen-hot.astro` hiện dùng `getComics({ first: 24 })` — **không có pagination thực sự**, chỉ load cố định 24 truyện.

**Nguy cơ**: Khi implement pagination (tăng scale), nếu không có chiến lược SEO sẽ tạo duplicate content.

### 13.2. Ba options để quyết định

| Option | Cơ chế | SEO Impact | Trade-off |
|--------|--------|-----------|----------|
| **A — noindex page 2+** | `?page=2` có `<meta name="robots" content="noindex,follow">` | ✅ Không dilute crawl budget | ❌ Google không index page 2+ (traffic loss nếu user search "truyện hot trang 2") |
| **B — Canonical về page 1** | `?page=2` có `<link rel="canonical" href="/truyen-hot">` | ✅ Link equity tập trung vào page 1 | ❌ Content page 2+ không được rank độc lập |
| **C — Infinite scroll / Load-more** | Không tạo URL mới, JS append | ✅ Không tạo duplicate URL | ❌ Googlebot không crawl JS-rendered content tốt bằng HTML |

> [!NOTE]
> **Đề xuất**: Option A (noindex page 2+) phù hợp nhất với manga site — user thường search truyện theo tên/thể loại, không search "page 2". Crawl budget nên tập trung vào trang truyện, không phải trang list.

### 13.3. Search page `/tim-kiem`

**Vấn đề ngay hiện tại** (không cần pagination): URL `/tim-kiem?q=keyword` có thể bị Googlebot index.

**Fix**: Thêm `noindex` động trong `tim-kiem.astro`:

```astro
---
const hasQuery = Astro.url.searchParams.has('q');
---
<Layout ...>
  {hasQuery && (
    <meta slot="head" name="robots" content="noindex, follow" />
  )}
</Layout>
```

---

## 14. Redirect 301 — Chapter URL Migration

> [!NOTE]
> Section này chỉ áp dụng khi thực hiện đổi URL chapter từ `/{slug}/{uuid}` sang `/{slug}/chap-{N}` (Phase 3).

### 14.1. Khi nào cần redirect 301?

- ✅ **Cần** nếu các URL chapter cũ đã được Google index (có thể kiểm tra qua Search Console)
- ✅ **Cần** nếu có backlinks trỏ vào URL cũ
- ⚠️ **Không cần** nếu site còn non-index (chưa submit sitemap, lượng traffic organic = 0)

### 14.2. Ba cơ chế redirect trong Astro SSR

#### Cơ chế A — Astro Middleware *(Khuyến nghị)*

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  // Pattern: /{slug}/{anything-not-starting-with-"chap-"}
  const chapterOldPattern = /^\/([^\/]+)\/([^\/]+)$/;
  const match = url.pathname.match(chapterOldPattern);
  
  if (match) {
    const [, comicSlug, chapterId] = match;
    // Nếu chapterId là UUID (old format)
    if (isUUID(chapterId)) {
      const chapterNumber = await lookupChapterNumber(chapterId); // gọi API
      if (chapterNumber) {
        return context.redirect(`/${comicSlug}/chap-${chapterNumber}`, 301);
      }
    }
  }
  return next();
});
```

**Ưu điểm**: Redirect xảy ra ở server-side trước khi render → Google nhận đúng 301.  
**Nhược điểm**: Cần gọi API để lookup chapter_number từ UUID → thêm latency.

#### Cơ chế B — `astro.config.mjs` redirects

```javascript
// Chỉ phù hợp nếu số lượng chapter ít và biết trước danh sách
export default defineConfig({
  redirects: {
    '/truyen-slug/old-chapter-id': '/truyen-slug/chap-1',
    // ... không scale được với hàng ngàn chapters
  }
})
```

**Không phù hợp** với manga site có hàng ngàn chapters — phải hardcode từng URL.

#### Cơ chế C — Server-level (Nginx/Caddy)

```nginx
# nginx.conf
rewrite ^/([^/]+)/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$ /$1/chap-lookup?id=$2 redirect;
```

**Ưu điểm**: Nhanh nhất, không qua Astro.  
**Nhược điểm**: Cần lookup bảng mapping UUID → chapter_number ở nginx level (phức tạp) hoặc tạo endpoint trung gian.

### 14.3. Quyết định và thứ tự thực hiện

**Chọn: Cơ chế A (Astro Middleware)** — phù hợp nhất với kiến trúc SSR hiện tại.

**Thứ tự bắt buộc**:
1. Thêm `chapter_number` vào GraphQL response của `getChapter(uuid)`
2. Deploy route `/{slug}/chap-{N}` mới song song với route UUID cũ
3. Deploy middleware redirect 301
4. Sau 3–6 tháng (Google đã cập nhật index) mới xoá route UUID cũ
5. Cập nhật `sitemap-chapters.xml` dùng `chap-{N}` URLs

---

## 15. Các Gap Kỹ thuật Bổ sung

### 15.1. `lastmod` trong sitemap-comics.xml

Hiện tại sitemap-comics không có `lastmod`. Cần thêm để Googlebot biết ưu tiên crawl content mới:

```typescript
// sitemap-comics.xml.ts (sau khi thêm updatedAt vào GraphQL)
const urls = comics.map(c => ({
  loc: `${base}/${c.slug}`,
  changefreq: 'daily' as const,
  priority: '0.8',
  lastmod: c.updatedAt?.split('T')[0] ?? new Date().toISOString().split('T')[0],
}));
```

**Yêu cầu**: GraphQL `ComicView` type cần expose `updatedAt` field.

### 15.2. OG Image mặc định

`BaseHead.astro` đang dùng `'/blog-placeholder-1.jpg'` — tên file lộ rõ là Astro boilerplate.

**Kế hoạch**: 
- User cung cấp file branded OG image (1200×630px)
- Đặt tại `public/og-default.jpg`
- Update `BaseHead.astro`: `image = '/og-default.jpg'`

### 15.3. Alt text strategy cho images

**Pattern chuẩn**:

| Vị trí | Alt text template |
|--------|------------------|
| Comic cover trong `ComicCard` | `"{comic.title} - đọc truyện online"` |
| Chapter images trong reader | `"{comicTitle} - Chương {N} - Trang {index+1}"` ← **✅ Đã có** (L34 `[chapterId].astro`) |
| Category banner | `"Truyện {categoryName} - đọc online tại Commics"` |

**Hiện trạng**: Chapter reader đã có alt text tốt. `ComicCard.astro` cần kiểm tra.

### 15.4. Fix Google Fonts — Non-blocking Loading

**Vấn đề**: `BaseHead.astro` L48–50 dùng `<link rel="stylesheet">` thẳng → render-blocking → tăng LCP.

**Fix** (thêm vào plan):

```html
<!-- TRƯỚC (render-blocking) -->
<link href="https://fonts.googleapis.com/css2?family=Inter...&display=swap" rel="stylesheet" />

<!-- SAU (non-blocking) -->
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  onload="this.onload=null;this.rel='stylesheet'" />
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
</noscript>
```

### 15.5. Fix `twitter:url` bug trong BaseHead

`BaseHead.astro` L42: `twitter:url` dùng `Astro.url` (raw, có thể có trailing slash).  
Sửa thành `cleanCanonical` giống `og:url`:

```astro
<!-- Trước -->
<meta property="twitter:url" content={Astro.url} />
<!-- Sau -->
<meta property="twitter:url" content={cleanCanonical} />
```

---

## 16. Internal Linking Strategy

### 16.1. Mục tiêu

Tăng crawlability và PageRank flow giữa các trang liên quan, đặc biệt từ trang list → comic detail → chapter reader.

### 16.2. Internal linking map

```
Trang chủ /
├── → /truyen-hot          (header nav)
├── → /truyen-moi          (header nav)
├── → /the-loai            (header nav)
└── → /{slug}              (comic cards — keyword: title truyện)

/{slug} (Comic detail)
├── → /{slug}/chap-{N}     (chapter list — keyword: "Chương N")
├── → /the-loai/{category} (thể loại tags — keyword: tên thể loại)
└── → /{related-slug}      (Truyện cùng thể loại — NEW)

/{slug}/chap-{N} (Reader)
├── → /{slug}              ("Quay lại" — đã có)
├── → /{slug}/chap-{N+1}  ("Tiếp theo" — đã có)
└── → /{related-slug}      (Gợi ý đọc thêm cuối chapter — NEW)
```

### 16.3. Tính năng mới cần thêm: "Truyện cùng thể loại"

**Vị trí**: Cuối trang `/{slug}` (Comic detail), sau danh sách chapter.
**Query**: `getComics({ categoryId: comic.categories[0].id, first: 6, excludeId: comic.id })`
**HTML pattern**:

```astro
<section class="...">
  <h2>Truyện {primaryCategory.name} hay khác</h2>
  <div class="grid ...">
    {relatedComics.map(c => (
      <a href={`/${c.slug}`}>
        {/* keyword anchor = tên truyện */}
        <span>{c.title}</span>
      </a>
    ))}
  </div>
</section>
```

**Anchor text rule**: Luôn dùng **tên truyện** làm anchor text — không dùng "Click here", "Xem thêm".

### 16.4. Footer links (đã có trong Section 6.3, nhắc lại)

Footer là internal link quan trọng vì xuất hiện trên mọi trang — đảm bảo đầy đủ 8 links theo Section 6.3.

---

## 10. Sitemap Strategy

### 10.1. Kiến trúc hiện tại — Custom SSR Endpoints

> [!NOTE]
> **Quyết định: Giữ nguyên custom endpoints** — Phù hợp với kiến trúc SSR, không dùng `@astrojs/sitemap` integration.

**Lý do giữ custom endpoints:**
- Astro `@astrojs/sitemap` chỉ hoạt động tốt với static generation, không phù hợp SSR on-demand
- Custom endpoints cho phép fetch data từ API (GraphQL) tại runtime → sitemap luôn mới nhất
- Kiểm soát hoàn toàn `priority`, `changefreq`, `lastmod` theo từng loại content
- Cache riêng biệt cho từng sub-sitemap (chapters cũ hơn, comics mới hơn)

**Cấu trúc hiện tại:**

| File | Route | Nội dung | Cache |
|------|-------|----------|---------|
| `sitemap-index.xml.ts` | `/sitemap-index.xml` | Index trỏ đến 4 sub-sitemaps | 1h |
| `sitemap-page.xml.ts` | `/sitemap-page.xml` | Static pages (home, hot, search, category list) | 24h |
| `sitemap-categories.xml.ts` | `/sitemap-categories.xml` | Tất cả `/the-loai/{slug}` | 1h |
| `sitemap-comics.xml.ts` | `/sitemap-comics.xml` | Tất cả `/{slug}` | 1h |
| `sitemap-chapters.xml.ts` | `/sitemap-chapters.xml` | Tất cả `/{slug}/{chapterId}` | 1h |

---

### 10.2. Vấn đề hiện tại cần fix

#### a) `sitemap-page.xml` thiếu trang mới

Danh sách hiện tại chỉ có 4 trang. Cần bổ sung theo SDD Section 2:

```typescript
// HIỆN TẠI (thiếu)
const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/truyen-hot', priority: '0.8', changefreq: 'daily' },
    { path: '/tim-kiem', priority: '0.6', changefreq: 'weekly' },
    { path: '/the-loai', priority: '0.8', changefreq: 'weekly' },
];

// SAU KHI CẬP NHẬT
const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/truyen-hot', priority: '0.9', changefreq: 'daily' },
    { path: '/truyen-moi', priority: '0.9', changefreq: 'daily' },  // Trang mới
    { path: '/the-loai', priority: '0.8', changefreq: 'weekly' },
    { path: '/tim-kiem', priority: '0.6', changefreq: 'weekly' },
    { path: '/dieu-khoan', priority: '0.3', changefreq: 'monthly' },  // E-E-A-T
    { path: '/chinh-sach', priority: '0.3', changefreq: 'monthly' },  // E-E-A-T
    { path: '/lien-he', priority: '0.4', changefreq: 'monthly' },
    { path: '/cau-hoi-thuong-gap', priority: '0.5', changefreq: 'monthly' },
];
```

#### b) `sitemap-chapters.xml` dùng `chapter.id` thay vì URL chuẩn

Hiện tại tạo URL: `/{comic-slug}/{chapter.id}` — là UUID nội bộ, không thân thiện.
Sau khi approve đổi URL chapter (Section 3.2), cần cập nhật sang `/{comic-slug}/chap-{N}`.

> [!CAUTION]
> Chỉ cập nhật `sitemap-chapters.xml` **sau khi** hoàn thành redirect 301 URL chapter cũ. Nếu đổi sitemap trước khi redirect, Google sẽ nhận 404 từ sitemap.

---

### 10.3. Refactor — Shared XML Helper

Cả 4 sub-sitemaps lặp lại cùng pattern: build XML string + return `Response` với `Content-Type` header. Nên extract helper:

```typescript
// src/lib/sitemap/helpers.ts

interface SitemapUrl {
    loc: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: string;  // '0.0' → '1.0'
    lastmod?: string;   // YYYY-MM-DD
}

/**
 * Build XML urlset string từ danh sách URL
 */
export function buildSitemapXml(urls: SitemapUrl[]): string {
    const entries = urls.map(({ loc, changefreq, priority, lastmod }) => {
        const parts = [`    <loc>${loc}</loc>`];
        if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
        if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
        if (priority) parts.push(`    <priority>${priority}</priority>`);
        return `  <url>\n${parts.join('\n')}\n  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

/**
 * Tạo Response chuẩn cho sitemap với cache headers
 */
export function sitemapResponse(xml: string, maxAge = 3600): Response {
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=86400`,
        },
    });
}
```

**Sau refactor, mỗi sitemap file đơn giản hóa còn:**

```typescript
// sitemap-comics.xml.ts (sau refactor)
import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getComics } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse } from '../lib/sitemap/helpers';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');
    let comics = [];
    try { comics = await getComics({ first: 5000 }); } catch {}

    const urls = comics.map(c => ({
        loc: `${base}/${c.slug}`,
        changefreq: 'daily' as const,
        priority: '0.8',
    }));

    return sitemapResponse(buildSitemapXml(urls));
};
```

---

### 10.4. robots.txt — Kiểm tra tham chiếu Sitemap

Sau khi deploy, robots.txt cần có dòng:

```
Sitemap: https://commics.io/sitemap-index.xml
```

Cần kiểm tra file robots.txt hiện tại hoặc cấu hình Astro có snippet này chưa.

---

### 10.5. Checklist Sitemap (bổ sung vào Phase 1 & 3)

**Phase 1 — cùng với tạo trang mới:**
- [ ] Cập nhật `STATIC_PAGES` trong `sitemap-page.xml.ts` (thêm 5 trang mới)
- [ ] Kiểm tra/thêm `Sitemap:` directive trong `robots.txt`
- [ ] Refactor: tạo `src/lib/sitemap/helpers.ts` (`buildSitemapXml`, `sitemapResponse`)
- [ ] Refactor 4 sub-sitemap files dùng helper
- [ ] Submit `sitemap-index.xml` lên Google Search Console

**Phase 3 — sau khi đổi URL chapter:**
- [ ] Cập nhật `sitemap-chapters.xml.ts` dùng `chap-{N}` thay vì `chapter.id`
- [ ] Verify tất cả chapter URL trong sitemap trả về 200 (không phải redirect)

---

## Tham chiếu
- [[030-Specs/Spec-Frontend]]
- [[030-Specs/Spec-GraphQL]]
- [[035-Implementation/Frontend-Implementation]]
