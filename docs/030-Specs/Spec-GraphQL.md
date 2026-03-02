---
id: Spec-004
type: technical-spec
status: draft
project: commics
owner: "DevNguyen"
tags: [graphql, rust, api]
created: 2026-03-01
updated: 2026-03-01
linked-to: [[020-Requirements/PRD-GraphQL]]
---

# Spec: Hệ thống GraphQL API Layer

Tài liệu này chi tiết hóa kiến trúc xử lý của hệ thống API GraphQL (viết bằng Rust) đóng vai trò cổng kết nối duy nhất giữa Frontend và Backend, cung cấp khả năng đa truy vấn với tốc độ xử lý hàng loạt, đáp ứng chặt chẽ các yêu cầu render tĩnh (SSR) và động (Lazy-load) của Frontend.

## 1. Hiện trạng & Yêu cầu Hỗ trợ Frontend

Hệ thống được thiết kế để chịu tải lớn và trả về đúng định dạng dữ liệu (Schema) phục vụ triệt để các bố cục và chiến lược SEO của Frontend Astro.

### 1.1. Mục tiêu Tương thích với 3 Màn hình chính
API Layer cần cung cấp các Queries riêng biệt tối ưu cho từng loại màn hình:
1. **Trang Danh sách (List Pages)**:
   - Hỗ trợ tham số **Phân trang (Pagination)** chuẩn (VD: offset/limit hoặc cursor-based) để UI có thể lazy-load load more / chuyển trang.
   - Hỗ trợ filter/sort linh hoạt (Trending, Latest, theo Category).
2. **Trang Chi tiết Truyện (Comic Detail)**:
   - Cung cấp dữ liệu Metadata đầy đủ bao gồm title, description, views, rating_score, rating_count (để FE render SSR SEO Box).
   - Truy vấn lồng (Nested query) trả về **Breadcrumbs path** tĩnh (Ví dụ: `[{ id, name, type }]`).
   - Cung cấp danh sách `related_comics` (Truyện recommend).
3. **Trang Đọc Truyện (Chapter Page)**:
   - Truy vấn danh sách ảnh đã được lắp ráp sẵn (pre-assembled) bao gồm URL CDN hoàn chỉnh, `w` (width) và `h` (height) từ Redis Cache (được hệ thống đồng bộ từ bảng `assets` và `chapters`).
   - Cung cấp data liên kết điều hướng: `next_chapter_id` và `prev_chapter_id` cho thanh công cụ Reader.

---

## 2. Quy trình Truy vấn & Pattern Adapter (Frontend Client Flow)

Để đảm bảo code dễ quản lý, trace bug và tách biệt logic dữ liệu với giao diện, hệ thống áp dụng quy trình "Lib -> Adapter -> View" dựa trên source mẫu `p1`.

### 2.1. Sơ đồ luồng dữ liệu (Data Flow Diagram)

```mermaid
graph LR
    subgraph Client [Frontend Astro]
        View[Astro Component / View]
        Adapter[Adapter Layer: Mapping]
        GQL_Lib[GraphQL Client Lib: generated.ts]
    end
    
    subgraph Server [Backend Rust]
        GQL_Server[Async-graphql Server]
        DB[(PostgreSQL)]
    end

    View -->|Yêu cầu data| Adapter
    Adapter -->|Call Function| GQL_Lib
    GQL_Lib -->|Query/Mutation| GQL_Server
    GQL_Server -->|SQL| DB
    
    DB --> GQL_Server
    GQL_Server -->|Raw JSON Data| GQL_Lib
    GQL_Lib -->|Raw Types| Adapter
    Adapter -->|Mapped View Model| View
```

### 2.2. Chi tiết các thành phần

1.  **GraphQL Lib & Codegen**:
    - Sử dụng `@graphql-codegen/cli` để tự động sinh ra file `generated.ts`.
    - Định nghĩa các query trong file `.graphql` chuyên biệt (Ví dụ: `src/lib/api/commics/queries.graphql`).
    - **Lưu ý**: Không tự viết type thủ công cho response, luôn dùng type từ `generated.ts`.

2.  **Adapter Layer (Mapping)**:
    - Nhiệm vụ: Chuyển đổi (Map) dữ liệu thô từ GraphQL sang Interface mà Component cần.
    - Giúp xử lý các giá trị `null`, format ngày tháng, hoặc lắp ghép URL CDN trước khi đưa ra View.
    - **Trace Bug**: Khi dữ liệu hiển thị sai, chỉ cần kiểm tra Adapter thay vì lục lọi trong từng Component.

3.  **View (Astro Components)**:
    - Chỉ nhận dữ liệu đã được "làm sạch" từ Adapter.
    - Không chứa logic xử lý data thô hay parse JSON.

---

## 3. Giải pháp Kỹ thuật (Proposed Solution)

### 3.1. Rust GraphQL Framework (Juniper / Async-graphql)
Sử dụng source mẫu sẵn có, tinh gọn lại các modules thừa và tập trung vào `async-graphql`. 

1. **Resolver Tối ưu (Chống N+1)**:
   - Sử dụng kĩ thuật DataLoader (Dataloader Pattern) để gom batch các truy vấn. Khi FE query danh sách truyện ở Home + Pagination kèm theo Tags/Categories, API không bị dính N+1 call xuống DB.
   
2. **Hỗ trợ SEO và Breadcrumbs**:
   - Viết các Query riêng trả về cây danh mục tĩnh để Frontend gọi ở phase SSR build breadcrumbs. Thông qua một call GraphQL, FE nhận đủ data để đắp vào `<title>`, `<h1>`, và meta tags.

### 3.2. Server-side Ordering & Navigation
Bắt buộc Rust GraphQL API phải nhận trách nhiệm Sort và tính toán Navigation thay thế Client.
- **Order Indexing**: API trích dán parameter `order_by` thẳng vào truy vấn Postgres `ORDER BY order_index ASC`. Tránh tình trạng Client tự sort mảng khổng lồ gây crash RAM.
- **Next/Prev Resolver**: Trong chapter query, API tự động look-up chapter có `order_index` kề cạnh để gắn vào field `next_chapter` và `prev_chapter`. Frontend chỉ việc bốc route ID quăng vào thẻ `<a>`.

### 3.3. Lớp Caching Tích hợp (Tối Ưu Hybrid)
Bỏ qua mô hình Redis Cluster truyền thống có overhead cao, áp dụng kiến trúc **Hybrid Cache (Memory Map + Redis Standalone)**:
- **Tầng 1 (LRU Cache Rust)**: Dùng cho các list Query Hot, tĩnh, size nhỏ (Categories, Top 10 Comic). Phải gài chuẩn Crate **Least Recently Used (LRU)** Limit Size (Ví dụ 5.000 records đổ lại) thay vì HashMap thô. Nhanh TTL, Ngăn triệt để rò rỉ RAM OOM.
- **Tầng 2 (Redis Standalone)**: Dùng cho các Query Data khổng lồ hoặc List Chapters lấy từ DB và Dataloader trả lên. Mọi request cho Chapter Images (mảng ảnh đọc chap) sẽ ping vô Redis:
   - Nếu Redis Hit -> Trả ngay dạng Vector Object Array `[{"url":"cdn.imgflux.com/.../001.jpg", "w":800, "h":1200}]` trong < 5ms. (Dữ liệu này được Worker Pre-compute từ bảng `assets` và `chapters` để tránh thao tác JOIN đắt đỏ lúc query).
   - Frontend nhận mảng ảnh đã có thông số w/h tự động Render giao diện chống CLS (Cumulative Layout Shift).

### 3.4. Ràng Ngoại Cấu Trúc (Diesel Auto-gen)
- Schema DB Map trong Rust Server được bảo mật bằng Diesel. Source gốc `api-aggregator/db` file `schema.rs` phải do Rust Migration Auto-generate, **tuyệt đối Code System không viết nối tay** dễ gây lệch pha Model Map lúc Query Database.

---

### 3.5. Chi tiết GraphQL Schema (API Definition)

Để hỗ trợ Frontend Astro phát triển song song, các Queries được định nghĩa cụ thể như sau:

#### Types & Objects
```graphql
type Comic {
  id: ID!
  slug: String!
  title: String!
  alternative_titles: [String]
  author: String
  status: String
  description: String
  rating_score: Float
  rating_count: Int
  view_count: Int
  cover_image: String
  categories: [Category]
  chapters: [Chapter]
  created_at: String
}

type Category {
  id: ID!
  name: String!
  slug: String!
}

type Chapter {
  id: ID!
  chapter_number: String!
  order_index: Float!
  images: [ChapterImage]
  next_chapter_id: ID
  prev_chapter_id: ID
  created_at: String
}

type ChapterImage {
  url: String!
  w: Int!
  h: Int!
}
```

#### Queries
```graphql
type Query {
  # Trang Danh sách (Home/Category/Search)
  # Sử dụng Relay Connection pattern cho Pagination
  comics(
    first: Int, 
    after: String, 
    filter: ComicFilterInput, 
    sort: ComicSortInput
  ): ComicConnection!

  # Trang Chi tiết Truyện
  comic(slug: String!): Comic
  
  # Trang Đọc Truyện
  chapter(id: ID!): Chapter

  # Hỗ trợ Breadcrumbs & Navigation
  categories: [Category!]!
}

input ComicFilterInput {
  category_slug: String
  search_query: String
  status: String
}

enum ComicSortInput {
  LATEST
  MOST_VIEWED
  RATING
  TITLE_ASC
}
```

---

## 4. Kiến nghị triển khai

- **GraphQL Schema Definition**: Xây dựng Schema file-based (`schema.graphql`) cung cấp Connection types hỗ trợ chuẩn Relay Pagination/Cursor-based nếu danh sách truyện quá lớn. Bỏ qua hoàn toàn chiến lược Offset/Limit dễ sập băng thông (Full-Scan DB). Bắt buộc Cursor List API.
- **Connection Pool**: Sử dụng `bb8` hoặc `deadpool` cho Postgres/Redis trong Rust để giữ Pool luôn Warm, đảm bảo Time-To-First-Byte (TTFB) siêu thấp cho khâu SSR của Frontend.

---

## 5. Gaps & Post-Implementation Notes (Lưu ý về các Khoảng cách Triển khai)

Tính đến ngày **2026-03-02**, quá trình triển khai thực tế có một số khác biệt so với Spec ban đầu cần được lưu ý để Frontend phối hợp:

### 5.1. Pagination (Phân trang)
- **Hiện trạng**: Sử dụng `first` (limit) và `after` (offset dạng chuỗi). 
- **Gap**: Chưa triển khai chuẩn **Relay Connection** (`edges`, `node`, `pageInfo`, `cursor`). Hệ thống đang trả về mảng trực tiếp `[Comic]`.
- **Kế hoạch**: Sẽ nâng cấp lên chuẩn Connection khi dữ liệu vượt ngưỡng 10.000 records để tối ưu SEO và Load-more.

### 5.2. Breadcrumbs & Navigation
- **Hiện trạng**: Từng `Chapter` có trường `comic` để lấy metadata của truyện cha.
- **Gap**: Thiếu Query `breadcrumbs` chuyên dụng trả về mảng cây danh mục tĩnh lồng nhau để render chính xác SEO Breadcrumbs mà không cần nhiều vòng query.
- **Giải pháp tạm thời**: Frontend sử dụng `comic { categories }` từ Chapter response để xây dựng Breadcrumbs thủ công.

### 5.3. Missing Fields (Các trường bị thiếu)
Một số trường trong Spec hiện chưa được Resolver hỗ trợ (trả về null hoặc chưa map):
- `Comic.alternative_titles`: Do crawler chưa trích xuất đủ hoặc chưa đồng bộ schema.
- `Comic.created_at` & `Chapter.created_at`: Đã có trong DB nhưng chưa được expose ra GraphQL Layer.

### 5.4. Lớp Caching
- **Lưu ý**: L1 Cache (Moka) đang có TTL rất ngắn (60s) để đảm bảo tính thời gian thực. Đối với mảng ảnh ChapterImages, dữ liệu được ưu tiên đọc từ L2 (Redis) để tránh áp lực `Jsonb` parse liên tục.

## Tham chiếu
- [[020-Requirements/PRD-GraphQL]]
- [[030-Specs/Spec-Frontend]]
- [[030-Specs/Spec-Database]]
