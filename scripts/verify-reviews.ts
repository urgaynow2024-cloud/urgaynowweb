import {
  checkReviewAbuse,
  getInitial,
  getPublicReviewerName,
  sanitizeReviewContent,
  sanitizeReviewLine,
  summariseRatings,
  validateReviewSubmission,
  REVIEW_LIMITS,
} from "../lib/reviews";

let pass = 0;
let fail = 0;

function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name}`, detail ?? "");
  }
}

/** Narrows a validation result to the field-error variant. */
function fieldOf(result: ReturnType<typeof validateReviewSubmission>): string | undefined {
  return result.ok || "spam" in result ? undefined : result.field;
}

/** True when the result is a field-level rejection. */
function rejected(result: ReturnType<typeof validateReviewSubmission>): boolean {
  return !result.ok && !("spam" in result);
}

const valid = {
  displayName: "Alex",
  handle: "alex#1234",
  rating: 5,
  content: "This community has been wonderful to me since I joined last year.",
  showUsername: true,
};

console.log("\n== valid submission accepted ==");
const ok = validateReviewSubmission(valid);
check("accepts a valid review", ok.ok);

console.log("\n== honeypot ==");
const honey = validateReviewSubmission({ ...valid, website: "http://spam.example" });
check("honeypot trips", !honey.ok && "spam" in honey && honey.spam === true);

console.log("\n== required fields ==");
const noName = validateReviewSubmission({ ...valid, displayName: "" });
check("rejects empty display name", rejected(noName) && fieldOf(noName) === "displayName");

const shortName = validateReviewSubmission({ ...valid, displayName: "A" });
check("rejects 1-char name", rejected(shortName) && fieldOf(shortName) === "displayName");

const noRating = validateReviewSubmission({ ...valid, rating: 0 });
check("rejects rating 0", rejected(noRating) && fieldOf(noRating) === "rating");

const badRating = validateReviewSubmission({ ...valid, rating: 6 });
check("rejects rating 6", rejected(badRating) && fieldOf(badRating) === "rating");

const nanRating = validateReviewSubmission({ ...valid, rating: "abc" });
check("rejects non-numeric rating", rejected(nanRating) && fieldOf(nanRating) === "rating");

const fracRating = validateReviewSubmission({ ...valid, rating: 3.5 });
check("rejects fractional rating", rejected(fracRating) && fieldOf(fracRating) === "rating");

const shortBody = validateReviewSubmission({ ...valid, content: "too short" });
check("rejects body under min", rejected(shortBody) && fieldOf(shortBody) === "content");

const emptyBody = validateReviewSubmission({ ...valid, content: "" });
check("rejects empty body", rejected(emptyBody) && fieldOf(emptyBody) === "content");

const longBody = validateReviewSubmission({ ...valid, content: "a".repeat(REVIEW_LIMITS.CONTENT_MAX + 50) });
check("rejects body over max", rejected(longBody) && fieldOf(longBody) === "content");

console.log("\n== string coercion ==");
const strRating = validateReviewSubmission({ ...valid, rating: "4" });
check("accepts numeric string rating", strRating.ok && strRating.value.rating === 4);

console.log("\n== XSS / injection ==");
const script = sanitizeReviewContent("Hello <script>alert(1)</script> world this is a long enough review");
check("strips <script> tag", !script.includes("<script") && !script.includes("</script"), script);
check("no angle brackets survive", !/[<>]/.test(script), script);

const imgOnerror = sanitizeReviewContent('<img src=x onerror="alert(1)"> a genuinely long review body here');
check("strips img/onerror", !/img|onerror/i.test(imgOnerror), imgOnerror);

const entity = sanitizeReviewContent("&lt;script&gt;alert(1)&lt;/script&gt; a long enough review body");
check("neutralises encoded tags", !entity.includes("<script"), entity);

const jsUrl = sanitizeReviewLine("javascript:alert(1)", 100);
check("line sanitizer removes brackets", !/[<>{}[\]()]/.test(jsUrl), jsUrl);

const controlChars = sanitizeReviewLine("Ali\u0000ce\u001F", 100);
check("strips control characters", !/[\u0000-\u001F]/.test(controlChars));

console.log("\n== abuse detection ==");
const abusive = checkReviewAbuse({ displayName: "x", handle: "", content: "you are a disgusting slurs nigger person honestly awful" });
check("flags slur content", abusive.abusive === true && abusive.score >= 5, abusive);

const spamLinks = checkReviewAbuse({
  displayName: "seo",
  handle: "",
  content: "buy cheap backlinks https://a.com https://b.com traffic service amazing",
});
check("flags link spam", spamLinks.score >= 3, spamLinks);

const cleanReview = checkReviewAbuse({
  displayName: "Sam",
  handle: "sam#0001",
  content: "The events every week have been a highlight for me. Great vibes all round.",
});
check("clean review scores 0", cleanReview.score === 0 && !cleanReview.abusive, cleanReview);

console.log("\n== privacy ==");
const anon = getPublicReviewerName({ displayName: "Hidden Person", showUsername: false });
check("hides name when opted out", anon === "Anonymous", anon);
const shown = getPublicReviewerName({ displayName: "Visible", showUsername: true });
check("shows name when permitted", shown === "Visible");

console.log("\n== rating summary ==");
const summary = summariseRatings([{ rating: 5 }, { rating: 5 }, { rating: 3 }]);
check("counts total", summary.total === 3, summary);
check("computes average", Math.abs(summary.average - 4.3) < 0.05, summary);
check("distribution 5-star", summary.distribution[4] === 2, summary.distribution);
check("distribution 3-star", summary.distribution[2] === 1, summary.distribution);

const empty = summariseRatings([]);
check("empty summary is safe", empty.total === 0 && empty.average === 0);

console.log("\n== initials ==");
check("initial from name", getInitial("alex") === "A", getInitial("alex"));
check("initial handles empty", getInitial("   ") === "?");

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);