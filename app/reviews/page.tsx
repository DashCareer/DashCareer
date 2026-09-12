import { Star } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, signInPath } from "@/app/auth-session";
import { submitReviewAction } from "@/app/actions";
import { listApprovedReviews } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ status }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const reviews = await listApprovedReviews().catch(() => []);
  return (
    <main className="shell page-space reviews-page">
      <div className="page-intro"><p className="eyebrow">Student reviews</p><h1>What students think.</h1><p>Reviews are linked to signed-in accounts and checked before they appear publicly.</p></div>
      {status === "submitted" && <div className="notice success">Thanks—your review was saved and is waiting for moderation.</div>}
      {status === "invalid" && <div className="notice error">Choose a rating and write between 20 and 600 characters.</div>}
      <div className="reviews-layout"><section className="review-wall" aria-label="Published reviews">{reviews.length ? reviews.map((review) => <article className="review-card" key={review.id}><div className="stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={17} fill={i < review.rating ? "currentColor" : "none"} />)}</div><p>“{review.body}”</p><span>{review.display_name} · verified account</span></article>) : <div className="empty-state"><h2>No published reviews yet.</h2><p>Be the first student to submit thoughtful feedback.</p></div>}</section>
        <aside className="review-form-card"><p className="eyebrow">Leave a review</p><h2>Share your experience</h2>{user ? <form action={submitReviewAction}><label>Rating<NativeSelect name="rating" required defaultValue=""><NativeSelectOption value="" disabled>Choose a rating</NativeSelectOption><NativeSelectOption value="5">5 — Excellent</NativeSelectOption><NativeSelectOption value="4">4 — Good</NativeSelectOption><NativeSelectOption value="3">3 — Okay</NativeSelectOption><NativeSelectOption value="2">2 — Needs work</NativeSelectOption><NativeSelectOption value="1">1 — Poor</NativeSelectOption></NativeSelect></label><label>Review<Textarea name="body" minLength={20} maxLength={600} required placeholder="What helped you, and what could be better?" /></label><button className="button primary" type="submit">Submit for review</button><small>One review per account. Resubmitting replaces your pending review.</small></form> : <div className="signin-panel"><p>Sign in first so reviews stay genuine.</p><a className="button primary" href={signInPath("/reviews")} target="_top">Sign in to review</a></div>}</aside>
      </div>
    </main>
  );
}
