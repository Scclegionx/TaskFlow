package mobile_be.mobile_be.contains;


public enum enum_status_kpi {
    ChuaDu(0),
    Du(1);


    private final int value;

    enum_status_kpi(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
