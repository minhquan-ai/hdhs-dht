# Quy tắc public/private

## Whitelist public
Chỉ các trường sau được phép đi vào public projection:
- họ tên;
- lớp;
- đơn vị;
- nhóm chuyên môn;
- chức vụ / vai trò;
- trạng thái tổ chức khi phù hợp.

## Luôn private
- số điện thoại;
- ngày sinh;
- địa chỉ;
- email cá nhân nếu chưa có quyết định công khai;
- giới tính nếu không cần thiết;
- dữ liệu casting;
- danh sách không được duyệt;
- điểm/nhận xét casting;
- ghi chú nội bộ;
- dữ liệu quản trị;
- token / secret / credential.

## Nguyên tắc
Public data được tạo bằng **whitelist**. Nếu trường mới xuất hiện trong nguồn mà chưa được duyệt, mặc định là private.
