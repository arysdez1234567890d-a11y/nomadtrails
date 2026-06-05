"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, MapPin, Send, MessageCircle, Check, Loader2, AlertCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, scrollTrigger: { trigger: headRef.current, start: "top 85%" } });
    if (sectionRef.current) {
      gsap.fromTo(sectionRef.current.querySelectorAll(".contact-col"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err?.message || "Failed to send. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={sectionRef} id="contact" style={{ padding: "7rem 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-badge">{t("title")}</span>
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle" style={{ margin: "0.75rem auto 0" }}>{t("subtitle")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "4rem", alignItems: "start" }}>
          {/* Info Panel */}
          <div className="contact-col" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ background: "linear-gradient(135deg,#1a3d2b,#2d6a4f)", borderRadius: 20, padding: "2.5rem", color: "#fff" }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.75rem" }}>{tc("site_name")}</h3>
              {[
                { icon: Phone, text: t("phone") },
                { icon: MapPin, text: t("address") },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "1.25rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color="#c9a84c" />
                  </div>
                  <span style={{ fontSize: "0.92rem", opacity: 0.9 }}>{text}</span>
                </div>
              ))}
              <a href={`https://wa.me/996700123456`} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem", textDecoration: "none" }}>
                <MessageCircle size={16} /> {t("whatsapp")}
              </a>
            </div>

            {/* Map placeholder */}
            <div style={{ borderRadius: 20, overflow: "hidden", height: 220, background: "linear-gradient(135deg,#e9ecef,#dee2e6)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d768131.6186699576!2d74.00!3d42.87!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b5e6b3f8d7abcd%3A0x12345!2sBishkek%2C+Kyrgyzstan!5e0!3m2!1sen!2sus!4v1620000000000" style={{ width: "100%", height: "100%", border: "none" }} title="Bishkek Map" loading="lazy" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-col" style={{ background: "#f8f9fa", borderRadius: 20, padding: "2.5rem", border: "1px solid rgba(0,0,0,0.05)" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#40916c" }}>
                <Check size={48} style={{ margin: "0 auto 1rem" }} />
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{t("success")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  {[
                    { key: "name", label: t("name"), type: "text" },
                    { key: "email", label: t("email"), type: "email" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#343a40", marginBottom: "0.4rem" }}>{label}</label>
                      <input type={type} required className="input-field" value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} disabled={loading} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#343a40", marginBottom: "0.4rem" }}>{t("subject")}</label>
                  <input type="text" className="input-field" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} disabled={loading} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#343a40", marginBottom: "0.4rem" }}>{t("message")}</label>
                  <textarea className="input-field" rows={5} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: "vertical" }} disabled={loading} />
                </div>
                
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#c0392b", background: "#fdf2f2", border: "1px solid #fde2e2", borderRadius: 12, padding: "0.8rem 1rem", fontSize: "0.8rem", fontWeight: 600 }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: "flex-end", padding: "0.85rem 2.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />
                      {t("send")}...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> {t("send")}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          #contact > div > div:last-child { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
