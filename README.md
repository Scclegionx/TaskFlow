# TaskFlow

## Cài đặt và chạy Backend

1. Chạy Docker cho MySQL Database:

docker-compose up -d mysql_taskflowdb


2. Cài đặt các dependency cần thiết:

mvn clean install


3. Chạy Backend bằng IDE:
- Mở dự án trong IDE (IntelliJ, Eclipse, v.v.).
- Chạy file main của Spring Boot (MobileBeApplication.java).

---

## Cài đặt và chạy Frontend

1. Chạy Expo với cache clear:

expo start --clear


2. Sau khi FE chạy thành công, copy đoạn IP xuất hiện dưới phần log chạy (thường dạng `exp://<ip>:<port>`).

3. Mở file `api.ts` và thay thế IP hiện tại bằng IP vừa copy.

4. Chạy trên điện thoại:
- Quét mã QR bằng ứng dụng Expo Go.

5. Chạy trên Web:

- Truy cập: `http://localhost:8081`

