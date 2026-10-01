import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from "@/components/ui/card";
import "@/index.css";
import "../../admin/admin.css";
import "./admin-shell.css";

function AdminApp() {
  useEffect(() => {
    void import("../../admin/admin.js");
  }, []);

  return (
    <>
      <header className="admin-header">
        <a className="brand" href="/" aria-label="Về sơ đồ HĐHS DHT">
          <span className="brand-mark" aria-hidden="true">DHT</span>
          <span>
            <strong>HĐHS DHT</strong>
            <small>Quản trị nhân sự</small>
          </span>
        </a>
        <div className="header-right">
          <Badge variant="outline" className="read-only-label">
            <span className="dot" aria-hidden="true" />
            Thay đổi chỉ lưu thành nháp
          </Badge>
          <Button id="logout-button" type="button" variant="ghost" className="quiet-button hidden">
            Đăng xuất
          </Button>
          <a className="back-link" href="/people/">← Về danh bạ</a>
        </div>
      </header>

      <main className="admin-main">
        <Card id="login-panel" className="login-panel">
          <CardHeader className="login-card-header">
            <span className="eyebrow">KHU VỰC CHỦ SỞ HỮU</span>
            <h1>Quản lý danh bạ nhân sự</h1>
            <CardDescription className="login-card-description">
              Đăng nhập để thêm người, cập nhật phân công hoặc gỡ một người khỏi đơn vị.
              Mọi thay đổi chỉ là bản nháp riêng cho tới khi được đối chiếu với nguồn dữ liệu.
            </CardDescription>
          </CardHeader>
          <CardContent className="login-card-content">
            <Button id="login-button" type="button" size="lg" className="login-button">
              Đăng nhập bằng GitHub
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M5 12h13M12 6l6 6-6 6" />
              </svg>
            </Button>
            <p id="login-message" className="message" role="status" />
          </CardContent>
        </Card>

        <section id="editor-panel" className="hidden" aria-labelledby="admin-title">
          <div className="page-heading">
            <div>
              <Badge variant="outline" className="phase-badge">
                BẢN NHÁP RIÊNG · CHƯA HIỂN THỊ CÔNG KHAI
              </Badge>
              <h1 id="admin-title">Nhân sự và phân công</h1>
              <p id="signed-in-label">Đã đăng nhập</p>
            </div>
            <Badge variant="secondary" className="pending-chip">
              <span id="pending-count">0</span> nháp đang chờ
            </Badge>
          </div>

          <div className="notice" role="note">
            <strong>Lưu chỉ tạo nháp.</strong>
            {" "}Danh bạ công khai chỉ đổi sau khi đối chiếu dữ liệu tại 05, cập nhật CSV nguồn,
            xuất bản và triển khai.
          </div>

          <div className="workspace">
            <nav className="table-nav" id="table-nav" aria-label="Bảng dữ liệu" />
            <section className="table-area" aria-labelledby="table-title">
              <div className="table-toolbar">
                <div>
                  <span className="eyebrow">DỮ LIỆU ĐÃ CÔNG KHAI</span>
                  <h2 id="table-title">Hồ sơ người</h2>
                  <p id="table-hint" className="table-hint">
                    Một hồ sơ cho mỗi người; phân công được quản lý riêng.
                  </p>
                </div>
                <div className="table-actions">
                  <Button id="create-row" type="button" size="lg" className="primary-button">
                    Thêm người
                  </Button>
                  <Button id="reload-table" type="button" variant="outline" size="lg" className="secondary-button">
                    Tải lại
                  </Button>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">Thông tin trong bảng đang chọn</caption>
                  <thead id="table-head" />
                  <tbody id="table-body" />
                </table>
              </div>
              <div id="table-empty" className="empty-message hidden">
                Chưa có dữ liệu trong bảng này.
              </div>
            </section>
          </div>

          <section className="draft-section" aria-labelledby="draft-heading-title">
            <div className="draft-heading">
              <div>
                <span className="eyebrow">CHỈ CHỦ SỞ HỮU NHÌN THẤY</span>
                <h2 id="draft-heading-title">Nháp đang chờ</h2>
              </div>
              <Button id="reload-drafts" type="button" variant="ghost" className="text-button">
                Tải lại
              </Button>
            </div>
            <div id="drafts-list" className="drafts-list" />
          </section>
        </section>
      </main>

      <dialog id="row-dialog" className="row-dialog" aria-labelledby="row-title" aria-describedby="row-message">
        <form method="dialog" className="dialog-body">
          <div className="dialog-heading">
            <div>
              <span id="dialog-eyebrow" className="eyebrow">CHỈNH SỬA BẢN NHÁP</span>
              <h2 id="row-title">Bản ghi</h2>
            </div>
            <Button className="close-button" type="button" variant="ghost" size="icon-lg"
              data-close-dialog aria-label="Đóng">
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </Button>
          </div>
          <p id="row-path" className="path-label" />
          <p id="row-guidance" className="dialog-guidance" />
          <div id="row-fields" className="row-fields" />
          <p id="row-message" className="message" role="status" />
          <div className="dialog-actions">
            <Button className="secondary-button" type="button" variant="outline" data-close-dialog>Hủy</Button>
            <Button id="save-and-assign" className="secondary-button hidden" type="button" variant="outline">
              Lưu và thêm phân công
            </Button>
            <Button id="save-row" className="primary-button" type="button">Lưu nháp</Button>
          </div>
        </form>
      </dialog>

      <div id="toast" className="toast" role="status" aria-live="polite" />
    </>
  );
}

const root = document.getElementById("admin-root");
if (root) createRoot(root).render(<AdminApp />);