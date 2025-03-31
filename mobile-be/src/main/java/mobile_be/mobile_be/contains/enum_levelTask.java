package mobile_be.mobile_be.contains;


public enum enum_levelTask {
    De(0),
    TrungBinh(1),
    Kho(2);


    private final int value;

    enum_levelTask(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
