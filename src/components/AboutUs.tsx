import React, { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Brain,
  Bone,
  Microscope,
  Activity,
  Zap,
  Shield,
  Star,
  Award,
  Target,
  User,
  Quote,
  Clock,
  Baby,
} from "lucide-react";

/* ─────────────── Types ─────────────── */
type TabKey = "overview" | "chairman" | "trustee" | "leadership";

interface AboutUsProps {
  onBack: () => void;
}

/* ─────────────── Component ─────────────── */
const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "chairman", label: "Chairman's Message" },
    { key: "trustee", label: "Trustee" },
    { key: "leadership", label: "Leadership Team" },
  ];

  /* ═══════════════════════════════════════════════════════ */
  /*  TAB 1 — OVERVIEW                                      */
  /* ═══════════════════════════════════════════════════════ */
  const renderOverview = () => (
    <div style={{ animation: "aboutFadeIn .45s ease" }}>
      {/* Hero — Two Columns */}
      <div className="au-grid-2" style={{ gap: 48, marginBottom: 64 }}>
        {/* Left */}
        <div>
          <span className="au-pill" style={{ marginBottom: 20, display: "inline-block" }}>Est. 2005</span>
          <h2 className="au-heading" style={{ fontSize: 42, lineHeight: 1.2, marginBottom: 24 }}>
            Global Expertise,{" "}
            <span style={{ color: "#60a5fa" }}>Home-grown Care</span>
          </h2>
          <p className="au-body" style={{ marginBottom: 16 }}>
            Vikram Hospital, Chennai has been at the forefront of multi-speciality healthcare for
            nearly two decades. Our world-class infrastructure and patient-first philosophy ensure
            every individual receives compassionate, evidence-based treatment backed by the latest
            medical advancements.
          </p>
          <p className="au-body" style={{ marginBottom: 32 }}>
            With a network of centres of excellence spanning cardiology, neurology, orthopaedics,
            oncology, and more, we bring together clinical brilliance and cutting-edge technology
            under one roof — right here in Chennai.
          </p>

          {/* Stats 2×2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { num: "2100+", label: "Beds" },
              { num: "450+", label: "Doctors" },
              { num: "1100+", label: "Nursing Staff" },
              { num: "40L+", label: "Happy Patients" },
            ].map((s) => (
              <div key={s.label} className="au-card" style={{ padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6", marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Image placeholder + floating badge */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: 20,
              background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Shield style={{ width: 72, height: 72, color: "#3b82f6", opacity: 0.25 }} />
          </div>
          {/* Floating badge */}
          <div
            className="au-card"
            style={{
              position: "absolute",
              bottom: -20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              borderRadius: 14,
              boxShadow: "0 12px 36px rgba(0,0,0,.45)",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(249,115,22,.15)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Award style={{ width: 22, height: 22, color: "#f97316" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Best Hospital — Chennai</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Tamil Nadu Healthcare Award</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards — 6 in 3-col */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 64 }}>
        {[
          { icon: Heart, title: "Advanced Cardiology", desc: "Comprehensive heart care with state-of-the-art catheterisation labs and cardiac surgical suites.", color: "#3b82f6" },
          { icon: Brain, title: "Neurology Excellence", desc: "Expert neurologists and neurosurgeons supported by advanced neuroimaging and neuronavigation.", color: "#22c55e" },
          { icon: Bone, title: "Orthopaedics", desc: "Joint replacements, arthroscopy, spine surgery, and sports medicine under one specialised roof.", color: "#f97316" },
          { icon: Microscope, title: "Accurate Diagnostics", desc: "NABL-accredited labs ensuring precision diagnostics with rapid turnaround times.", color: "#a855f7" },
          { icon: Zap, title: "24/7 Emergency Care", desc: "Round-the-clock trauma centre with dedicated emergency physicians and critical care.", color: "#14b8a6" },
          { icon: Baby, title: "IVF & Fertility", desc: "Advanced reproductive medicine with high success rates and compassionate counselling.", color: "#f43f5e" },
        ].map((f) => (
          <div key={f.title} className="au-card au-card-hover" style={{ padding: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${f.color}1a`, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <f.icon style={{ width: 24, height: 24, color: f.color }} />
            </div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 16, marginBottom: 8 }}>{f.title}</div>
            <div className="au-body" style={{ fontSize: 14 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="au-grid-2" style={{ gap: 24, marginBottom: 64 }}>
        {[
          { icon: Target, title: "Our Mission", color: "#3b82f6", text: "To deliver accessible, affordable, and world-class healthcare to every individual, powered by clinical excellence, innovation, and an unwavering commitment to patient well-being." },
          { icon: Star, title: "Our Vision", color: "#f97316", text: "To be South Asia's most trusted healthcare destination — renowned for pioneering treatments, compassionate care, and outcomes that set new benchmarks in modern medicine." },
        ].map((mv) => (
          <div key={mv.title} className="au-card" style={{ padding: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${mv.color}1a`, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <mv.icon style={{ width: 24, height: 24, color: mv.color }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 12 }}>{mv.title}</h3>
            <p className="au-body">{mv.text}</p>
          </div>
        ))}
      </div>

      {/* Awards Timeline */}
      <div>
        <h3 className="au-heading" style={{ fontSize: 28, marginBottom: 28 }}>Awards &amp; Achievements</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { year: "2023", title: "Best Multi-Speciality Hospital — Tamil Nadu", desc: "Awarded by the Tamil Nadu State Health Department for outstanding patient outcomes and facility standards." },
            { year: "2021", title: "NABH Accreditation Renewal", desc: "Successfully renewed NABH accreditation with highest grading for quality and patient safety protocols." },
            { year: "2018", title: "Centre of Excellence — Cardiac Sciences", desc: "Recognised by the Indian Medical Association for pioneering minimally invasive cardiac procedures." },
            { year: "2012", title: "Healthcare Leadership Award — Southern Region", desc: "Honoured for transformative leadership in expanding accessible healthcare across rural Tamil Nadu." },
          ].map((a) => (
            <div key={a.year} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ marginTop: 7, minWidth: 12, height: 12, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px rgba(59,130,246,.45)" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 4 }}>{a.year} — {a.title}</div>
                <p className="au-body" style={{ fontSize: 14 }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════ */
  /*  TAB 2 — CHAIRMAN'S MESSAGE                           */
  /* ═══════════════════════════════════════════════════════ */
  const renderChairman = () => (
    <div style={{ display: "flex", gap: 48, animation: "aboutFadeIn .45s ease" }}>
      {/* Left — Photo card */}
      <div style={{ minWidth: 340, maxWidth: 340 }}>
        <div className="au-card" style={{ borderRadius: 22, overflow: "hidden" }}>
          <div style={{
            height: 260,
            background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User style={{ width: 96, height: 96, color: "rgba(255,255,255,.35)" }} />
          </div>
          <div style={{ padding: "24px 28px", textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 20, marginBottom: 4 }}>Dr. Vikram Raghavan</div>
            <div style={{ fontSize: 14, color: "#3b82f6" }}>Founder & Chairman</div>
          </div>
        </div>
      </div>

      {/* Right — Message */}
      <div style={{ flex: 1 }}>
        <span className="au-pill" style={{ marginBottom: 20, display: "inline-block" }}>Chairman's Message</span>
        <h2 className="au-heading" style={{ fontSize: 36, lineHeight: 1.25, marginBottom: 28 }}>
          A Message from Our Chairman
        </h2>

        {/* Blockquote */}
        <div style={{
          borderLeft: "4px solid #3b82f6",
          padding: "20px 28px",
          background: "rgba(59,130,246,.06)",
          borderRadius: "0 14px 14px 0",
          marginBottom: 28,
        }}>
          <Quote style={{ width: 22, height: 22, color: "#3b82f6", marginBottom: 10, opacity: .6 }} />
          <p style={{ fontStyle: "italic", color: "#94a3b8", lineHeight: 1.75, fontSize: 15 }}>
            "Healthcare is not merely a profession — it is a sacred covenant between healer and patient.
            At Vikram Hospital, every decision we make is guided by one simple question: what is best for
            the person entrusting us with their life?"
          </p>
        </div>

        <p className="au-body" style={{ marginBottom: 18 }}>
          When we opened our doors in 2005, our dream was to create a healthcare institution that combines
          global clinical standards with the warmth of home. Over the years, that dream has grown into a
          sprawling centre of excellence, staffed by some of the finest medical minds in the country.
        </p>
        <p className="au-body" style={{ marginBottom: 18 }}>
          Today, as we serve millions of patients each year, we remain committed to the values that define
          us — clinical rigour, compassionate care, and relentless innovation. We have invested in
          cutting-edge technology, established world-class training programmes, and fostered a culture where
          every member of our team is empowered to make a difference.
        </p>
        <p className="au-body">
          As we look to the future, our resolve is stronger than ever. We will continue to push the
          boundaries of what is possible in medicine, while never losing sight of the human being at the
          centre of it all. Thank you for placing your trust in us.
        </p>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════ */
  /*  TAB 3 — TRUSTEE                                       */
  /* ═══════════════════════════════════════════════════════ */
  const renderTrustee = () => {
    const trustees = [
      { name: "Mr. Arvind Subramanian", role: "Managing Trustee", desc: "A visionary business leader with 30+ years of experience in healthcare management and hospital administration across South India." },
      { name: "Mrs. Lakshmi Narayanan", role: "Trustee — Operations", desc: "Spearheads operational excellence initiatives, streamlining patient flow and embedding quality-first processes hospital-wide." },
      { name: "Dr. Suresh Kumar", role: "Trustee — Medical Affairs", desc: "An eminent surgeon and academic who oversees clinical governance, medical ethics, and research partnerships with international institutions." },
      { name: "Mrs. Priya Venkatesh", role: "Trustee — Community Outreach", desc: "Leads philanthropic programmes, mobile health camps, and rural healthcare initiatives reaching over 200 villages annually." },
    ];

    return (
      <div style={{ animation: "aboutFadeIn .45s ease" }}>
        <span className="au-pill" style={{ marginBottom: 20, display: "inline-block" }}>Our Board</span>
        <h2 className="au-heading" style={{ fontSize: 36, marginBottom: 36 }}>Our Trustees</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {trustees.map((t) => (
            <div key={t.name} className="au-card au-card-hover" style={{ padding: 28, display: "flex", gap: 20, alignItems: "flex-start", borderRadius: 18 }}>
              <div style={{
                minWidth: 56, height: 56, borderRadius: 14,
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User style={{ width: 28, height: 28, color: "rgba(255,255,255,.7)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 17, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600, marginBottom: 10 }}>{t.role}</div>
                <p className="au-body" style={{ fontSize: 14 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════ */
  /*  TAB 4 — LEADERSHIP TEAM                               */
  /* ═══════════════════════════════════════════════════════ */
  const renderLeadership = () => {
    const leaders = [
      { name: "Dr. Anand Krishnamurthy", role: "Chief Medical Officer", dept: "Administration", desc: "Oversees all clinical operations, ensuring adherence to international protocols and patient safety standards across every department." },
      { name: "Dr. Meena Sundaram", role: "Head — Cardiac Sciences", dept: "Cardiology", desc: "Pioneer of minimally invasive cardiac surgery in Chennai with over 8,000 successful procedures and multiple national awards." },
      { name: "Dr. Rajesh Kannan", role: "Head — Neurosciences", dept: "Neurology", desc: "Leading neurologist specialising in stroke management, epilepsy care, and advanced neuro-interventional procedures." },
      { name: "Dr. Kavitha Balaji", role: "Head — Orthopaedics", dept: "Orthopaedics", desc: "Expert in robotic-assisted joint replacements, sports medicine, and complex spine reconstructions." },
      { name: "Dr. Sridhar Iyer", role: "Head — Oncology", dept: "Oncology", desc: "Renowned oncologist driving precision medicine and immunotherapy programmes with global research collaborations." },
      { name: "Ms. Deepa Rajan", role: "Chief Nursing Officer", dept: "Nursing", desc: "Leads the 1,100-strong nursing workforce, championing evidence-based nursing practices and continuous professional development." },
    ];

    return (
      <div style={{ animation: "aboutFadeIn .45s ease" }}>
        <span className="au-pill" style={{ marginBottom: 20, display: "inline-block" }}>Our Leaders</span>
        <h2 className="au-heading" style={{ fontSize: 36, marginBottom: 36 }}>Leadership Team</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {leaders.map((l) => (
            <div key={l.name} className="au-card au-card-hover" style={{ borderRadius: 18, overflow: "hidden" }}>
              {/* Blue gradient photo area */}
              <div style={{
                height: 180,
                background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User style={{ width: 64, height: 64, color: "rgba(255,255,255,.30)" }} />
              </div>
              <div style={{ padding: "22px 24px 26px" }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 17, marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600, marginBottom: 12 }}>{l.role}</div>
                <p className="au-body" style={{ fontSize: 14, marginBottom: 16 }}>{l.desc}</p>
                <span style={{
                  display: "inline-block", fontSize: 12, fontWeight: 600, color: "#60a5fa",
                  background: "rgba(59,130,246,.12)", padding: "5px 14px", borderRadius: 999,
                }}>{l.dept}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════ */
  /*  RENDER                                                */
  /* ═══════════════════════════════════════════════════════ */
  return (
    <div className="au-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');

        @keyframes aboutFadeIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .au-root {
          min-height: 100vh;
          background: #0b0f1a;
          font-family: 'Outfit', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        /* ── Cards ── */
        .au-card {
          background: #141929;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          transition: all .25s ease;
        }
        .au-card-hover:hover {
          background: #1a2236;
          border-color: rgba(59,130,246,.4);
          transform: translateY(-4px);
          box-shadow: 0 14px 44px rgba(59,130,246,.12);
        }

        /* ── Typography ── */
        .au-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }
        .au-body {
          color: #94a3b8;
          line-height: 1.75;
          margin: 0;
          font-size: 15px;
        }
        .au-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #60a5fa;
          background: rgba(59,130,246,.1);
          border: 1px solid rgba(59,130,246,.2);
          padding: 6px 18px;
          border-radius: 999px;
        }

        /* ── 2-col grid helper ── */
        .au-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── Tab bar ── */
        .au-tabbar {
          display: inline-flex;
          gap: 4px;
          padding: 5px;
          background: #141929;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.07);
        }
        .au-tab {
          padding: 10px 26px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all .25s ease;
          font-family: 'Outfit', sans-serif;
          white-space: nowrap;
        }
        .au-tab:hover:not(.au-tab--active) {
          background: rgba(255,255,255,.05);
          color: #cbd5e1;
        }
        .au-tab--active {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: #ffffff;
          box-shadow: 0 4px 18px rgba(59,130,246,.35);
        }

        /* ── Back button ── */
        .au-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 10px 22px;
          cursor: pointer;
          transition: all .25s ease;
          font-family: 'Outfit', sans-serif;
        }
        .au-back:hover {
          background: rgba(255,255,255,.10);
          color: #fff;
          border-color: rgba(255,255,255,.15);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .au-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .au-tabbar {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* ── Header bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(11,15,26,.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        padding: "14px 0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield style={{ width: 22, height: 22, color: "#3b82f6" }} />
            <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>Vikram Hospital</span>
          </div>
          <button className="au-back" onClick={onBack}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Home
          </button>
        </div>
      </header>

      {/* ── Page hero / title ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 28px 0" }}>
        <span className="au-pill" style={{ marginBottom: 18, display: "inline-block" }}>About Vikram Hospital</span>
        <h1 className="au-heading" style={{ fontSize: 48, lineHeight: 1.15, marginBottom: 10 }}>
          Healing Lives,{" "}
          <span style={{ color: "#60a5fa" }}>Inspiring Hope</span>
        </h1>
        <p className="au-body" style={{ maxWidth: 680, marginBottom: 40 }}>
          Discover the people, values, and vision behind Chennai's most trusted multi-speciality hospital.
        </p>
      </section>

      {/* ── Tab navigation ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 40px" }}>
        <div className="au-tabbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`au-tab ${activeTab === tab.key ? "au-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 80px" }}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "chairman" && renderChairman()}
        {activeTab === "trustee" && renderTrustee()}
        {activeTab === "leadership" && renderLeadership()}
      </main>
    </div>
  );
};

export default AboutUs;
