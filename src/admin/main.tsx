import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

function OwnerLogin() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/admin/admin.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <Card id="login-panel" className="login-panel" aria-labelledby="login-title">
      <CardHeader className="admin-login-header px-0">
        <Badge variant="outline" className="owner-badge">
          KHU VỰC CHỦ SỞ HỮU
        </Badge>
        <h1 id="login-title">Quản lý danh bạ nhân sự</h1>
      </CardHeader>
      <CardContent className="admin-login-content px-0">
        <p>
          Đăng nhập để thêm người, cập nhật phân công hoặc gỡ một người khỏi đơn vị.
          Mọi thay đổi chỉ là bản nháp riêng cho tới khi được đối chiếu với nguồn dữ liệu.
        </p>
        <Button id="login-button" className="primary-button" type="button" size="lg">
          Đăng nhập bằng GitHub <span aria-hidden="true">→</span>
        </Button>
        <p id="login-message" className="message" role="status" />
      </CardContent>
    </Card>
  );
}

const root = document.getElementById("login-panel-root");
if (root) createRoot(root).render(<OwnerLogin />);
