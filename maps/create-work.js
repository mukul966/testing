const payment_terms_map = {
    0: "Same day",
    1: "1 day after invoice generation",
    2: "1 week after invoice generation",
    3: "15 days after invoice generation",
    4: "1 month after invoice generation"
}

const payment_frequency_map = {
    0: "Weekly",
    1: "Monthly",
    2: "Quarterly"
}

const project_type_map = {
    0: "resource_hourly_rate",
    1: "project_hourly_rate",
    2: "fixed_fee"
}

const project_type_response_map = {
    0: "Resource hourly rate",
    1: "Project hourly rate",
    2: "Fixed fee"
}

/** Work sharing data
 * work_status: shared | drafts
 * sharing: marketplace | privately | both
 * completion_status: complete | incomplete
 */

module.exports = {
    payment_terms_map,
    project_type_response_map
}