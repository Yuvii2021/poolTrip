package com.travelhub.enums;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class requestFilter {

    /**
     * Field/column name on which filter is applied
     * Example: price, durationDays, transportation
     */
    private String field;

    /**
     * Operator to apply (EQ, GT, IN, BETWEEN, etc.)
     */
    private Operator operator;

    /**
     * Value for the filter.
     * - Single value for EQ, GT, LT, LIKE
     * - List for IN / NOT_IN
     * - Array or List with 2 elements for BETWEEN
     */
    private Object value;

    /**
     * Helper methods for validation
     */
    public boolean hasValue() {
        return value != null;
    }

    public boolean isBetween() {
        return operator == Operator.BETWEEN;
    }

    public boolean isIn() {
        return operator == Operator.IN || operator == Operator.NOT_IN;
    }

    public boolean isNullCheck() {
        return operator == Operator.IS_NULL || operator == Operator.IS_NOT_NULL;
    }
}
