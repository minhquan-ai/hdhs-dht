# SƠ ĐỒ HĐHS DHT - BẢN NHÁP CẤU TRÚC

## Mục đích

Phần mềm hiện chỉ dùng để trực quan hóa cơ cấu ngoài đời.

Không dùng bản này để quyết định cơ cấu. Cơ cấu đời thực là nguồn chính; phần mềm chỉ phản ánh lại dữ liệu đã thống nhất.

## Dữ liệu

Web không lưu tên người hay cơ cấu trong mã giao diện.

Nguồn dữ liệu nằm tại thư mục:

- database/units.csv
- database/subunits.csv
- database/academic_teams.csv
- database/roles.csv
- database/people.csv
- database/assignments.csv

Các file CSV có thể mở và chỉnh bằng Excel hoặc Numbers.

## Quy tắc

- units/subunits/academic_teams: các đơn vị trong cây.
- roles: chức danh.
- people: thông tin con người.
- assignments: gán một người vào đơn vị/chức danh.
- Thành viên đang casting có thể dùng status = "Đang casting".
- Thành viên chính thức dùng status = "Chính thức".

## Cách hiển thị

HĐHS → đơn vị → nhóm con → chức danh → thành viên.

Khi dữ liệu CSV thay đổi, reload trang để xem dữ liệu mới.

## Tên ban hiện tại

- Ban Đại diện Học sinh
- Ban Hoạt động & Sự kiện
- Ban Truyền thông
- Ban Thông tin & Hệ thống
- Ban Hậu cần
- Ban Giám sát

Ngoài ra có:
- Ban Thường trực
- Đại hội Đại diện Học sinh
- Hội đồng CLB
- Hội đồng Học thuật

## Giai đoạn hiện tại

Đây là bản nháp. Phần mềm sẽ được xây lại sau khi cơ cấu ngoài đời được kiểm chứng và ổn định.
