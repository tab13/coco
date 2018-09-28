export default {
    /**
     * Item status
     */
    STATUS_PENDING : 1,

    // No items shipped, invoiced, canceled, refunded nor backordered
    STATUS_SHIPPED : 2,

    // When qty ordered - [qty canceled + qty returned] = qty shipped
    STATUS_INVOICED : 9,

    // When qty ordered - [qty canceled + qty returned] = qty invoiced
    STATUS_BACKORDERED : 3,

    // When qty ordered - [qty canceled + qty returned] = qty backordered
    STATUS_CANCELED : 5,

    // When qty ordered = qty canceled
    STATUS_PARTIAL : 6,

    // If [qty shipped or(max of two) qty invoiced + qty canceled + qty returned]
    // < qty ordered
    STATUS_MIXED : 7,

    // All other combinations
    STATUS_REFUNDED : 8,

    // When qty ordered = qty refunded
    STATUS_RETURNED : 4
}
