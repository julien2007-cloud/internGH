import type { Opportunity } from '../data/opportunities'

/**
 * Where "Apply" sends the student. In the live app this would be the
 * organisation's own careers page; the demo uses a stand-in apply page.
 */
export const applyHref = (o: Opportunity) => `#/apply/${o.id}`
