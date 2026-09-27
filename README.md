# SƠ ĐỒ HĐHS DHT - BẢN NHÁP CẤU TRÚC

## Mục đích

Pha 1 web hiển thị sơ đồ cơ cấu và một trang Danh bạ nhân sự riêng. Khu vực quản trị chủ sở hữu hỗ trợ tạo/sửa nháp hồ sơ người và phân công, hoặc gỡ phân công.

Không dùng bản này để quyết định cơ cấu. Cơ cấu đời thực là nguồn chính; phần mềm chỉ phản ánh dữ liệu đã được thống nhất.

## Dữ liệu

Nguồn dữ liệu kỹ thuật nằm trong thư mục `database/`:

- `units.csv`
- `subunits.csv`
- `academic_teams.csv`
- `roles.csv`
- `people.csv`
- `assignments.csv`

Tên file kỹ thuật được giữ ổn định để ứng dụng hoạt động. Tên đơn vị và nội dung hiển thị dùng tiếng Việt theo cơ cấu hiện hành.

## Cơ cấu hiện hành

Trực tiếp dưới HĐHS:

1. Ban Thường trực
2. Đại hội Đại diện Học sinh
3. Hội đồng CLB
4. Hội đồng Học thuật
5. Ban Đại diện Học sinh
6. Ban Truyền thông
7. Ban Thông tin & Hệ thống

Hội đồng CLB hiện có:

- The Flames Club
- CLB Văn nghệ
- CLB Âm nhạc
- CLB Kỹ năng Đoàn - Hội
- CLB Tin học
- CLB Cầu lông

Ban Trật tự - Nề nếp thuộc Đoàn trường.

Ban Hoạt động & Sự kiện, Ban Hậu cần và Ban Giám sát đang tạm hoãn và không nằm trong cơ cấu hiện hành.

## Quy tắc đặc biệt

- Chỉ có một đơn vị Truyền thông. Tên hiện hành ưu tiên là Ban Truyền thông; “CLB Truyền thông” là tên lịch sử/bí danh trong tài liệu casting.
- The Flames Club là tên hiện hành của CLB Nhảy và tích hợp Dancesport.
- CLB Văn nghệ và CLB Âm nhạc là hai đơn vị độc lập.
- Các CLB/Ban hiện hành chưa chia nhóm con khi chưa có nhu cầu thực tế.
- Khối 10 có 14 lớp, khối 11 có 13 lớp, khối 12 có 14 lớp; mỗi lớp cử 1 đại diện, tổng 41 đại diện.

## Cách hiển thị

Trường → BGH / Đoàn trường / HĐHS → đơn vị → chức danh → thành viên.

Trang /people/ là Danh bạ nhân sự riêng, có tìm kiếm và lọc theo đơn vị/chức danh; chỉ hiện người còn ít nhất một phân công công khai. Trang /admin chỉ dành cho chủ trang đã đăng nhập GitHub; giao diện cho phép tạo/sửa nháp người, thêm phân công và tạo nháp gỡ một hoặc tất cả phân công. Gỡ phân công không xóa cứng hồ sơ người; hết phân công thì ẩn khỏi danh bạ. Lưu nháp không đổi nội dung public. Chủ dự án phải đối chiếu với nguồn trong 05, kiểm tra dữ liệu, cập nhật CSV master, xuất dữ liệu và triển khai trên Vercel.

## Dữ liệu và quyền riêng tư

- Danh sách casting, số điện thoại, ngày sinh và ghi chú nội bộ không được đưa vào cơ sở dữ liệu nháp hoặc web công khai.
- Bản công khai được xuất từ `05 - Ứng dụng MVP/app/database` qua `tools/hdhs_prepare_public.py`; không sửa trực tiếp CSV trong thư mục `09`.
- Dữ liệu admin chỉ gồm các trường cho phép của sáu CSV công khai. Mọi API ghi nháp xác thực GitHub ID phía máy chủ.

## Giai đoạn hiện tại

Sơ đồ, Danh bạ riêng và giao diện admin responsive cho máy tính/điện thoại đã được viết trong workspace local. Thay đổi chỉ là nháp; chưa chạy kiểm thử hay triển khai. Dữ liệu công khai vẫn phải qua đối chiếu nguồn. Quyền hạn chính thức của HĐHS phụ thuộc vào nhà trường và Đoàn trường.
