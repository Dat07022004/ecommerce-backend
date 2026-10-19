import { HttpStatus } from '@nestjs/common';

/**
 * 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES)
 */

// Cấu trúc JSON chuẩn duy nhất trả về cho Frontend khi có lỗi xảy ra
export type ApiErrorPayload = {
  success: false; // Luôn là false để báo hiệu request thất bại
  statusCode: number; // Mã HTTP Status (VD: 400, 404, 500)
  message: string; // Thông điệp lỗi hiển thị cho người dùng/FE
  error?: string; // Tên loại lỗi hoặc chi tiết phụ (tùy chọn)
  requestId: string; // Mã định danh request để phục vụ việc tracing/log
  timestamp: string; // Thời gian xảy ra lỗi (chuẩn ISO)
  path: string; // Đường dẫn API bị lỗi
};

// Ngữ cảnh dùng để truyền thông tin định danh request
export type ApiErrorContext = {
  requestId: string;
  path: string;
};

/**
 * 2. HÀM TẠO PAYLOAD LỖI CHUẨN
 * Dùng để lắp ráp các thông tin rời rạc thành một object hoàn chỉnh theo `ApiErrorPayload`
 */
export function buildApiErrorPayload(
  statusCode: number,
  message: string | string[],
  error: string | undefined,
  ctx: ApiErrorContext,
): ApiErrorPayload {
  return {
    success: false,
    statusCode: statusCode,
    message: formatClientErrorMessage(message), // Gọi hàm chuẩn hóa message ở dưới
    requestId: ctx.requestId,
    timestamp: new Date().toISOString(), // Tự động lấy thời điểm hiện tại
    path: ctx.path,
    error: error ?? '', // Nếu không có error thì mặc định là chuỗi rỗng
  };
}

/**
 * 3. HÀM CHUẨN HÓA THÔNG ĐIỆP LỖI
 * Xử lý trường hợp message đầu vào là string hoặc một mảng string (do class-validator trả về)
 */
const formatClientErrorMessage = (message: string | string[]): string => {
  if (Array.isArray(message)) {
    return message
      .map((m) => String(m).trim()) // Cắt bỏ khoảng trắng thừa ở mỗi phần tử
      .filter(Boolean) // Lọc bỏ các giá trị rỗng/null/undefined
      .join(' '); // Nối các phần tử lại thành một câu hoàn chỉnh
  }

  return String(message);
};

// Cấu trúc khung mẫu của một lỗi HTTP mặc định từ NestJS
type NestHttpErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

/**
 * 4. HÀM TRÍCH XUẤT LỖI TỪ HTTP EXCEPTION
 * Bóc tách message và error từ phần thân (body) của ngoại lệ HTTP bắt được
 */
export function extractFromHttpExceptionBody(
  body: Record<string, unknown> | NestHttpErrorBody,
  fallbackMessage: string,
) {
  const b = body as NestHttpErrorBody;
  // Nếu b.message có thì dùng, không thì lấy fallbackMessage làm dự phòng
  const message = b.message !== undefined ? b.message : fallbackMessage;

  // Lấy b.error nếu nó là một chuỗi hợp lệ và không rỗng
  const error =
    typeof b.error === 'string' && b.error !== '' ? b.error : undefined;

  return { message, error };
}

/**
 * 5. HÀM XỬ LÝ LỖI KHÔNG XÁC ĐỊNH (UNHANDLED / 500 INTERNAL SERVER ERROR)
 * Đảm bảo tính bảo mật bằng cách ẩn thông tin lỗi nhạy cảm khi chạy ở môi trường Production
 */
export function payloadFromUnknownException(
  exception: unknown,
  ctx: ApiErrorContext,
): ApiErrorPayload {
  // TODO: Sau này có thể tích hợp thêm dịch vụ dịch ngôn ngữ lỗi (translate error message) ở đây

  // Kiểm tra xem ứng dụng có đang chạy ở môi trường thực tế (production) hay không
  const prod = process.env.NODE_ENV === 'production';

  if (exception instanceof Error) {
    return buildApiErrorPayload(
      HttpStatus.INTERNAL_SERVER_ERROR,
      // Nếu là Production: giấu lỗi đi, chỉ trả về chuỗi chung chung để bảo mật.
      // Nếu là Development: hiển thị chi tiết `exception.message` để dev dễ debug.
      prod ? 'Internal server error' : exception.message,
      'Internal Server Error',
      ctx,
    );
  }

  // Trường hợp ngoại lệ không phải đối tượng Error chuẩn
  return buildApiErrorPayload(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Internal server error',
    'Internal Server Error',
    ctx,
  );
}
