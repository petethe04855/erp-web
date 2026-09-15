import apiClient from "@/lib/axios";

// Download a server-rendered PDF from the backend Go API and trigger a browser save.
// Uses the centralized Axios client so the request benefits from the same
// base URL, Authorization interceptor, and error handling as every other API call
// — eliminating cross-origin fetch issues.
//
// Throws an Error with a user-friendly Thai message describing exactly what failed.
export async function downloadBackendPdf(
  resource: string,
  id: string | number | undefined | null,
  filename: string,
): Promise<void> {
  if (id === undefined || id === null || id === "") {
    throw new Error("ไม่พบรหัสเอกสารสำหรับดาวน์โหลด");
  }

  try {
    const response = await apiClient.get(`/${resource}/${id}/pdf`, {
      responseType: "blob",
    });

    const contentType =
      String(response.headers["content-type"] || "application/pdf");
    const blob: Blob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: contentType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err: unknown) {
    // Axios wraps network failures and HTTP errors; surface a Thai message.
    if (err instanceof Error) {
      // The Axios response interceptor already maps status codes to Thai
      // messages, so just re-throw unless we can add more context.
      const msg = err.message;
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        throw new Error(
          "หมดอายุการใช้งาน กรุณาออกจากระบบและเข้าสู่ระบบใหม่อีกครั้ง",
        );
      }
      if (msg.includes("404")) {
        throw new Error("ไม่พบเอกสารนี้ในระบบ (อาจถูกลบไปแล้ว)");
      }
      throw new Error(
        `เซิร์ฟเวอร์สร้าง PDF ไม่สำเร็จ: ${msg}`,
      );
    }
    throw new Error(
      "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ — ตรวจสอบว่า ERP API รันอยู่ แล้วรีเฟรชหน้าเว็บ (Ctrl+Shift+R)",
    );
  }
}
