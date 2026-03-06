# 060-Crawl-Workflows: Targeted Crawling Operations

## 1. Goal
Execute targeted crawling to populate the database with diverse categories and clean data for testing GraphQL and Frontend. This ensures that when we start the UI work, we have a rich set of data covering all genres.

## 2. Oneshots for Quick Evaluation (20 Titles)
Recommended for initial crawler testing due to fast completion (1-2 chapters each).

| # | Comic Title | URL |
| :--- | :--- | :--- |
| 1 | Bunny ga Osuki to Kikimashite | /truyen/bunny-ga-osuki-to-kikimashite |
| 2 | The Vegan Gyaru Elf Craves Meat | /truyen/the-vegan-gyaru-elf-craves-meat |
| 3 | Người giúp việc giặt giũ | /truyen/nguoi-giup-viec-giat-giu/ |
| 4 | Tsuntsun Yuutousei wa Biyaku de Kairaku Ochi Suru | /truyen/tsuntsun-yuutousei-wa-biyaku-de-kairaku-ochi-suru/ |
| 5 | Bị chị gái người yêu quyến rũ | /truyen/bi-chi-gai-nguoi-yeu-quyen-ru/ |
| 6 | Tôi chỉ đang ngủ thôi mà! | /truyen/toi-chi-dang-ngu-thoi-ma/ |
| 7 | Cosplayer phức tạp | /truyen/cosplayer-phuc-tap/ |
| 8 | Succubus 3 Shimai no Shotagari | /truyen/succubus-3-shimai-no-shotagari/ |
| 9 | Cô gái cạnh tôi quá dâm đãng | /truyen/co-gai-canh-toi-qua-dam-dang |
| 10 | Võ sĩ VS Bác sĩ trị liệu tình dục | /truyen/vo-si-vs-bac-si-tri-lieu-tinh-duc/ |
| 11 | Căn cứ bí mật của chúng tôi | /truyen/can-cu-bi-mat-cua-chung-toi/ |
| 12 | Piece of cake | /truyen/piece-of-cake/ |
| 13 | Kinpatsu Bakunyuu Yome to Ama Yadori Suru Dake no Hanashi | /truyen/kinpatsu-bakunyuu-yome-to-ama-yadori-suru-dake-no-hanashi/ |
| 14 | Iraira Enanan no Ecchi na Nadamekata | /truyen/iraira-enanan-no-ecchi-na-nadamekata/ |
| 15 | Hãy ước lên bộ ngực này | /truyen/hay-uoc-len-bo-nguc-nay/ |
| 16 | Em hứa sẽ giữ bí mật | /truyen/em-hua-se-giu-bi-mat/ |
| 17 | Ba nguyên tắc cho em gái | /truyen/ba-nguyen-tac-cho-em-gai/ |
| 18 | Korean Trip | /truyen/korean-trip/ |
| 19 | Shinseki Midara My Home Harem | /truyen/shinseki-midara-my-home-harem/ |
| 20 | Iku-san to Onsen de Ichaicha Shitai | /truyen/iku-san-to-onsen-de-ichaicha-shitai/ |

## 3. Targeted Crawl List (30 Categories)
2 titles per category to ensure category coverage and test multi-tag logic.

| Category | Title 1 | URL 1 | Title 2 | URL 2 |
| :--- | :--- | :--- | :--- | :--- |
| **Vếu to** | Toi, Seitsuu Mae ... | /truyen/toi-seitsuu-mae-no-namaikina-kuso-gaki-oo-manko-zuke-ni-shitara-dou-naruka-kotae-yo | Ryuukinza no Yoru | /truyen/ryuukinza-no-yoru |
| **Ahegao** | Toi, Seitsuu Mae ... | /truyen/toi-seitsuu-mae-no-namaikina-kuso-gaki-oo-manko-zuke-ni-shitara-dou-naruka-kotae-yo | Ryuukinza no Yoru | /truyen/ryuukinza-no-yoru |
| **Truyện ngắn** | Nhìn trộm qua cái lỗ ... | /truyen/nhin-trom-qua-cai-lo-tren-tuong | Iku-san to Onsen ... | /truyen/iku-san-to-onsen-de-ichaicha-shitai |
| **Không che** | Nhìn trộm qua cái lỗ ... | /truyen/nhin-trom-qua-cai-lo-tren-tuong | Tình yêu méo mó ... | /truyen/tinh-yeu-meo-mo-voi-dong-nghiep |
| **MILFs** | Nhìn trộm qua cái lỗ ... | /truyen/nhin-trom-qua-cai-lo-tren-tuong | Kinjo no Hitozuma-san ... | /truyen/kinjo-no-hitozuma-san-musuko-no-otomodachi |
| **School Uniform**| Toi, Seitsuu Mae ... | /truyen/toi-seitsuu-mae-no-namaikina-kuso-gaki-oo-manko-zuke-ni-shitara-dou-naruka-kotae-yo | Cô nàng thinh lặng | /truyen/co-nang-thinh-lang |
| **Stockings** | Trò thôi miên ... | /truyen/tro-thoi-mien-cua-lao-sep-gia-voi-nu-nhan-vien | The Vegan Gyaru ... | /truyen/the-vegan-gyaru-elf-craves-meat |
| **Nhóm** | Bunny ga Osuki ... | /truyen/bunny-ga-osuki-to-kikimashite | The Vegan Gyaru ... | /truyen/the-vegan-gyaru-elf-craves-meat |
| **Truyện dài** | Tình yêu méo mó ... | /truyen/tinh-yeu-meo-mo-voi-dong-nghiep | Kinjo no Hitozuma-san ... | /truyen/kinjo-no-hitozuma-san-musuko-no-otomodachi |
| **Paizuri** | Toi, Seitsuu Mae ... | /truyen/toi-seitsuu-mae-no-namaikina-kuso-gaki-oo-manko-zuke-ni-shitara-dou-naruka-kotae-yo | Iku-san to Onsen ... | /truyen/iku-san-to-onsen-de-ichaicha-shitai |
| **NTR** | Trò thôi miên ... | /truyen/tro-thoi-mien-cua-lao-sep-gia-voi-nu-nhan-vien | Bị chị gái người yêu ... | /truyen/bi-chi-gai-nguoi-yeu-quyen-ru |
| **Cheating** | Nhìn trộm qua cái lỗ ... | /truyen/nhin-trom-qua-cai-lo-tren-tuong | Kinjo no Hitozuma-san ... | /truyen/kinjo-no-hitozuma-san-musuko-no-otomodachi |
| **Truyện ngọt** | Chỉ dẫn lính mới ... | /truyen/chi-dan-linh-moi-tan-tinh | Em gái hàng xóm ... | /truyen/em-gai-hang-xom-cu-ren-ri-suot |
| **Gia đình** | Iraira Enanan ... | /truyen/iraira-enanan-no-ecchi-na-nadamekata | Shinseki Midara My Home | /truyen/shinseki-midara-my-home-harem |
| **Housewife** | Kinjo no Hitozuma-san | /truyen/kinjo-no-hitozuma-san-musuko-no-otomodachi | Tôi chỉ đang ngủ ... | /truyen/toi-chi-dang-ngu-thoi-ma |
| **Mông to** | Toi, Seitsuu Mae ... | /truyen/toi-seitsuu-mae-no-namaikina-kuso-gaki-oo-manko-zuke-ni-shitara-dou-naruka-kotae-yo | Cô nàng thinh lặng | /truyen/co-nang-thinh-lang |
| **Đeo kính** | Trò thôi miên ... | /truyen/tro-thoi-mien-cua-lao-sep-gia-voi-nu-nhan-vien | Cô nàng thinh lặng | /truyen/co-nang-thinh-lang |
| **Vét máng** | Nhìn trộm qua cái lỗ ... | /truyen/nhin-trom-qua-cai-lo-tren-tuong | Tình yêu méo mó ... | /truyen/tinh-yeu-meo-mo-voi-dong-nghiep |
| **Truyện Màu** | Trò thôi miên ... | /truyen/tro-thoi-mien-cua-lao-sep-gia-voi-nu-nhan-vien | Kinjo no Hitozuma-san ... | /truyen/kinjo-no-hitozuma-san-musuko-no-otomodachi |
| **Hấp diêm** | Toi, Seitsuu Mae ... | /truyen/toi-seitsuu-mae-no-namaikina-kuso-gaki-oo-manko-zuke-ni-shitara-dou-naruka-kotae-yo | Cô nàng thinh lặng | /truyen/co-nang-thinh-lang |
| **Lỗ nhị** | Căn cứ bí mật ... | /truyen/can-cu-bi-mat-cua-chung-toi | Senpai-tachi to no ... | /truyen/senpai-tachi-to-no-gakuen-seikatsu |
| **Shotacon** | Succubus 3 Shimai ... | /truyen/succubus-3-shimai-no-shotagari | Chị gái mềm mại ... | /truyen/chi-gai-mem-mai-va-am-ap |
| **Defloration** | Cô nàng thinh lặng | /truyen/co-nang-thinh-lang | Shinseki Midara My Home | /truyen/shinseki-midara-my-home-harem |
| **Sex Toys** | Trò thôi miên ... | /truyen/tro-thoi-mien-cua-lao-sep-gia-voi-nu-nhan-vien | Cosplayer phức tạp | /truyen/cosplayer-phuc-tap |
| **Thủ dâm** | Nhìn trộm qua cái lỗ ... | /truyen/nhin-trom-qua-cai-lo-tren-tuong | The Vegan Gyaru ... | /truyen/the-vegan-gyaru-elf-craves-meat |
| **Giáo viên** | Kurashiki-sensei ... | /truyen/kurashiki-sensei-is-in-heat | Kyousei Shidou ... | /truyen/kyousei-shidou-mechakucha-ni-kegasarete |
| **Swimsuit** | Cosplayer phức tạp | /truyen/cosplayer-phuc-tap | Mẹ là đồ chơi của tôi | /truyen/me-la-do-choi-cua-toi |
| **Doujinshi** | Ryuukinza no Yoru | /truyen/ryuukinza-no-yoru | Iku-san to Onsen ... | /truyen/iku-san-to-onsen-de-ichaicha-shitai |
| **Virgins** | Cô nàng thinh lặng | /truyen/co-nang-thinh-lang | Succubus 3 Shimai ... | /truyen/succubus-3-shimai-no-shotagari |
| **Mẹ con** | Bị tai nạn tôi bị ... | /truyen/bi-tai-nan-toi-bi-bien-thanh-mot-thang-nhoc | Mẹ là đồ chơi của tôi | /truyen/me-la-do-choi-cua-toi |

## 4. Execution Workflow (Manual Target)
To crawl a specific comic:
1. Ensure the crawler system is running (Temporal, DB, Redis).
2. Execute the trigger script with the specific URL:
   ```bash
   # From root directory
   ./scripts/run_crawler.sh https://hentaivn.ch/truyen/<SLUG>/
   ```
   *(Note: Ensure correct path to your crawler entry point)*

## 5. Normalized Category IDs
Ref: `src/backend/crawler/utils/category_mapper.py`
The system now automatically maps variant names (e.g., "Ngoại tình" -> "Cheating") and standardizes IDs (e.g., "Gia đình" -> `gia-dinh`).
