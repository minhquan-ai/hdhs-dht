# Brand source

Thư mục này là source of truth kỹ thuật cho nhận diện web HĐHS DHT.

- `tokens.css`: token CSS chính thức.
- `tokens.json`: token dạng dữ liệu, dùng cho tooling/đồng bộ sau này.
- `shadcn-map.css`: mapping token thương hiệu sang semantic token của shadcn/ui.

Không import `shadcn-map.css` vào wireframe hiện tại. Khi bắt đầu redesign, áp token theo thứ tự:

1. `src/brand/tokens.css`
2. `src/brand/shadcn-map.css`
3. component/page styles

Quy tắc đầy đủ: `../../docs/HE_THONG_NHAN_DIEN_WEB.md`.
