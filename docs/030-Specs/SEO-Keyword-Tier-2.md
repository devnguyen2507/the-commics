# Implementation Plan - Tier 2 SEO Optimization (Category Pages)

Aim to target Genre Keywords (Tier 2) effectively on category pages by utilizing dynamic Title, Meta Description, and H1/H2 tagging in `the-loai/[slug].astro`.

## Proposed Changes

### [MODIFY] [schema.ts](file:///Users/user/njayson/commics/src/ui/src/lib/utils/schema.ts)
*   No structural changes needed for `generateCollectionSchema` as it already accepts `title` and `description` which I will calculate dynamically on the page level and pass.

### [MODIFY] [the-loai/[slug].astro](file:///Users/user/njayson/commics/src/ui/src/pages/the-loai/[slug].astro)
*   **Create Title Mappings:** Introduce a mapping function or object to associate standard backend category names with highly optimized SEO Template variables from `Specs-SEO-Keyword.md`:
    *   *NTR*: Dùng keyword `truyện ntr 18+`, `manhwa ntr vietsub`
    *   *Harem*: Dùng keyword `truyện harem 18+`, `manhwa harem không che`
    *   *Học đường*: Dùng `truyện học đường 18+`, `hentai học sinh`
    *   *MILF*: Dùng `truyện milf`, `manhwa milf tiếng việt`
    *   *Incest*: Dùng `truyện incest 18+`
    *   *Hàn Quốc*: Dùng `truyện 18+ hàn quốc`, `manhwa trưởng thành`
    *   *Doujinshi*: Dùng `doujinshi vietsub`, `đọc doujinshi tiếng việt`
    *   *Yaoi*: Dùng `manhwa yaoi 18+`
    *   *Yuri*: Dùng `truyện yuri không che`, `manhwa yuri 18+`
    *   *Fantasy*: Dùng `manhwa fantasy 18+`, `truyện isekai 18+`
    *   *Vanilla*: Dùng `manhwa vanilla 18+`, `truyện ngọt ngào 18+`
*   **Dynamic Title Tag:** Switch from `Truyện {targetCategoryName} - Đọc online tại {env.SITE_NAME}` to `Đọc Truyện {Tên Thể Loại} 18+ Hay Nhất | FanManga`.
*   **Dynamic Description:** Switch to `Danh sách truyện tranh {Tên Thể Loại} 18+ manhwa, doujinshi vietsub mới nhất, cập nhật liên tục bản đẹp không che tại FanManga.`
*   **H1 heading update:** Check that the H1 matches the category search intent. E.g `Truyện {targetCategoryName} 18+`.
*   **H2 updates:** Update the generic `Tìm hiểu về thể loại {targetCategoryName}` to a more robust LSI heading format.

## Verification Plan
1. Visit a known slug (e.g., `/the-loai/ntr`) and verify the `<title>`, `<meta name="description">` match the Tier 2 template.
2. Verify the `JSON-LD` (CollectionPage schema) has the newly populated title and desc properties.
3. Validate that H1 and H2 contain the mapped LSI keywords.
