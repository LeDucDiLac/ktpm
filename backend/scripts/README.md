# Hướng dẫn sử dụng script thiết lập dữ liệu

## Tổng quan

Thư mục này chứa script chính để thiết lập và tạo dữ liệu mẫu cho hệ thống quản lý chung cư BlueMoon.

## Script chính

### setupDatabase.js

Đây là script duy nhất cần thiết để thiết lập toàn bộ dữ liệu cho hệ thống. Tất cả các chức năng từ các script khác đã được tích hợp vào file này.

```bash
node scripts/setupDatabase.js
```

Script này sẽ thực hiện các bước sau:
1. Kiểm tra và xóa chỉ mục householdCode nếu tồn tại
2. Tạo người dùng admin và các người dùng khác nếu chưa có
3. Tạo các loại phí nếu chưa có
4. Tạo dữ liệu hộ gia đình, cư dân và thanh toán
5. Hiển thị thống kê doanh thu tháng 6 đến ngày 6/6

## Các chức năng chính

Script setupDatabase.js tích hợp các chức năng sau:

1. **fixHouseholdIndex()**: Kiểm tra và xóa chỉ mục householdCode nếu tồn tại
2. **createAdminUser()**: Tạo người dùng admin và các người dùng khác nếu chưa có
3. **createFees()**: Tạo các loại phí cơ bản nếu chưa có
4. **createMassiveTestData()**: Tạo dữ liệu hộ gia đình, cư dân và thanh toán

## Dữ liệu được tạo

Script sẽ tạo các dữ liệu sau:

- **Người dùng**: Admin, quản lý, kế toán, nhân viên
- **Loại phí**: Phí quản lý, phí gửi xe ô tô, phí gửi xe máy, phí đóng góp
- **Hộ gia đình**: 50+ hộ gia đình với thông tin chi tiết
- **Cư dân**: 190+ cư dân thuộc các hộ gia đình
- **Thanh toán**: 900+ thanh toán trong 6 tháng gần đây
- **Dữ liệu tháng 6**: Dữ liệu thanh toán chi tiết cho tháng 6 đến ngày 6/6

## Lưu ý

- Trước khi chạy script, hãy đảm bảo MongoDB đang chạy
- Script sẽ xóa dữ liệu cũ trước khi tạo dữ liệu mới (trừ một số dữ liệu quan trọng)
- Không có thanh toán quá hạn trong tháng 6 (chỉ có trạng thái đã thanh toán hoặc đang chờ) 