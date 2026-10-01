# Nguồn dữ liệu và độ ưu tiên

## Nguồn chính
1. **Điều chỉnh đã được người dùng xác nhận mới nhất** và được ghi vào nguồn hiện hành.
2. `08A - Dữ liệu nhân sự` cho danh sách thành viên hiện tại.
3. `00 - Hiện hành` cho cơ cấu, tên đơn vị, trạng thái và quy tắc.
4. `08B - Dữ liệu nội bộ` chỉ để đối chiếu dữ liệu riêng/casting khi cần.

## Không được dùng làm source of truth
- database public cũ;
- dữ liệu hard-code trong UI;
- snapshot build;
- preview;
- dữ liệu casting chưa được xác nhận thành thành viên hiện tại.

## Quy tắc import
Import phải là một chiều:

`nguồn hiện hành → normalize → validate → public projection → UI`

UI không được tự trở thành nơi lưu dữ liệu gốc.
