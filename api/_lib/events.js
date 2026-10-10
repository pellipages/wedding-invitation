// Server-side catalogue of events a guest can pick. This is the allow-list used to validate
// RSVPs, and the source of labels shown in the admin book + CSV (never trusted from the client).
// Keys must match `k` in card/js/data.js and the check constraint in migrations/001_rsvp_events.sql.
export const EVENTS = [
  { key: 'pellikuthuru', label: 'Pellikuthuru' },
  { key: 'pellikoduku',  label: 'Pellikoduku' },
  { key: 'haldi',        label: 'Haldi' },
  { key: 'mehendi',      label: 'Mehendi' },
  { key: 'sangeeth',     label: 'Sangeeth' },
  { key: 'pelli',        label: 'The Pelli' },
];

export const EVENT_KEYS = new Set(EVENTS.map(e => e.key));
export const EVENT_LABELS = Object.fromEntries(EVENTS.map(e => [e.key, e.label]));
