# Hội đồng Học sinh DHT — Pha 1

Pha 1 cung cấp sơ đồ tổ chức, danh bạ nhân sự và khu vực quản trị bản nháp chỉ dành cho chủ sở hữu.

## Người dùng làm được gì

- Khách xem sơ đồ từ cấp trường đến đơn vị, chức danh và người đang được phân công.
- Khách tìm người theo tên/lớp và lọc theo đơn vị, lớp, chức danh; một người chỉ có một hồ sơ dù có nhiều phân công.
- Chủ sở hữu đăng nhập GitHub để tạo/sửa hồ sơ và phân công dưới dạng bản nháp, gỡ từng phân công, xem lại hoặc bỏ nháp.
- Chủ đối chiếu bản nháp với dữ liệu nguồn, cập nhật CSV nguồn rồi xuất lại bản công khai. Lưu nháp không sửa dữ liệu nguồn hoặc trang công khai.

## Nguồn dữ liệu

Nguồn chuẩn là sáu CSV tại `../05 - Ứng dụng MVP/app/database`. Dữ liệu public ở `database/` được tạo bằng whitelist qua `../../tools/chuan_bi_du_lieu_cong_khai.py`. Không đưa casting, số điện thoại, ngày sinh, email cá nhân, địa chỉ hoặc ghi chú nội bộ lên web.

## Chạy và kiểm tra

Tại thư mục dự án, chạy:

```sh
python3 tools/kiem_tra_du_lieu_hdhs.py
python3 tools/chuan_bi_du_lieu_cong_khai.py
```

Trong repo này, chạy `npm test`. Để xem giao diện công khai cục bộ, chạy máy chủ tĩnh trong thư mục repo rồi mở `/` và `/people/`. Để kiểm tra OAuth/API, điền cấu hình riêng theo `.env.example` và dùng Vercel Dev; không đưa bí mật vào Git hoặc chat.

## Phạm vi

Pha 1 gồm sơ đồ, danh bạ, tìm kiếm/lọc, hồ sơ một-người-nhiều-phân-công, quyền admin riêng cho chủ, bản nháp an toàn, kiểm tra dữ liệu và giao diện dùng được trên điện thoại. Workflow đội nhóm, tài liệu, AI, chat, lịch và mạng lưới 41 lớp thuộc pha sau.

## Trạng thái

Dữ liệu nguồn đã được đối chiếu và xuất qua whitelist. Giao diện, luồng dữ liệu và API Pha 1 đã sẵn sàng; đăng nhập và lưu nháp trực tuyến cần cấu hình GitHub OAuth, GitHub ID của chủ, khóa phiên và Neon. Sau cấu hình, cần chạy lại kiểm tra admin và xem bản preview trước khi triển khai.
