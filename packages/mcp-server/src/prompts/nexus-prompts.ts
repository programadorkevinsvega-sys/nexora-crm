export function registerNexusPrompts() {
  return [
    {
      name: 'nexus_deal_review',
      description: 'Analyze an open deal, predict win probability, examine interaction history, and recommend commercial closing actions.',
      arguments: [
        {
          name: 'dealId',
          description: 'The UUID of the deal to review',
          required: true,
        },
      ],
      handler: (args: { dealId: string }) => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Please perform a comprehensive deal review for deal ID ${args.dealId} using Nexus CRM tools:
1. Call \`nexus_get_deal\` to examine the deal details and stage.
2. Call \`nexus_predict_deal_win\` to check the AI win probability and risk factors.
3. Call \`nexus_get_customer_360\` for the primary contact to review interaction history.
4. Formulate an actionable executive action plan with next best steps to accelerate closing this deal.`,
              },
            },
          ],
        }
      },
    },
    {
      name: 'nexus_customer_health_check',
      description: 'Audit the health of a key customer contact, analyzing support tickets, sentiment, and churn risk.',
      arguments: [
        {
          name: 'contactId',
          description: 'The UUID of the contact to evaluate',
          required: true,
        },
      ],
      handler: (args: { contactId: string }) => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Please conduct a customer health check for contact ID ${args.contactId} using Nexus CRM tools:
1. Call \`nexus_get_contact_summary\` to review executive summary and sentiment.
2. Call \`nexus_predict_churn_risk\` to identify churn indicators and risk percentage.
3. Call \`nexus_get_customer_360\` to verify recent support tickets and quotes.
4. Propose immediate retention or upsell recommendations.`,
              },
            },
          ],
        }
      },
    },
  ]
}
