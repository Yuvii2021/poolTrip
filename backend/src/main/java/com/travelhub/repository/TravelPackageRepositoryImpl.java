package com.travelhub.repository;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.Operator;
import com.travelhub.enums.Transportation;
import com.travelhub.enums.requestFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;

@Repository
public class TravelPackageRepositoryImpl implements TravelPackageRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<TravelPackage> findByPackageTypeActiveWithOriginAndFilters(
            PackageType packageType,
            Double originLong,
            Double originLat,
            Double maxDistanceSq,
            HashMap<String, requestFilter> filters) {

        StringBuilder jpql = new StringBuilder();
        jpql.append("SELECT p FROM TravelPackage p ");
        jpql.append("WHERE p.status = 'ACTIVE' ");
        jpql.append("AND p.packageType = :packageType ");
        jpql.append("AND ((p.originLongitude - :originLong) * (p.originLongitude - :originLong) + ");
        jpql.append("(p.originLatitude - :originLat) * (p.originLatitude - :originLat)) < :maxDistanceSq ");

        // Add filter conditions
        if (filters != null && !filters.isEmpty()) {
            for (requestFilter filter : filters.values()) {
                if (filter == null || filter.getField() == null || !filter.hasValue()) {
                    continue;
                }
                String condition = buildFilterCondition(filter);
                if (condition != null && !condition.isEmpty()) {
                    jpql.append("AND ").append(condition).append(" ");
                }
            }
        }

        jpql.append("ORDER BY ");
        jpql.append("((p.originLongitude - :originLong) * (p.originLongitude - :originLong) + ");
        jpql.append("(p.originLatitude - :originLat) * (p.originLatitude - :originLat)) ASC");

        TypedQuery<TravelPackage> query = entityManager.createQuery(jpql.toString(), TravelPackage.class);
        query.setParameter("packageType", packageType);
        query.setParameter("originLong", originLong);
        query.setParameter("originLat", originLat);
        query.setParameter("maxDistanceSq", maxDistanceSq);

        // Set filter parameters
        if (filters != null && !filters.isEmpty()) {
            for (requestFilter filter : filters.values()) {
                if (filter == null || filter.getField() == null || !filter.hasValue()) {
                    continue;
                }
                setFilterParameter(query, filter);
            }
        }

        return query.getResultList();
    }

    @Override
    public List<TravelPackage> findByPackageTypeActiveWithFilters(
            PackageType packageType,
            HashMap<String, requestFilter> filters) {

        StringBuilder jpql = new StringBuilder();
        jpql.append("SELECT p FROM TravelPackage p ");
        jpql.append("WHERE p.status = 'ACTIVE' ");
        jpql.append("AND p.packageType = :packageType ");

        // Add filter conditions
        if (filters != null && !filters.isEmpty()) {
            for (requestFilter filter : filters.values()) {
                if (filter == null || filter.getField() == null || !filter.hasValue()) {
                    continue;
                }
                String condition = buildFilterCondition(filter);
                if (condition != null && !condition.isEmpty()) {
                    jpql.append("AND ").append(condition).append(" ");
                }
            }
        }

        TypedQuery<TravelPackage> query = entityManager.createQuery(jpql.toString(), TravelPackage.class);
        query.setParameter("packageType", packageType);

        // Set filter parameters
        if (filters != null && !filters.isEmpty()) {
            for (requestFilter filter : filters.values()) {
                if (filter == null || filter.getField() == null || !filter.hasValue()) {
                    continue;
                }
                setFilterParameter(query, filter);
            }
        }

        return query.getResultList();
    }

    @Override
    public List<TravelPackage> findAllActivePackagesWithFilters(
            HashMap<String, requestFilter> filters) {

        StringBuilder jpql = new StringBuilder();
        jpql.append("SELECT p FROM TravelPackage p ");
        jpql.append("WHERE p.status = 'ACTIVE' ");

        // Add filter conditions
        if (filters != null && !filters.isEmpty()) {
            for (requestFilter filter : filters.values()) {
                if (filter == null || filter.getField() == null || !filter.hasValue()) {
                    continue;
                }
                String condition = buildFilterCondition(filter);
                if (condition != null && !condition.isEmpty()) {
                    jpql.append("AND ").append(condition).append(" ");
                }
            }
        }

        TypedQuery<TravelPackage> query = entityManager.createQuery(jpql.toString(), TravelPackage.class);

        // Set filter parameters
        if (filters != null && !filters.isEmpty()) {
            for (requestFilter filter : filters.values()) {
                if (filter == null || filter.getField() == null || !filter.hasValue()) {
                    continue;
                }
                setFilterParameter(query, filter);
            }
        }

        return query.getResultList();
    }

    /**
     * Converts a filter object into a JPQL condition string.
     * 
     * Examples:
     * - Filter: field="price", operator=BETWEEN, value=[1000, 5000]
     *   Returns: "p.price BETWEEN :filter_price_min AND :filter_price_max"
     * 
     * - Filter: field="durationDays", operator=EQ, value=5
     *   Returns: "p.durationDays = :filter_durationDays"
     * 
     * - Filter: field="transportation", operator=EQ, value="BUS_AC"
     *   Returns: "p.transportation = :filter_transportation"
     * 
     * These condition strings are then added to the WHERE clause in the SQL query.
     */
    private String buildFilterCondition(requestFilter filter) {
        String field = filter.getField();
        Operator operator = filter.getOperator();
        Object value = filter.getValue();

        if (field == null || operator == null || value == null) {
            return null;
        }

        // "p." is the alias for TravelPackage entity in the JPQL query
        String fieldPath = "p." + field;

        return switch (operator) {
            // For EQUALS: creates "p.fieldName = :filter_fieldName"
            case EQ -> fieldPath + " = :filter_" + field;
            
            // For BETWEEN: creates "p.fieldName BETWEEN :filter_fieldName_min AND :filter_fieldName_max"
            // Example: "p.price BETWEEN :filter_price_min AND :filter_price_max"
            case BETWEEN -> {
                if (value instanceof List) {
                    List<?> values = (List<?>) value;
                    if (values.size() == 2) {
                        yield fieldPath + " BETWEEN :filter_" + field + "_min AND :filter_" + field + "_max";
                    }
                }
                yield null;
            }
            default -> null; // Only EQ and BETWEEN are currently used
        };
    }

    private void setFilterParameter(TypedQuery<TravelPackage> query, requestFilter filter) {
        String field = filter.getField();
        Operator operator = filter.getOperator();
        Object value = filter.getValue();

        if (field == null || operator == null || value == null) {
            return;
        }

        String paramName = "filter_" + field;

        try {
            switch (operator) {
                case EQ:
                    // Handle enum fields (like transportation)
                    if (field.equals("transportation") && value instanceof String) {
                        try {
                            Transportation transportation = Transportation.valueOf((String) value);
                            query.setParameter(paramName, transportation);
                        } catch (IllegalArgumentException e) {
                            // Invalid enum value, skip this filter
                            return;
                        }
                    } else {
                        // For all other fields (featured, durationDays, etc.), use value as-is
                        query.setParameter(paramName, value);
                    }
                    break;

                case BETWEEN:
                    if (value instanceof List) {
                        List<?> values = (List<?>) value;
                        if (values.size() == 2) {
                            query.setParameter(paramName + "_min", values.get(0));
                            query.setParameter(paramName + "_max", values.get(1));
                        }
                    }
                    break;

                case NE:
                case GT:
                case GTE:
                case LT:
                case LTE:
                case LIKE:
                case NOT_LIKE:
                case IN:
                case NOT_IN:
                case IS_NULL:
                case IS_NOT_NULL:
                case AND:
                case OR:
                default:
                    // Only EQ and BETWEEN are currently used
                    break;
            }
        } catch (Exception e) {
            // Skip invalid filters
        }
    }
}
