# Pha 1 - kiểm tra và triển khai

Cập nhật: 27/09/2026.

## Nguồn dữ liệu

Nguồn chuẩn là sáu CSV trong `05 - Ứng dụng MVP/app/database`. Thư mục `09/database` chỉ là bản công khai đã lọc trường. Không đưa dữ liệu casting, số điện thoại, ngày sinh, email, giới tính, địa chỉ hoặc ghi chú nội bộ sang public.

## Quy trình an toàn

1. Sửa dữ liệu ở nguồn chuẩn `05`.
2. Chạy `python3 tools/hdhs_validate.py` tại thư mục dự án.
3. Chạy `python3 tools/hdhs_prepare_public.py`. Mặc định lệnh này chỉ đồng bộ database, không ghi đè giao diện public.
4. Trong repo `09`, chạy `npm test`.
5. Chạy local server và kiểm tra sơ đồ, `/people/`, `/admin/` trên desktop và mobile.
6. Chỉ deploy preview sau khi các kiểm tra trên đạt. Không dùng `--prod` khi chưa có gate riêng.
7. Sau khi đối chiếu preview, commit đúng các file đã review rồi mới cân nhắc production.

Chỉ dùng `python3 tools/hdhs_prepare_public.py --sync-assets` khi đã chủ động review và muốn đồng bộ năm asset lõi từ app nguồn. Cờ này tồn tại để tránh chuyện một lệnh xuất dữ liệu vô tình đè giao diện đang phát triển, loại tai nạn rất đúng chất phần mềm nếu không chặn trước.

## Quy tắc bản nháp admin

Admin chỉ lưu nháp. API bắt buộc phiên chủ sở hữu và kiểm tra same-origin với thao tác ghi. Một hồ sơ người có thể có nhiều phân công. Gỡ phân công không xóa cứng người. Nháp sửa dùng revision để chặn ghi đè khi một tab khác đã thay đổi.

## Gate Pha 1

Pha 1 chỉ được xem là đủ nền khi: schema public không lệch, quan hệ ID hợp lệ, privacy smoke đạt, route/syntax smoke đạt, sơ đồ và danh bạ không tràn ngang trên mobile, admin không cho dữ liệu casting trở thành phân công public, và preview đã được kiểm tra trước production.
