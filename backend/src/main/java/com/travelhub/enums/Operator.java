package com.travelhub.enums;

public enum Operator {

    EQ("=", "equals"),
    NE("!=", "not_equals"),

    GT(">", "greater_than"),
    GTE(">=", "greater_than_equal"),

    LT("<", "less_than"),
    LTE("<=", "less_than_equal"),

    IN("IN", "in"),
    NOT_IN("NOT IN", "not_in"),

    LIKE("LIKE", "like"),
    NOT_LIKE("NOT LIKE", "not_like"),

    BETWEEN("BETWEEN", "between"),

    IS_NULL("IS NULL", "is_null"),
    IS_NOT_NULL("IS NOT NULL", "is_not_null"),

    AND("AND", "and"),
    OR("OR", "or");

    private final String sql;
    private final String key;

    Operator(String sql, String key) {
        this.sql = sql;
        this.key = key;
    }

    public String getSql() {
        return sql;
    }

    public String getKey() {
        return key;
    }
}
