package mobile_be.mobile_be.contains;


public enum enum_taskStatus {
    PENDING(0),        // Công việc đang chờ xử lý
    IN_PROGRESS(1),    // Công việc đang được thực hiện
    COMPLETED(2),      // Công việc đã hoàn thành
    CANCELLED(3),      // Công việc đã tu choi
    OVERDUE(4);        // Công việc quá hạn

    private final int value;

    enum_taskStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
