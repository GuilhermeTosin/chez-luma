import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src={imageUrl} alt="Agrandi" />
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      <div className="faq-answer">{answer}</div>
    </div>
  );
};

const FAQ = ({ t }) => (
  <section className="section-padding bg-light">
    <div className="container">
      <h2 className="text-primary" style={{ textAlign: 'center' }}>{t('faq_title')}</h2>
      <div className="faq-container">
        <FAQItem question={t('faq_q1')} answer={t('faq_a1')} />
        <FAQItem question={t('faq_q2')} answer={t('faq_a2')} />
        <FAQItem question={t('faq_q3')} answer={t('faq_a3')} />
        <FAQItem question={t('faq_q4')} answer={t('faq_a4')} />
      </div>
    </div>
  </section>
);

const Calendar = ({ t, isAdmin, showAdminLogin, adminPassword, setAdminPassword, handleAdminLogin }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selection, setSelection] = useState({ start: null, end: null });

  // Persistent Availability State
  const [availability, setAvailability] = useState(() => {
    const saved = localStorage.getItem('dogSittingAvailability');
    return saved ? JSON.parse(saved) : {};
  });

  const saveAvailability = (newAvail) => {
    setAvailability(newAvail);
    localStorage.setItem('dogSittingAvailability', JSON.stringify(newAvail));
  };

  const month = selectedMonth.getMonth();
  const year = selectedMonth.getFullYear();
  const days = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const dateKey = `${year}-${month}-${day}`;
    const currentStatus = availability[dateKey] || 'available';

    if (isAdmin) {
      // Admin Toggle: Available -> Pending -> Booked -> Available
      const next = currentStatus === 'available' ? 'pending' : currentStatus === 'pending' ? 'booked' : 'available';
      saveAvailability({ ...availability, [dateKey]: next });
    } else {
      // Client Selection: Select Range
      
      // Block past dates
      const today = new Date();
      today.setHours(0,0,0,0);
      const clickedDate = new Date(year, month, day);
      if (clickedDate < today) return;

      // Block click if date is not available
      if (currentStatus !== 'available') return;

      if (!selection.start || (selection.start && selection.end)) {
        setSelection({ start: day, end: null });
      } else if (day > selection.start) {
        // Validation: Verify if there are any booked/pending dates in the range
        let isRangeBlocked = false;
        for (let d = selection.start; d <= day; d++) {
          const dKey = `${year}-${month}-${d}`;
          if ((availability[dKey] || 'available') !== 'available') {
            isRangeBlocked = true;
            break;
          }
        }

        if (!isRangeBlocked) {
          setSelection({ ...selection, end: day });
        } else {
          alert("Certaines dates de cette période sont déjà réservées. Veuillez choisir un autre intervalle.");
          setSelection({ start: day, end: null });
        }
      } else {
        setSelection({ start: day, end: null });
      }
    }
  };



  const getDayClass = (day) => {
    if (!day) return 'day-cell day-empty';
    const dateKey = `${year}-${month}-${day}`;
    const status = availability[dateKey] || 'available';
    let classes = `day-cell day-${status}`;

    if (!isAdmin && selection.start) {
      if (day === selection.start || day === selection.end || (day > selection.start && day < selection.end)) {
        classes += ' day-selected';
      }
    }

    // Mark past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateOfCell = new Date(year, month, day);
    if (day && dateOfCell < today) {
      classes += ' day-past';
    }

    return classes;
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= days; i++) calendarDays.push(i);

  const formatSelection = () => {
    if (!selection.start) return "";
    const startStr = `${selection.start} ${selectedMonth.toLocaleString('default', { month: 'short' })}`;
    if (!selection.end) return startStr;
    return `${startStr} - ${selection.end} ${selectedMonth.toLocaleString('default', { month: 'short' })}`;
  };

  return (
    <div className="container section-padding fade-in" id="booking">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 className="text-primary" style={{ margin: 0 }}>{t('calendar_title')}</h2>
      </div>

      {isAdmin && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="admin-mode-indicator">MODE ÉDITION ACTIF</span>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Cliquez sur un jour pour changer son statut.</p>
        </div>
      )}

      <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '30px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ textTransform: 'capitalize' }}>{selectedMonth.toLocaleString('default', { month: 'long' })} {year}</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="lang-switch" onClick={() => setSelectedMonth(new Date(year, month - 1, 1))}>&lt;</button>
            <button className="lang-switch" onClick={() => setSelectedMonth(new Date(year, month + 1, 1))}>&gt;</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
          {(i18n.language === 'fr' ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((d, index) => <div key={index} style={{ fontWeight: 'bold', color: 'var(--color-primary)', paddingBottom: '10px' }}>{d}</div>)}
          {calendarDays.map((day, i) => {
            const dateKey = `${year}-${month}-${day}`;
            const status = availability[dateKey] || 'available';
            return (
              <div key={i} className={getDayClass(day)} onClick={() => day && handleDateClick(day)}>
                {day}
                {day && status !== 'available' && <span className="status-label">{status === 'pending' ? t('calendar_status_pending') : t('calendar_status_booked')}</span>}
              </div>
            );
          })}
        </div>

        {!isAdmin && selection.start && (
          <form
            action="https://formspree.io/f/xoqgeqzb"
            method="POST"
            className="booking-form"
          >
            <h3 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>{t('form_title')}</h3>

            <div className="form-grid">
              <div className="input-group">
                <label>{t('form_name')} <span>*</span></label>
                <input type="text" name="name" required placeholder="Ex: Jean Dupont" />
              </div>
              <div className="input-group">
                <label>{t('form_phone')} <span>*</span></label>
                <input type="tel" name="phone" required placeholder="514-000-0000" />
              </div>
              <div className="input-group">
                <label>{t('form_email')} <span>*</span></label>
                <input type="email" name="email" required placeholder="votre@email.com" />
              </div>
              <div className="input-group">
                <label>{t('form_dates')}</label>
                <input type="text" name="dates" readOnly value={formatSelection()} style={{ backgroundColor: '#eee' }} />
              </div>
              <div className="input-group form-full-width">
                <label>{t('form_message')}</label>
                <textarea name="message" rows="4"></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button type="submit" className="btn-primary" style={{ border: 'none', cursor: 'pointer' }}>{t('form_submit')}</button>
              <button type="button" className="lang-switch" onClick={() => setSelection({ start: null, end: null })}>{t('form_reset')}</button>
            </div>

            <p style={{ fontSize: '0.8rem', marginTop: '1.5rem', opacity: '0.6' }}>
              {t('form_disclaimer')}
            </p>
          </form>
        )}

        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #eee' }}></div>
            <span style={{ fontSize: '0.9rem' }}>{t('calendar_label_available')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: '#FEFAE0', borderRadius: '6px', border: '1px solid #E9EDC9' }}></div>
            <span style={{ fontSize: '0.9rem' }}>{t('calendar_label_pending')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(224, 122, 95, 0.1)', borderRadius: '6px', border: '1px solid rgba(224, 122, 95, 0.2)' }}></div>
            <span style={{ fontSize: '0.9rem' }}>{t('calendar_label_booked')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = ({ t, isAdmin, showAdminLogin, adminPassword, setAdminPassword, handleAdminLogin }) => {
  const desktopHero = i18n.language === 'fr' ? '/images/hero-desktop-fr.jpg' : '/images/hero-desktop-en.jpg';
  const mobileHero = i18n.language === 'fr' ? '/images/hero-mobile-fr.jpg' : '/images/hero-mobile-en.jpg';

  return (
    <>
      <div className="hero fade-in" style={{
        '--hero-url': `url("${desktopHero}")`,
        '--hero-mobile-url': `url("${mobileHero}")`
      }}>
        <div className="hero-content">
          <h1>{t('hero_title')}</h1>
          <p>{t('hero_subtitle')}</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a href="#booking" className="btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }) }}>{t('hero_cta')}</a>
          </div>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
          <h2 className="text-primary" style={{ textAlign: 'center' }}>{t('why_title')}</h2>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">✨</span>
              <h3>{t('trust_1_title')}</h3>
              <p>{t('trust_1_desc')}</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🏠</span>
              <h3>{t('trust_2_title')}</h3>
              <p>{t('trust_2_desc')}</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🌿</span>
              <h3>{t('trust_3_title')}</h3>
              <p>{t('trust_3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f9f7f0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 className="text-primary" style={{ marginBottom: '2rem' }}>{t('service_title')}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('service_desc1')}</p>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{t('service_desc2')}</p>
            <ul style={{ listStyle: 'none', lineHeight: '2.5', fontSize: '1.1rem', marginBottom: '2rem' }}>
              <li>{t('service_list1')}</li>
              <li>{t('service_list2')}</li>
              <li>{t('service_list3')}</li>
              <li>{t('service_list4')}</li>
            </ul>
            <a href="#booking" className="btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }) }}>{t('hero_cta')}</a>
          </div>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <img
              src="/images/service-home.jpg"
              alt={t('alt_service_home')}
              title={t('alt_service_home')}
              style={{ width: '100%', borderRadius: '40px', boxShadow: 'var(--shadow-lg)' }}
            />
          </div>
        </div>
      </section>


      <Testimonials t={t} />
      <Calendar t={t} isAdmin={isAdmin} showAdminLogin={showAdminLogin} adminPassword={adminPassword} setAdminPassword={setAdminPassword} handleAdminLogin={handleAdminLogin} />
      <FAQ t={t} />
    </>
  );
};

const Gallery = ({ t, onImageClick }) => (
  <div className="container section-padding fade-in" id="gallery">
    <h1 className="text-primary" style={{ textAlign: 'center', marginBottom: '3rem' }}>{t('gallery_title')}</h1>
    <div className="gallery-grid">
      {[1, 2, 3, 4, 5, 6].map(i => {
        const url = `https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80&sig=${i}`;
        const altKey = `alt_gallery_${i}`;
        return (
          <div key={i}
            onClick={() => onImageClick(url)}
            className="gallery-item">
            <img src={url} alt={t(altKey)} title={t(altKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        );
      })}
    </div>
  </div>
);

const About = ({ t }) => (
  <div className="container section-padding fade-in" id="contact">
    <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: '1', minWidth: '300px' }}>
        <img
          src="https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          alt={t('alt_about')}
          title={t('alt_about')}
          style={{ width: '100%', borderRadius: '30px', boxShadow: 'var(--shadow-lg)', marginBottom: '2rem' }}
        />
        <div className="contact-info-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{t('nav_about')}</h3>
          <p style={{ marginBottom: '0.5rem' }}>📍 Mirabel, QC</p>
          <p style={{ marginBottom: '0.5rem' }}>📞 514 652-2659</p>
          <p style={{ marginBottom: '0.5rem' }}>✉️ contact@chezluma.ca</p>
        </div>
      </div>
      <div style={{ flex: '1.2', minWidth: '300px' }}>
        <h1 className="text-primary" style={{ marginBottom: '1.5rem' }}>{t('about_title')}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>{t('about_desc1')}</p>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>{t('about_desc2')}</p>

        <div className="contact-form-container">
          <h3 style={{ marginBottom: '2rem', color: 'var(--color-text)' }}>{t('contact_title')}</h3>
          <form action="https://formspree.io/f/xoqgeqzb" method="POST" className="contact-page-form">
            <div className="form-group-row">
              <div className="input-group">
                <label>{t('form_name')} *</label>
                <input type="text" name="name" required placeholder="Ex: Jean Dupont" />
              </div>
              <div className="input-group">
                <label>{t('form_email')} *</label>
                <input type="email" name="email" required placeholder="email@exemple.com" />
              </div>
            </div>
            <div className="input-group">
              <label>{t('form_phone')}</label>
              <input type="tel" name="phone" placeholder="514-000-0000" />
            </div>
            <div className="input-group">
              <label>{t('form_message')} *</label>
              <textarea name="message" rows="5" required placeholder="..."></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>{t('form_submit')}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

const Terms = ({ t }) => (
  <div className="container section-padding fade-in">
    <h1 className="text-primary" style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('terms_title')}</h1>
    <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem', fontSize: '1.1rem' }}>{t('terms_desc')}</p>

    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{t('terms_1_title')}</h3>
        <p style={{ lineHeight: '1.8' }}>{t('terms_1_desc')}</p>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>{t('terms_2_title')}</h3>
        <p style={{ lineHeight: '1.8' }}>{t('terms_2_desc')}</p>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>{t('terms_3_title')}</h3>
        <p style={{ lineHeight: '1.8' }}>{t('terms_3_desc')}</p>
      </div>
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>{t('terms_4_title')}</h3>
        <p style={{ lineHeight: '1.8' }}>{t('terms_4_desc')}</p>
      </div>
    </div>
  </div>
);

const Testimonials = ({ t }) => (
  <section className="testimonials-section section-padding">
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="text-primary" style={{ marginBottom: '1rem' }}>{t('testimonials_title')}</h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.8' }}>{t('testimonials_subtitle')}</p>
      </div>

      <div className="testimonial-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <img
              src={`https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&q=80&sig=${i}`}
              alt={t('alt_testimonial')}
              title={t('test_1_name')}
              className="testimonial-photo"
            />
            <p className="testimonial-quote">"{t(`test_${i}_text`)}"</p>
            <div className="testimonial-author">{t(`test_${i}_name`)}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Reiki = ({ t }) => (
  <div className="container section-padding fade-in">
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="text-primary" style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('reiki_title')}</h1>
      <p style={{ fontSize: '1.4rem', textAlign: 'center', marginBottom: '3rem', opacity: '0.8' }}>{t('reiki_subtitle')}</p>

      {/* Imagem Panorâmica no Topo */}
      <div style={{ width: '100%', marginBottom: '4rem' }}>
        <img
          src="/images/reiki-hero.jpg"
          alt={t('alt_reiki_hero')}
          title={t('alt_reiki_hero')}
          style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', borderRadius: '40px', boxShadow: 'var(--shadow-lg)' }}
        />
      </div>

      {/* Textos Lado a Lado */}
      <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', marginBottom: '5rem' }}>
        <div style={{ flex: '1.2', minWidth: '300px' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>{t('reiki_desc1')}</p>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.8' }}>{t('reiki_desc2')}</p>
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ backgroundColor: '#f9f7f0', padding: '2.5rem', borderRadius: '30px', border: '1px solid rgba(224, 122, 95, 0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{t('reiki_benefits_title')}</h3>
            <ul style={{ listStyle: 'none', lineHeight: '2.2', fontSize: '1.1rem' }}>
              <li>{t('reiki_b1')}</li>
              <li>{t('reiki_b2')}</li>
              <li>{t('reiki_b3')}</li>
              <li>{t('reiki_b4')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}></div>

      {/* Formulaire Reiki */}
      <section id="reiki-form" style={{ backgroundColor: '#ffffff', padding: '4rem 2rem', borderRadius: '40px', boxShadow: 'var(--shadow-lg)', marginBottom: '4rem' }}>
        <h2 className="text-primary" style={{ textAlign: 'center', marginBottom: '3rem' }}>{t('reiki_form_title')}</h2>
        <form action="https://formspree.io/f/xoqgeqzb" method="POST" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input type="hidden" name="_subject" value="Nouvelle demande de Reiki Canin" />

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600' }}>{t('reiki_form_name')} *</label>
            <input type="text" name="owner_name" required placeholder="Ex: Jean Dupont" style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600' }}>{t('reiki_form_phone')} *</label>
              <input type="tel" name="phone" required placeholder="514-000-0000" style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid #ddd' }} />
            </div>
            <div className="form-group" style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600' }}>{t('reiki_form_email')} *</label>
              <input type="email" name="email" required placeholder="email@exemple.com" style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600' }}>{t('reiki_form_msg')}</label>
            <textarea name="dog_details" rows="5" placeholder={t('form_message')} style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid #ddd', fontFamily: 'inherit' }}></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', marginTop: '1rem' }}>{t('reiki_form_submit')}</button>
        </form>
      </section>
    </div>
  </div>
);

const App = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Admin State (lifted for footer access)
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setShowAdminLogin(false);
    } else {
      setShowAdminLogin(!showAdminLogin);
      // If we are not on home/calendar, maybe switch? 
      // For now just show the login if they click it.
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'luma123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert("Mot de passe incorrect");
    }
  };

  useEffect(() => {
    // Update Title
    const titleKey = `seo_${currentPage}_title`;
    document.title = t(titleKey);

    // Update Meta Description
    const descKey = `seo_${currentPage}_desc`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', t(descKey));
  }, [currentPage, i18n.language, t]);

  const renderPage = () => {
    switch (currentPage) {
      case 'gallery': return <Gallery t={t} onImageClick={setSelectedImage} />;
      case 'calendar': return <Calendar t={t} isAdmin={isAdmin} showAdminLogin={showAdminLogin} adminPassword={adminPassword} setAdminPassword={setAdminPassword} handleAdminLogin={handleAdminLogin} />;
      case 'reiki': return <Reiki t={t} />;
      case 'about': return <About t={t} />;
      case 'terms': return <Terms t={t} />;
      default: return <Home t={t} isAdmin={isAdmin} showAdminLogin={showAdminLogin} adminPassword={adminPassword} setAdminPassword={setAdminPassword} handleAdminLogin={handleAdminLogin} />;
    }
  };

  return (
    <div>
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      <header>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <a href="#" className="logo" onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}>
            <img src="/images/logo.png" alt={t('alt_logo')} title={t('alt_logo')} style={{ height: '50px', width: 'auto', display: 'block' }} />
          </a>

          <div className="nav-links">
            <a href="#" onClick={() => setCurrentPage('home')}>{t('nav_home')}</a>
            <a href="#" onClick={() => { setCurrentPage('gallery'); setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>{t('nav_gallery')}</a>
            <a href="#" onClick={() => setCurrentPage('reiki')}>{t('nav_reiki')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>{t('nav_calendar')}</a>
            <a href="#" onClick={() => setCurrentPage('about')}>{t('nav_about')}</a>
            <LanguageSwitcher />
          </div>

          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`nav-links-mobile ${isMenuOpen ? 'active' : ''}`}>
            <a href="#" onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}>{t('nav_home')}</a>
            <a href="#" onClick={() => { setCurrentPage('reiki'); setIsMenuOpen(false); }}>{t('nav_reiki')}</a>
            <a href="#" onClick={() => { setCurrentPage('gallery'); setIsMenuOpen(false); }}>{t('nav_gallery')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setIsMenuOpen(false); setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>{t('nav_calendar')}</a>
            <a href="#" onClick={() => { setCurrentPage('about'); setIsMenuOpen(false); }}>{t('nav_about')}</a>
            <div style={{ marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main>
        {renderPage()}
      </main>

      {showAdminLogin && !isAdmin && (
        <div className="admin-modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{t('nav_home') === 'Home' ? 'Admin Login' : 'Connexion Admin'}</h3>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="password"
                placeholder="Mot de passe..."
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoFocus
                style={{ padding: '1rem', borderRadius: '15px', border: '1px solid #ddd', fontSize: '1.1rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>{t('nav_home') === 'Home' ? 'Access Dashboard' : 'Accéder au mode édition'}</button>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src="/images/logo.png" alt={t('alt_logo')} title={t('alt_logo')} className="footer-logo" onClick={() => { setCurrentPage('home'); window.scrollTo(0, 0); }} />
            <p className="footer-tagline">{t('footer_tagline')}</p>
          </div>

          <div className="footer-column">
            <h4>{t('footer_links')}</h4>
            <nav className="footer-nav">
              <a href="#" onClick={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}>{t('nav_home')}</a>
              <a href="#" onClick={() => { setCurrentPage('reiki'); window.scrollTo(0, 0); }}>{t('nav_reiki')}</a>
              <a href="#" onClick={() => { setCurrentPage('gallery'); window.scrollTo(0, 0); }}>{t('nav_gallery')}</a>
              <a href="#" onClick={() => { setCurrentPage('home'); setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>{t('nav_calendar')}</a>
            </nav>
          </div>

          <div className="footer-column">
            <h4>{t('footer_legal')}</h4>
            <nav className="footer-nav">
              <a href="#" onClick={() => { setCurrentPage('terms'); window.scrollTo(0, 0); }}>{t('nav_terms')}</a>
              <a href="#" onClick={() => { setCurrentPage('about'); window.scrollTo(0, 0); }}>{t('nav_about')}</a>
            </nav>
          </div>

          <div className="footer-column">
            <h4>{t('footer_social')}</h4>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
            <div className="footer-contact-info">
              <p>Mirabel, QC</p>
              <p>514 652-2659</p>
              <p>contact@chezluma.ca</p>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} <span
              onClick={toggleAdmin}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Admin"
            >Chez Luma Mirabel</span>. {t('footer_rights')}
          </div>
          <div className="footer-made-by">
            {t('footer_made_in')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
