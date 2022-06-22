const defaultDeatline = {
    value: 0,
    unit: null
}

export const proviStatus: any = {
    
    // ============================== sales status ==============================

    // open
    not_logged: { group: 'open', deadline: defaultDeatline },
    basic_info_incomplete: { group: 'open', deadline: defaultDeatline },
    basic_info_review: { group: 'open', deadline: defaultDeatline },
    document_info_incomplete: { group: 'open', deadline: defaultDeatline },
    document_info_review: { group: 'open', deadline: defaultDeatline },
    guarantor_needed: { group: 'open', deadline: defaultDeatline },
    guarantor_incomplete: { group: 'open', deadline: defaultDeatline },
    guarantor_review: { group: 'open', deadline: defaultDeatline },
    not_approved_by_provi: { group: 'open', deadline: defaultDeatline },
    logged: { group: 'open', deadline: defaultDeatline },
    shopping_cart_created: { group: 'open', deadline: defaultDeatline },

    // waiting conclusion
    approved_by_provi: { group: 'waitingConclusion', deadline: defaultDeatline },
    analysis: { group: 'waitingConclusion', deadline: defaultDeatline },
    waiting_signature: { group: 'waitingConclusion', deadline: defaultDeatline },
    waiting_payment: { group: 'waitingConclusion', deadline: null },
    approved: { group: 'waitingConclusion', deadline: null },

    // lost
    abandonment_before_signed: { group: 'lost', deadline: null },
    link_inactive: { group: 'lost', deadline: null },
    expired: { group: 'lost', deadline: null },
    denied: { group: 'lost', deadline: null },

    // won
    made_effective: { group: 'won', deadline: null },

    // ============================== student status ==============================

    // regular
    effective: { group: 'regular', deadline: defaultDeatline },
    studying: { group: 'regular', deadline: defaultDeatline },
    pending: { group: 'regular', deadline: defaultDeatline },
    paid: { group: 'regular', deadline: defaultDeatline },
    
    // geral (isa)
    awaiting_declaration: { group: 'regular', deadline: defaultDeatline },
    late_declaration: { group: 'regular', deadline: defaultDeatline },
    declaration_analysis: { group: 'regular', deadline: defaultDeatline },
    declaration_review: { group: 'regular', deadline: defaultDeatline },
    no_income: { group: 'regular', deadline: defaultDeatline },
    income_below_min: { group: 'regular', deadline: defaultDeatline },
    
    // irregular
    late: { group: 'irregular', deadline: defaultDeatline },
    protest: { group: 'irregular', deadline: defaultDeatline },
    negativated: { group: 'irregular', deadline: defaultDeatline },
    isa_abandonment_after_signed: { group: 'lost', deadline: null },
    default: { group: 'irregular', deadline: defaultDeatline },
    
    // concluded
    fully_paid: { group: 'concluded', deadline: defaultDeatline },
    
    // churn
    abandonment_after_settled: { group: 'churn', deadline: defaultDeatline },
    abandonment_after_upfront: { group: 'churn', deadline: defaultDeatline },
    abandonment_after_signed: { group: 'churn', deadline: defaultDeatline },
    isa_default: { group: 'irregular', deadline: defaultDeatline },

}

export const apiReferences = {
    baseURL: {
        production: 'https://ms-checkout.provi.com.br',
        development: 'https://ms-checkout-staging.provi.com.br'
    },
    v4: {
        webhookPreferences: {
            create: '/v4/webhook/preference',
            update: '/v4/webhook-endpoint',
            delete: '/v4/webhook/preference' // /:id
        },
        sales: {
            get: '/v4/sales'
        }
    }
}
