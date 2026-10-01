# Mô hình dữ liệu lõi

## Unit
Đơn vị trong cây tổ chức.

Trường tối thiểu:
- `id`
- `name`
- `kind`
- `parent_id` (có thể rỗng ở root)
- `status`
- `sort_order`

## Person
Một con người duy nhất.

Trường public tối thiểu:
- `id`
- `name`
- `class_name`

Thông tin riêng như SĐT, ngày sinh, giới tính, ghi chú casting không nằm trong public projection.

## Role
Tên chức vụ hoặc vai trò chuẩn hóa.

Trường:
- `id`
- `unit_id`
- `title`
- `sort_order`

## Assignment
Quan hệ nhiều-nhiều giữa Person và Unit/Role.

Trường:
- `id`
- `person_id`
- `unit_id`
- `role_id` hoặc `role_label`
- `status`
- `sort_order`

## Invariant
- `Person.id`, `Unit.id`, `Role.id`, `Assignment.id` phải duy nhất.
- Một người xuất hiện nhiều đơn vị vẫn dùng cùng `person_id`.
- Assignment không được trỏ tới person/unit không tồn tại.
- `role_id` nếu có phải tồn tại.
- Cây đơn vị không được có vòng lặp.
- Public projection không chứa PII nội bộ.
