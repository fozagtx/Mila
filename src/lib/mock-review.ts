import type { DealReview } from "./types";

/** Optional walkthrough only. Not a review of a real PDF. */
export const MOCK_REVIEW: DealReview = {
  title: "Station operator agreement (mock)",
  parties: ["Harborline Retail", "Ama Serwaa"],
  overallSeverity: "critical",
  verdict:
    "This is a mock walkthrough, not a review of a real file. The first page only asks for a portion of the station. Later pages hide assignment, step-in, and transfer language that lets Harborline take the site and every cedi it makes. Do not agree to a live contract that looks like this until the real employee reads your PDF and a lawyer reads the final draft.",
  jargon: [
    {
      term: "Mandatory site yield share",
      plainEnglish:
        "A cut of everything the station earns is theirs first, taken before you are paid, and the cut can grow if they change a schedule you never see.",
      excerpt:
        "Operator shall remit the Mandatory Site Yield Share of all Station Gross Receipts, as adjusted from time to time in the Fee Appendix.",
      severity: "critical",
      whyBeforeYouAgree:
        "You can keep opening the shop every day and still lose most of what the station makes.",
      negotiateFor:
        "Fix the share as a number in the contract, cap it, and require your written consent before it changes.",
    },
    {
      term: "Beneficial interest in the Station",
      plainEnglish:
        "They call it a share of operations, but the wording gives them an ownership stake in the pumps, the lease, and the goodwill, not just a fee.",
      excerpt:
        "Company shall hold a beneficial interest in the Station equal to the Yield Share, including fixtures, goodwill, and location rights.",
      severity: "critical",
      whyBeforeYouAgree:
        "A fee becomes a claim on the station itself, which is how they start to take it over.",
      negotiateFor:
        "Say they are a supplier or brand partner only. No interest in the land, lease, or goodwill.",
    },
    {
      term: "Irrevocable revenue assignment",
      plainEnglish:
        "The station’s takings are treated as already theirs. Card settlements, cash drops, and shop sales can go to their account without another signature from you.",
      excerpt:
        "Operator hereby irrevocably assigns all Station Revenue, including retail, services, and ancillary fees, to Company.",
      severity: "critical",
      whyBeforeYouAgree:
        "They can empty the revenue even while you still stand behind the counter.",
      negotiateFor:
        "Delete the assignment. Pay them an invoice. Keep the till and the merchant account in your name.",
    },
    {
      term: "Step-in and quiet title",
      plainEnglish:
        "If they say you missed a remittance, they can walk in, take the pumps, the lease, the licences, and the location, and run the station as theirs.",
      excerpt:
        "Upon any Remittance Default, Company may step in, assume quiet title to the Station, and operate it for its own account.",
      severity: "critical",
      whyBeforeYouAgree:
        "A late transfer can be used to seize the station and keep every cedi it makes.",
      negotiateFor:
        "No seizure for a first delay. Give written notice and a cure period. Title and the lease stay with you.",
    },
    {
      term: "Further assurances",
      plainEnglish:
        "You promise in advance to sign whatever extra papers they later say are needed to move the station, the licences, or the bank mandate into their name.",
      excerpt:
        "Operator shall execute all further documents reasonably required to perfect Company’s interest in the Station and its revenue.",
      severity: "high",
      whyBeforeYouAgree:
        "The takeover does not need a new fight. You already agreed to sign it through.",
      negotiateFor:
        "Limit this to papers that match the signed deal. No transfers of title, lease, or accounts.",
    },
    {
      term: "Broad audit and sweep rights",
      plainEnglish:
        "They can demand till reports, merchant-account access, and remote lockouts, then sweep any balance they call “unremitted share.”",
      excerpt:
        "Company may audit Operator accounts and sweep Unremitted Share without further consent.",
      severity: "high",
      whyBeforeYouAgree:
        "Audit language becomes a key to the bank account, not just a look at the books.",
      negotiateFor:
        "Read-only reports only. No remote lockout. No sweep of your account.",
    },
    {
      term: "Exclusive offtake of shop sales",
      plainEnglish:
        "They can require the shop, the bay, and any side trade to sell only through them, so even the extra revenue is routed into the same assignment.",
      excerpt:
        "All ancillary Station trade shall be conducted exclusively through Company channels.",
      severity: "high",
      whyBeforeYouAgree:
        "The portion of the station they asked for becomes all of the trade, not just fuel.",
      negotiateFor:
        "You keep the right to run the shop and side sales yourself, outside their share.",
    },
    {
      term: "Automatic rollover",
      plainEnglish:
        "If you miss a short window, the deal renews and the share stays in place, so walking away is harder than it looks.",
      excerpt:
        "This Agreement shall automatically renew unless Operator gives ninety (90) days’ prior written notice.",
      severity: "medium",
      whyBeforeYouAgree:
        "You can stay bound to the cut and the step-in clause longer than you meant to.",
      negotiateFor:
        "End dates should be firm. Renewal only if both sides sign again.",
    },
  ],
  email: {
    subject: "Changes required before I can sign the station operator agreement",
    body: `Hi,

Thank you for the operator agreement. I want the station to keep running, but I cannot sign it as written.

The first pages ask for a portion of the station. Later pages hide assignment, beneficial interest, step-in, further assurances, and sweep rights that would let you take the site and its revenue. I will not agree to that.

Please send a revised draft that does all of the following:

1. States the site share as a fixed percentage that cannot change without my written consent.
2. Says you are a brand or supply partner only. No beneficial interest in the land, lease, fixtures, or goodwill.
3. Deletes the irrevocable assignment of station revenue. I will pay any agreed fee from an account I control.
4. Removes quiet title and step-in. The lease, licences, and location stay mine. A late remittance gets notice and time to cure, not a seizure.
5. Limits further assurances to papers that match this deal. I will not pre-sign a transfer of the station.
6. Limits audit to read-only reports. No remote lockout and no sweep of my account.
7. Leaves shop and side sales with me, outside any share.
8. Ends on a fixed date unless we both sign a renewal.

I am ready to sign a version that keeps the station and its revenue with me. Thank you.

Ama`,
  },
};
