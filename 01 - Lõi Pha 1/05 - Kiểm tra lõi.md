# Kiểm tra bắt buộc trước khi làm UI

Core chỉ được coi là ổn khi:
- không trùng ID;
- không trùng người do khác cách viết tên;
- không có assignment mồ côi;
- không có vòng lặp trong cây tổ chức;
- một người nhiều vai trò vẫn là một hồ sơ;
- source hiện hành và public projection có trace rõ;
- public projection không chứa trường private;
- tên tiếng Việt hiển thị đúng Unicode;
- search không dấu được xem là behavior của UI sau này, không làm biến dạng dữ liệu gốc.

Bộ test hiện tại trước hết bảo đảm repo vẫn ở trạng thái **core-only**, chưa bị frontend mọc lại ngoài ý muốn.
