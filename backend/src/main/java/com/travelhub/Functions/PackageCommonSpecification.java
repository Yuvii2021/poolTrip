package com.travelhub.Functions;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import org.springframework.data.jpa.domain.Specification;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.enums.requestFilter;

public class PackageCommonSpecification {

    public static Specification<TravelPackage> commonFilters(
            Map<String, requestFilter> filters
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Always active
            predicates.add(cb.equal(root.get("status"), PackageStatus.ACTIVE));

            if (filters == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            // Price range
            if (filters.containsKey("minPrice")) {
                predicates.add(
                    cb.greaterThanOrEqualTo(
                        root.get("price"),
                        filters.get("minPrice").getIntValue()
                    )
                );
            }

            if (filters.containsKey("maxPrice")) {
                predicates.add(
                    cb.lessThanOrEqualTo(
                        root.get("price"),
                        filters.get("maxPrice").getIntValue()
                    )
                );
            }

            // Start date (from)
            if (filters.containsKey("startDateFrom")) {
                predicates.add(
                    cb.greaterThanOrEqualTo(
                        root.get("startDate"),
                        filters.get("startDateFrom").getDateValue()
                    )
                );
            }

            if (filters.containsKey("startDateTo")) {
                predicates.add(
                    cb.lessThanOrEqualTo(
                        root.get("startDate"),
                        filters.get("startDateTo").getDateValue()
                    )
                );
            }

            // Duration
            if (filters.containsKey("durationDays")) {
                predicates.add(
                    cb.equal(
                        root.get("durationDays"),
                        filters.get("durationDays").getIntValue()
                    )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}