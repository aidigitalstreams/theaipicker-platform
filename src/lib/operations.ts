export interface ToolSubscription {
  name: string;
  monthlyCostGbp: number;
  status: 'active' | 'planned';
  notes?: string;
}

export interface DomainAsset {
  domain: string;
  registrar: string;
  annualCostGbp: number;
  notes?: string;
}

// Tool + domain costs from CLAUDE.md §6 — the Owner-approved subscription list.
export const ACTIVE_TOOLS: ToolSubscription[] = [
  { name: 'Claude Pro/Max', monthlyCostGbp: 125, status: 'active', notes: 'Operations partner — funded by Owner during startup phase.' },
  { name: 'Hostinger (Business + AI, 48mo)', monthlyCostGbp: 2.99, status: 'active', notes: 'Hosts theaipicker.com WordPress + future Next.js cutover.' },
];

export const PLANNED_TOOLS: ToolSubscription[] = [
  { name: 'KeySearch', monthlyCostGbp: 14, status: 'planned', notes: 'Keyword research — needs Owner approval before signup.' },
  { name: 'ConvertKit / Beehiiv', monthlyCostGbp: 25, status: 'planned', notes: 'Email platform once free tools section is ready.' },
  { name: 'Ahrefs / Semrush', monthlyCostGbp: 90, status: 'planned', notes: 'Heavyweight SEO — when revenue justifies.' },
];

export const DOMAINS: DomainAsset[] = [
  { domain: 'theaipicker.com', registrar: 'Namecheap', annualCostGbp: 10, notes: 'Stream #1 primary' },
  { domain: 'theaipicker.co.uk', registrar: 'Namecheap', annualCostGbp: 7, notes: 'Stream #1 UK redirect → .com' },
  { domain: 'aidigitalstreams.com', registrar: 'Namecheap', annualCostGbp: 9, notes: 'Parent business — dashboard / reporting' },
  { domain: 'aidigitalstreams.co.uk', registrar: 'Namecheap', annualCostGbp: 4, notes: 'Parent UK redirect' },
];

export interface RevenueMilestone {
  amount: number;
  label: string;
  reached?: boolean;
}

// Pulled from CLAUDE.md §7 Revenue Milestones.
export const REVENUE_MILESTONES: RevenueMilestone[] = [
  { amount: 50, label: 'Proof of concept' },
  { amount: 100, label: 'Pace validated' },
  { amount: 250, label: 'Self-sustaining (covers all costs)' },
  { amount: 500, label: 'Begin second content vertical' },
  { amount: 750, label: 'Premium SEO tools' },
  { amount: 1000, label: 'Owner reduces outside work hours' },
  { amount: 1250, label: 'Owner full-time on the business' },
  { amount: 2500, label: 'Hire human contractors' },
  { amount: 5000, label: 'Multi-site, expansion mode' },
];

export interface OperationalCostSummary {
  monthlyActiveCostGbp: number;
  monthlyPlannedCostGbp: number;
  annualDomainsGbp: number;
}

export function summariseCosts(): OperationalCostSummary {
  const monthlyActiveCostGbp = ACTIVE_TOOLS.reduce((acc, t) => acc + t.monthlyCostGbp, 0);
  const monthlyPlannedCostGbp = PLANNED_TOOLS.reduce((acc, t) => acc + t.monthlyCostGbp, 0);
  const annualDomainsGbp = DOMAINS.reduce((acc, d) => acc + d.annualCostGbp, 0);
  return { monthlyActiveCostGbp, monthlyPlannedCostGbp, annualDomainsGbp };
}
