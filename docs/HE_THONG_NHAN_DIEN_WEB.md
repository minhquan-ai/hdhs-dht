# Hệ thống nhận diện web HĐHS DHT

> Phiên bản nền tảng 1.0 · 30/09/2026  
> Phạm vi: website công khai, danh bạ, trang quản trị và các tính năng web HĐHS DHT về sau.  
> Đây là nhận diện số của **HĐHS DHT**, không thay thế logo/nhận diện chính thức của Trường THPT Đặng Huy Trứ.

## 1. Tính cách thương hiệu

HĐHS DHT trên web cần tạo cảm giác:

1. **Có tổ chức** — cấu trúc rõ, dễ định hướng, không phô diễn hiệu ứng.
2. **Đáng tin** — dữ liệu, trạng thái và hành động phải minh bạch.
3. **Kết nối** — hình ảnh hệ thống dựa trên node, nhóm, đường dẫn và mối quan hệ.
4. **Trẻ nhưng nghiêm túc** — năng động vừa đủ, tránh trẻ con hoặc “startup hóa”.
5. **Lấy học sinh làm trung tâm** — con người và cơ hội quan trọng hơn đồ họa trang trí.

Câu kiểm tra nhanh trước mọi quyết định UI:

> “Nó có giúp học sinh hiểu ai, đơn vị nào, vai trò gì và làm gì tiếp theo nhanh hơn không?”

Nếu không, hiệu ứng đó không cần tồn tại.

---

## 2. Ý tưởng thị giác cốt lõi

### 2.1 Motif: **Grid + Node + Slash**

- **Grid**: thể hiện tổ chức, hệ thống, tính rõ ràng.
- **Node**: thể hiện cá nhân, CLB/Ban, vai trò và kết nối.
- **Slash “/”**: dấu nối nhận diện giữa trường và HĐHS, ví dụ: `DHT / HĐHS`.
- Đường nối chỉ dùng khi nó thật sự biểu diễn quan hệ. Không vẽ cây dây điện chỉ để trang trí.

### 2.2 Wordmark sử dụng trên web

Dạng mặc định:

**DHT / HĐHS**

Dạng đầy đủ:

**Hội đồng Học sinh · THPT Đặng Huy Trứ**

Quy tắc:
- Không tự tạo huy hiệu mô phỏng logo trường.
- Không kéo méo, xoay hoặc thêm glow cho wordmark.
- Wordmark ưu tiên 1 màu: Evergreen 700 trên nền sáng, trắng trên nền Evergreen.
- Khoảng trống tối thiểu quanh wordmark bằng chiều cao chữ “D”.

---

## 3. Hệ màu

Nguồn token chuẩn: `src/brand/tokens.css`.

### 3.1 Màu lõi

| Vai trò | Token | Màu | Dùng cho |
|---|---|---:|---|
| Primary | Evergreen 700 | `#195744` | CTA chính, active, điểm nhấn thương hiệu |
| Primary hover | Evergreen 900 | `#133A30` | Hover/pressed |
| Primary soft | Evergreen 100 | `#E1F0E9` | Active background, badge mềm |
| Canvas | Stone 50 | `#F8F9F7` | Nền trang |
| Surface | White | `#FFFFFF` | Card, dialog, table |
| Ink | Stone 900 | `#171C19` | Text chính |
| Muted | Stone 500 | `#6F7A73` | Text phụ |
| Border | Stone 200 | `#E1E5E1` | Viền |

### 3.2 Màu phụ có chức năng

- **Amber `#C77A22`**: deadline, cảnh báo nhẹ, hoạt động/sự kiện.
- **Blue `#3569A8`**: thông tin, học thuật, link hệ thống.
- **Coral `#C85C52`**: lỗi, hành động phá huỷ, cảnh báo mạnh.
- Không dùng màu phụ chỉ để “cho vui”. Mỗi màu phải có ý nghĩa.

### 3.3 Tỉ lệ màu

- 70–80% neutral/canvas/surface.
- 15–25% Evergreen.
- ≤10% accent/semantic.

Không tạo gradient làm nền mặc định. Gradient chỉ được phép cho chiến dịch/sự kiện riêng, không phải UI hệ thống.

---

## 4. Typography

### Font chính

**Geist Variable** — đã có trong dự án và hỗ trợ tiếng Việt.

Fallback:

`"Geist Variable", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`

Không dùng serif cho giao diện hệ thống.

### Thang chữ

| Token | Size | Dùng cho |
|---|---:|---|
| xs | 12px | metadata, helper |
| sm | 14px | secondary text |
| md | 16px | body mặc định |
| lg | 18px | body nổi bật |
| xl | 22px | section title |
| 2xl | 28px | page title nhỏ |
| 3xl | 36px | page title |
| 4xl | 48px | hero vừa |
| 5xl | 64px | chỉ landing/sự kiện |

Quy tắc:
- Body: 400–450.
- Label/button: 550–650.
- Heading: 650–760.
- Không dùng ALL CAPS cho câu dài.
- Letter-spacing âm chỉ dùng heading lớn, tối đa khoảng `-0.04em`.

---

## 5. Khoảng cách và layout

Hệ thống theo nhịp **4px**, ưu tiên bội số 8.

Token chính:
`4, 8, 12, 16, 24, 32, 40, 48, 64, 80`.

### Container

- Narrow: 720px — đọc nội dung dài.
- Content: 960px — form/danh bạ.
- Wide: 1200px — dashboard/sơ đồ.
- Max: 1360px — màn hình lớn.

### Gutter

- Mobile: 16px.
- Tablet: 24px.
- Desktop: 32px.
- Large desktop: 40px.

Không để content chính dính sát viewport, cũng không tạo khoảng trống “cinematic” khiến nội dung rơi khỏi màn hình đầu.

---

## 6. Bo góc, viền, shadow

### Radius

- 6px: chip/control nhỏ.
- 10px: button/input.
- 14px: card.
- 20px: dialog/hero đặc biệt.
- Pill `999px`: chỉ badge/status/avatar tròn.

### Border

Mặc định 1px. Chỉ dùng border đậm hơn để biểu thị active/selected, không để trang đầy “viền kép”.

### Shadow

Shadow là cấp độ nổi, không phải đồ trang trí.

- xs: input/dropdown nhẹ.
- sm: card hover/floating control.
- md: dialog/popover.
- Không dùng shadow lớn cho mọi card.

---

## 7. Icon

- Chuẩn đề xuất: **Lucide** hoặc icon SVG stroke tương đương.
- Stroke 1.75–2px.
- Size: 16 / 20 / 24.
- Icon điều hướng phải cùng một family.
- Không dùng emoji làm icon cấu trúc.
- Icon-only button bắt buộc có `aria-label`.

---

## 8. Motion

Motion phải giải thích trạng thái hoặc hướng di chuyển.

- Fast: 120ms — press, hover nhỏ.
- Base: 180ms — hover card, dropdown.
- Slow: 260ms — drawer/dialog.
- Easing mặc định: `cubic-bezier(.2,.8,.2,1)`.

Cấm:
- bounce liên tục;
- parallax trên trang dữ liệu;
- animation vô hạn ở UI chính;
- layout shift khi hover.

Tôn trọng `prefers-reduced-motion`.

---

## 9. Component language

### Button

- Primary: Evergreen solid.
- Secondary: white + border.
- Ghost: transparent.
- Destructive: Coral, chỉ cho hành động phá huỷ.
- Chiều cao chuẩn: 40px desktop, tối thiểu 44px touch target mobile.

Trạng thái bắt buộc: default, hover, active, focus, disabled, loading.

### Input / Search / Select

- Nền surface.
- Border neutral.
- Focus ring rõ, không chỉ đổi màu border.
- Helper text nằm dưới field.
- Error phải có icon/text, không chỉ dùng màu đỏ.

### Card

Card chỉ dùng khi nhóm thông tin cần tách khỏi nền. Không biến từng dòng thành card.

Card chuẩn:
- radius 14px;
- border 1px;
- shadow mặc định gần như bằng 0;
- hover chỉ tăng border/shadow rất nhẹ nếu card clickable.

### Badge

Chỉ dùng cho trạng thái/ngữ cảnh ngắn:
- Hiện hành
- Nháp
- Chưa phân công
- Đơn vị
- Lớp

Không dùng badge thay cho câu văn.

### Table

Desktop ưu tiên table thật. Mobile chuyển sang row-card chỉ khi bảng không còn đọc được.

### Person

Một hồ sơ nhân sự luôn ưu tiên:
1. Tên.
2. Lớp.
3. Vai trò.
4. Đơn vị.

Không công khai dữ liệu liên hệ hoặc dữ liệu nội bộ.

### Org node

Node phải trả lời:
- Đây là đơn vị gì?
- Thuộc đâu?
- Có bao nhiêu nhánh/vai trò?
- Bấm vào sẽ đi đâu?

Trang tổng quan không hiển thị toàn bộ cây nếu làm người dùng bị ngợp.

---

## 10. Responsive

Breakpoint quy ước:

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

Nguyên tắc:
- Mobile không phải desktop thu nhỏ.
- Điều hướng chính ≤ 4 mục.
- Touch target tối thiểu 44×44px.
- Tránh horizontal scroll ngoài table thực sự cần thiết.
- Nội dung quan trọng phải xuất hiện trong viewport đầu mà không cần “hero trống”.

---

## 11. Accessibility

Bắt buộc:
- Contrast text thường ≥ 4.5:1.
- Focus visible rõ ràng.
- Keyboard order đúng logic.
- Không truyền trạng thái chỉ bằng màu.
- `aria-label` cho icon-only controls.
- `prefers-reduced-motion`.
- Heading hierarchy hợp lý.
- Form có label thật.
- Error/status dùng vùng live phù hợp khi cần.

---

## 12. Giọng nội dung

### Giọng mặc định

Ngắn, rõ, lịch sự, thân thiện, không quan liêu.

**Nên**
- “Tìm theo tên, lớp hoặc đơn vị”
- “Chưa có người được phân công”
- “Lưu bản nháp”
- “Xem cơ cấu”

**Tránh**
- “Kính đề nghị quý người dùng tiến hành…”
- “Click here”
- “Explore ecosystem”
- Các câu marketing phô trương trong trang dữ liệu.

### Quy tắc viết

- Giao diện dùng tiếng Việt trước.
- Sentence case.
- Tên đơn vị giữ đúng tên chính thức.
- Không tự viết tắt nếu người dùng phổ thông khó hiểu.
- Microcopy phải nói kết quả của hành động.

---

## 13. Page patterns

### Trang tổng quan
- Header gọn.
- Một phần giới thiệu ngắn.
- Các đường vào chính: cơ cấu, nhân sự, đơn vị.
- Không dump toàn bộ cây tổ chức lên màn hình đầu.

### Danh bạ
- Search là hành động chính.
- Filter là thứ hai.
- Kết quả ưu tiên khả năng scan.
- Chi tiết mở progressive disclosure.

### Trang đơn vị
- Tên + loại đơn vị + mô tả.
- Vai trò/chức danh.
- Nhân sự.
- Đơn vị con.
- Breadcrumb rõ.

### Admin
- Utility-first.
- Ít màu.
- Không dùng animation trang trí.
- Luôn hiển thị trạng thái nháp/published rõ ràng.

---

## 14. Quy tắc với shadcn/ui

Token mapping nằm ở `src/brand/shadcn-map.css`.

- Không sửa trực tiếp component shadcn chỉ để đổi màu.
- Ưu tiên semantic token.
- Variant mới chỉ tạo khi hành vi/ý nghĩa khác, không phải vì một trang muốn màu riêng.
- Component UI không được biết tên màu primitive như `green-700`; component chỉ dùng `primary`, `muted`, `border`, `danger`...

---

## 15. Kiến trúc token

Ba tầng:

1. **Primitive**: màu/thước đo thuần — `--dht-green-700`.
2. **Semantic**: ý nghĩa — `--brand-primary`, `--brand-text-muted`.
3. **Component**: chỉ khi thật sự cần — ví dụ `--button-primary-bg`.

Component không được tham chiếu primitive trực tiếp trừ trường hợp asset minh hoạ.

---

## 16. Do / Don't

### Do
- Nhiều khoảng thở nhưng nội dung vẫn ở trên fold.
- Dùng màu để tạo thứ bậc.
- Dùng border/spacing trước shadow.
- Giữ hierarchy nhất quán giữa public/admin.
- Thiết kế mobile như một layout riêng.

### Don't
- Hero cao 600–800px trên trang dữ liệu.
- Gradient + glass + shadow cùng lúc cho mọi khối.
- Bo tròn mọi thứ thành pill.
- Mỗi đơn vị một màu tuỳ hứng.
- Motion chỉ vì “trông xịn”.
- Dùng 5 font weight trong một card.

---

## 17. Source of truth

- Tài liệu quy tắc: `docs/HE_THONG_NHAN_DIEN_WEB.md`
- Token CSS: `src/brand/tokens.css`
- Token JSON: `src/brand/tokens.json`
- Mapping shadcn: `src/brand/shadcn-map.css`
- Trang xem thử: `/brand/`

Khi có quyết định thiết kế mới, cập nhật token/tài liệu trước rồi mới sửa từng trang. Đây là cách tránh việc mỗi màn hình tự phát minh một HĐHS khác nhau.
