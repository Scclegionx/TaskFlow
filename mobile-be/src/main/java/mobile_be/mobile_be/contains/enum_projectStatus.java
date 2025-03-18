package mobile_be.mobile_be.contains;


public enum enum_projectStatus {
    PENDING(0),        //  đang chờ xử lý
    IN_PROGRESS(1),    //  đang được thực hiện
    COMPLETED(2),      //  đã hoàn thành
    CANCELLED(3),      // đã bị hủy
    OVERDUE(4);        // quá hạn

    private final int value;

    enum_projectStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
