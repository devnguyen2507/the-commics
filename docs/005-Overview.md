# 005-Tổng quan dự án: Commics

## Mục tiêu dự án
Dự án **Commics** tập trung vào việc xây dựng hệ thống tự động thu thập (crawling) nội dung truyện tranh và truyện chữ từ nhiều nguồn trên internet, sau đó cung cấp giao diện đọc truyện tối ưu cho người dùng.

## Định hướng SEO
Dự án đặc biệt chú trọng vào việc tối ưu hóa SEO cho các từ khóa ngách:
- Truyện tranh/truyện chữ theo thể loại: Hentai, Cô giáo, Ngoại tình, Ăn mẹ trước (Step-mother/NTR scenarios), v.v.
- Tối ưu hóa Categories và Tags để bao phủ tối đa các từ khóa tìm kiếm.
- Tự động tạo Site maps và SEO-friendly URL cho từng Chapter.

## Phạm vi hệ thống
Hệ thống bao gồm các module chính:
1. **Survey & Design**: Nghiên cứu thị trường và thiết kế UI/UX (Mobile First).
2. **Database**: Lưu trữ dữ liệu truyện, chapter và cache.
3. **Crawler**: Hệ thống worker tự động thu thập dữ liệu (Temporal).
4. **GraphQL Service**: API layer cung cấp dữ liệu cho FE.
5. **CDN (imgflux)**: Xử lý và phân phối hình ảnh tối ưu.
6. **Frontend (Astro)**: Web app hiệu năng cao, tối ưu SEO.

_Được tạo bởi DevNguyen_
