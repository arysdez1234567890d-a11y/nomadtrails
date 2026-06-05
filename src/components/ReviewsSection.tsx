"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signIn } from "next-auth/react";
import { Star, MessageSquare, AlertCircle, CheckCircle2, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Review = {
  id: number;
  name: string;
  avatar?: string | null;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ReviewsSection() {
  const t = useTranslations("reviews");
  const { data: session } = useSession();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch reviews from our database
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load reviews:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (headRef.current) {
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: { trigger: headRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setComment("");
      setRating(5);
      
      // Prepend the newly created review to the local state list
      if (data.review) {
        setReviews((prev) => [data.review, ...prev]);
      }
      
      setTimeout(() => setSuccess(false), 6000);
    } catch (err: any) {
      setError(err?.message || t("error_failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="py-24 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden relative"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#c9a84c]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="text-center mb-16">
          <span className="section-badge inline-block px-4 py-1.5 bg-[#f0f7f4] text-[#1a3d2b] text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3">
            {t("title")}
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl font-black text-[#0d1117] leading-tight">
            {t("title")}
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto mt-4 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Testimonial List (2 Cols on Large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white/80 p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse h-36"
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <MessageSquare className="mx-auto text-gray-300 mb-4" size={40} />
                <p className="text-gray-500 font-medium">No reviews yet. Be the first to leave one!</p>
              </div>
            ) : (
              <motion.div 
                ref={gridRef}
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Rating stars */}
                        <div className="flex items-center gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={`${
                                star <= review.rating
                                  ? "text-[#c9a84c] fill-[#c9a84c]"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium italic">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>

                      {/* Reviewer Meta */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1a3d2b]/10 text-[#1a3d2b] flex items-center justify-center font-bold text-sm">
                            {review.name?.[0]?.toUpperCase() || "T"}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-black text-[#0d1117] leading-tight">
                            {review.name}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            {new Date(review.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Leave a Review Form (1 Col) */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-black/[0.02] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

            <h3 className="font-playfair text-2xl font-bold text-[#0d1117] mb-6 flex items-center gap-3">
              <MessageSquare className="text-[#c9a84c]" size={20} />
              {t("write_review")}
            </h3>

            {session ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* User avatar and welcoming text */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#c9a84c] text-white flex items-center justify-center font-bold text-xs">
                      {session.user?.name?.[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                      Posting as
                    </p>
                    <p className="text-xs font-black text-[#0d1117] truncate mt-0.5">
                      {session.user?.name || session.user?.email}
                    </p>
                  </div>
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    {t("rating")}
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          size={28}
                          className={`${
                            star <= (hoverRating ?? rating)
                              ? "text-[#c9a84c] fill-[#c9a84c]"
                              : "text-gray-200"
                          } transition-colors duration-150`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Testimonial message */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    {t("comment")}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t("comment_placeholder")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1a3d2b] focus:bg-white focus:outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Alert handling */}
                {error && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-xs">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{t("success")}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent w-full py-4 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />
                      {t("submitting")}...
                    </>
                  ) : (
                    t("submit")
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-3xl border border-gray-100 px-4">
                <User className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                  {t("login_required")}
                </p>
                <button
                  onClick={() => signIn()}
                  className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest"
                >
                  {t("login_btn")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
