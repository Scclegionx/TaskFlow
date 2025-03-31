package mobile_be.mobile_be.contains;


public enum enum_tydstate {
    Du(0),        //  cong viec / du an  minh giao cho nguoi khac
    Thieu(1);  //  cong viec / du an  minh duoc giao

    private final int value;

    enum_tydstate(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
