# Pha 1 — phạm vi lõi

## Mục tiêu
Pha 1 chỉ giải quyết hai bài toán:
1. **Cơ cấu tổ chức**: biết đơn vị nào tồn tại, thuộc đâu, trạng thái gì.
2. **Danh bạ nhân sự**: biết một người là ai trong phạm vi công khai, thuộc đơn vị nào và giữ vai trò gì.

## Chưa làm
- giao diện đẹp;
- Three.js / Kage / animation;
- đăng nhập / admin;
- workflow phê duyệt;
- AI;
- lịch / sự kiện;
- chat;
- deploy production.

## Điều kiện để sang UI
Core phải trả lời ổn định:
- Một người có thể có nhiều vai trò nhưng chỉ có một hồ sơ.
- Một đơn vị có thể có đơn vị con.
- Phân biệt rõ BGH, Đoàn trường và HĐHS; HĐHS không quản lý BGH/Đoàn trường.
- Dữ liệu public được tạo bằng whitelist, không phải blacklist.
- Có thể kiểm tra duplicate, orphan assignment, ID trùng và dữ liệu nhạy cảm trước khi build UI.
