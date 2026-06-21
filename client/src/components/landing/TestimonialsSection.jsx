import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

export function TestimonialsSection() {
  const brands = [
    "Google Cloud", "Razorpay", "Stripe", "Sequoia India", "Linear", "Vercel", 
    "Google Cloud", "Razorpay", "Stripe", "Sequoia India", "Linear", "Vercel" // Duplicate for infinite loop
  ];

  const testimonials = [
    {
      text: "NextGenGrowth completely changed how I freelanced during engineering. I secured three projects from Stripe & Razorpay and got paid securely. My portfolios are now pre-verified!",
      name: "Rohan Sharma",
      role: "Student, IIT Delhi",
      avatar: "RS"
    },
    {
      text: "We hired 4 student developer interns from NextGenGrowth. The AI matching matched them in under 2 hours, and the KYC validation saved us weeks of background checks. Exceptional talent quality.",
      name: "Aditi Rao",
      role: "CTO, Finova Tech",
      avatar: "AR"
    },
    {
      text: "The escrow payment infrastructure is a game-changer. I don't have to chase clients for invoices anymore. Everything is automated, clear, and prompt. Recommended for all student devs.",
      name: "Kabir Mehta",
      role: "Student, BITS Pilani",
      avatar: "KM"
    },
    {
      text: "NextGenGrowth allowed us to source high-fidelity UI designers for micro-tasks instantly. The milestone billing works seamlessly and compliance is handled automatically. A must-use for high-growth startups.",
      name: "Sarah Lin",
      role: "Operations Head, Vercel",
      avatar: "SL"
    }
  ];

  // Duplicate testimonials array for continuous marquee loop
  const doubleTestimonials = [...testimonials, ...testimonials];

  return (
    <>
      {/* Brand Partners Infinite Marquee */}
      <section className="lp-brands">
        <div className="lp-brands-marquee">
          <div className="lp-brands-track">
            {brands.map((brand, i) => (
              <div key={i} className="lp-brand-logo">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="lp-testimonials">
        <div className="lp-container">
          <div className="lp-features-header" style={{ marginBottom: '20px' }}>
            <div className="lp-hero-pill">
              <Sparkles size={14} /> Global Success
            </div>
            <h2 className="lp-title-section">
              Endorsed by the <span>Ecosystem</span>
            </h2>
            <p className="lp-subtitle">
              Read how NextGenGrowth is helping brands build high-velocity products and empowering students across India to fund their education and careers.
            </p>
          </div>
        </div>

        {/* Testimonial Marquee Slider */}
        <div className="lp-marquee-container">
          <div className="lp-marquee-track">
            {doubleTestimonials.map((t, i) => (
              <div key={i} className="lp-testimonial-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Quote size={24} color="rgba(52, 211, 153, 0.4)" />
                  <span style={{ fontSize: '0.78rem', color: 'rgba(52, 211, 153, 0.8)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(52, 211, 153, 0.05)' }}>
                    Verified Match
                  </span>
                </div>
                
                <p className="lp-testimonial-text">
                  "{t.text}"
                </p>

                <div className="lp-testimonial-user">
                  <div className="lp-user-avatar">
                    {t.avatar}
                  </div>
                  <div className="lp-user-info">
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
