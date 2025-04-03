package mobile_be.mobile_be.contains;


public enum enum_tydstate {
    Du(0),
    DiMuon(1),
    VeSom(2),
    DiMuonVeSom(3),
    CoPhep(4); /// nghi phep

    private final int value;

    enum_tydstate(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
