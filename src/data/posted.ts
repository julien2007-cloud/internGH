// Listings posted from the "Post an opportunity" page. Postings published with the
// publisher code live on the server (/api/listings) and are shared with everyone;
// the rest are kept on this device in localStorage. Both are merged into
// OPPORTUNITIES so every part of the app (feed, assistant, apply page) sees them.
import type { OppDetails } from './details'
import { registerDetails } from './details'
import type { Opportunity } from './opportunities'
import { OPPORTUNITIES } from './opportunities'

const KEY = 'igh.posted'

export interface PostedListing {
  opp: Opportunity
  details: OppDetails
}

function read(): PostedListing[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as PostedListing[]
  } catch {
    return []
  }
}

function add({ opp, details }: PostedListing) {
  if (OPPORTUNITIES.some(o => o.id === opp.id)) return
  OPPORTUNITIES.unshift(opp)
  registerDetails(opp.id, details)
}

/** Call once at startup, before the first render. */
export function loadPosted() {
  read().forEach(add)
}

/** Save on this device only. */
export function publish(listing: PostedListing) {
  try {
    localStorage.setItem(KEY, JSON.stringify([listing, ...read()]))
  } catch {
    // storage unavailable; the listing still shows until the page reloads
  }
  add(listing)
}

/** Merge postings from the server; returns how many were new. */
export function mergeShared(listings: PostedListing[]) {
  const before = OPPORTUNITIES.length
  listings.forEach(add)
  return OPPORTUNITIES.length - before
}
