# Pha 1 — vận hành và kiểm tra

Cập nhật: 30/09/2026.

## Nguồn và xuất dữ liệu

Nguồn chuẩn là sáu CSV trong `../05 - Ứng dụng MVP/app/database`. Sửa tại nguồn này. Từ thư mục dự án, chạy `python3 tools/kiem_tra_du_lieu_hdhs.py`, sau đó `python3 tools/chuan_bi_du_lieu_cong_khai.py`. Lệnh xuất chỉ tạo bản whitelist trong repo web và không ghi đè giao diện.

## Use case cần đạt

- Khách xem sơ đồ và đi đến hồ sơ người.
- Khách tìm/lọc danh bạ; một người có thể có nhiều phân công.
- Chủ đăng nhập GitHub, tạo/sửa nháp, thêm/gỡ phân công, bỏ nháp.
- Dữ liệu public chỉ đổi sau khi chủ đối chiếu, cập nhật nguồn, kiểm tra và xuất lại.

## Kiểm tra tại máy

Trong repo web, chạy `npm test`. Mở site trên màn hình máy tính và điện thoại: kiểm tra sơ đồ, `/people/`, tìm/lọc, liên kết hai chiều, dữ liệu rỗng/lỗi và không tràn ngang. Kiểm tra API admin với cấu hình OAuth và Neon riêng; tài khoản ngoài danh sách chủ phải bị từ chối.

## Cấu hình admin

Sao chép `.env.example` thành `.env.local` ở máy cá nhân và điền GitHub OAuth Client ID/Secret, ID số GitHub của chủ, `HDHS_SESSION_SECRET`, `DATABASE_URL`, site origin và callback URL. Không ghi secret vào Git hoặc chat. GitHub OAuth App phải đăng ký đúng callback. Dùng Neon riêng cho các bản nháp.

## Quy tắc

Admin chỉ lưu nháp có phiên bản; API kiểm tra chủ, same-origin, whitelist trường và xung đột phiên bản. Gỡ phân công không xóa cứng hồ sơ. Không có nút tự xuất bản hoặc ghi trực tiếp CSV từ trình duyệt.

## Trạng thái triển khai đã kiểm tra 30/09/2026

Vercel project `hdhs-dht` có `DATABASE_URL` ở development, preview và production. `HDHS_SESSION_SECRET`, `HDHS_SITE_ORIGIN` và `HDHS_OAUTH_CALLBACK_URL` hiện chỉ có ở production. `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` và `HDHS_OWNER_GITHUB_ID` chưa có. Production hiện vẫn phục vụ sơ đồ cũ; `/people/` và `/api/auth/session` trả 404. Preview Pha 1 cũ yêu cầu Vercel Authentication; kiểm tra trực tiếp cho thấy `/api/auth/session` trả `configured:false` và `/api/admin/drafts` trả `auth_not_configured`. Preview đó chưa dùng các thay đổi cục bộ hiện tại.

## Trạng thái GitHub đã kiểm tra 30/09/2026

Repo `minhquan-ai/hdhs-dht` có nhánh `codelocal/phase1-foundation-20260927` nhưng chưa có PR để đưa nhánh này vào `main`. PR #1 “Add owner-only public data drafts” đang là draft từ `codex/localhost-owner-admin`; PR này chỉ thêm admin/API, chưa gồm danh bạ Pha 1. Các thay đổi hiện tại ở checkout local chưa được commit hoặc push.

## Gate bàn giao

Dữ liệu nguồn đạt kiểm tra; export public đạt privacy; `npm test` đạt; chart/danh bạ đạt desktop/mobile; API từ chối người không phải chủ; bản nháp không thay đổi public; cấu hình OAuth/Neon hoạt động trên preview được chủ kiểm tra trước mọi lần triển khai.