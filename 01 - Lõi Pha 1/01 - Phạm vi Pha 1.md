# Pha 1 — Sơ đồ + nhân sự

## Mục tiêu

Cho học sinh và người xem một nơi dễ hiểu để xem cơ cấu HĐHS và tìm người theo đơn vị/vai trò, dựa trên dữ liệu nguồn đã được xác nhận.

## Use case

1. **Khách xem cơ cấu:** mở sơ đồ, đi từ trường đến đơn vị, xem chức danh và người đã có phân công.
2. **Khách tìm người:** tìm theo tên/lớp, lọc theo đơn vị, lớp hoặc chức danh; mở các liên kết phân công của cùng một người.
3. **Chủ quản lý thay đổi:** đăng nhập GitHub được cấp quyền, tạo/sửa hồ sơ hoặc phân công thành bản nháp, gỡ một phân công, xem lại hoặc bỏ nháp.
4. **Chủ cập nhật dữ liệu:** đối chiếu nháp với nguồn chuẩn trong `05 - Ứng dụng MVP/app/database`, sửa nguồn, kiểm tra rồi xuất lại bản public.

## Phần bàn giao

- Sơ đồ phân cấp có điều hướng, đường dẫn quay lại và liên kết sang danh bạ.
- Danh bạ riêng, một hồ sơ/người, nhiều phân công, tìm kiếm tên/lớp và lọc đơn vị/lớp/chức danh.
- Admin chỉ cho chủ; nháp không thay đổi CSV hay dữ liệu public; gỡ phân công không xóa hồ sơ.
- Xuất public bằng whitelist, kiểm tra ID/tham chiếu/PII, giao diện responsive và hỗ trợ bàn phím.

## Quy tắc dữ liệu và quyền

- Một người có thể có nhiều phân công nhưng chỉ có một ID/hồ sơ.
- Đơn vị và vai trò là hai thực thể riêng; phân công phải trỏ đúng người, đơn vị và chức danh.
- BGH, Đoàn trường và HĐHS được hiển thị đúng quan hệ; HĐHS không quản lý BGH hoặc Đoàn trường.
- Chỉ dữ liệu cho phép mới được xuất; casting, điện thoại, ngày sinh, email cá nhân, giới tính, địa chỉ, ghi chú và bí mật ở ngoài bản public.
- Người không có phân công công khai không xuất hiện trong danh bạ.
- Trang public chỉ đọc bản đã xuất. Admin lưu nháp; chủ cập nhật nguồn sau khi đối chiếu.

## Chưa thuộc Pha 1

Workflow giao việc, tài liệu nội bộ, AI, chat, lịch, quyền cộng tác viên và mạng lưới đại diện 41 lớp. Pha 1 chỉ có khách xem và chủ quản trị; không tự cấp thêm quyền hoặc chức vụ.
