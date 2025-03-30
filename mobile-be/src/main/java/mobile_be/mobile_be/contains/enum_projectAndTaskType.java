package mobile_be.mobile_be.contains;


public enum enum_projectAndTaskType {
    Giao(0),        //  cong viec / du an  minh giao cho nguoi khac
    DuocGiao(1);  //  cong viec / du an  minh duoc giao

    private final int value;

    enum_projectAndTaskType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
