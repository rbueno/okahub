const defaultDeatline = {
    value: 0,
    unit: null
}

const salesStatus: any = {
    // open
    not_logged: { group: 'open', deadline: defaultDeatline },
    basic_info_incomplete: { group: 'open', deadline: defaultDeatline },
    basic_info_review: { group: 'open', deadline: defaultDeatline },
    document_info_incomplete: { group: 'open', deadline: defaultDeatline },
    document_info_review: { group: 'open', deadline: defaultDeatline },
    analysis: { group: 'open', deadline: defaultDeatline },
    guarantor_needed: { group: 'open', deadline: defaultDeatline },
    guarantor_incomplete: { group: 'open', deadline: defaultDeatline },
    guarantor_review: { group: 'open', deadline: defaultDeatline },
    approved_by_provi: { group: 'open', deadline: defaultDeatline },
    not_approved_by_provi: { group: 'open', deadline: defaultDeatline },
    waiting_signature: { group: 'open', deadline: defaultDeatline },
    logged: { group: 'open', deadline: defaultDeatline },
    shopping_cart_created: { group: 'open', deadline: defaultDeatline },
    // lost
    abandonment_before_signed: { group: 'lost', deadline: null },
    isa_abandonment_after_signed: { group: 'lost', deadline: null },
    abandonment_after_signed: { group: 'lost', deadline: null },
    abandonment_after_upfront: { group: 'lost', deadline: null },
    abandonment_after_settled: { group: 'lost', deadline: null },
    link_inactive: { group: 'lost', deadline: null },
    expired: { group: 'lost', deadline: null },
    denied: { group: 'lost', deadline: null },
    isa_default: { group: 'lost', deadline: null },
    // won
    approved: { group: 'won', deadline: null },
    waiting_payment: { group: 'won', deadline: null },
    made_effective: { group: 'won', deadline: null },
}

// const salesGroup = {
//     open: [
//         { status: 'not_logged', deadline: defaultDeatline},
//         { status: 'basic_info_incomplete', deadline: defaultDeatline},
//         { status: 'basic_info_review', deadline: defaultDeatline},
//         { status: 'document_info_incomplete', deadline: defaultDeatline},
//         { status: 'document_info_review', deadline: defaultDeatline},
//         { status: 'analysis', deadline: defaultDeatline},
//         { status: 'guarantor_needed', deadline: defaultDeatline},
//         { status: 'guarantor_incomplete', deadline: defaultDeatline},
//         { status: 'guarantor_review', deadline: defaultDeatline},
//         { status: 'approved_by_provi', deadline: defaultDeatline},
//         { status: 'not_approved_by_provi', deadline: defaultDeatline},
//         { status: 'waiting_signature', deadline: defaultDeatline},
//         ],
//     won: [],
//     lost: []
// }

export default salesStatus
