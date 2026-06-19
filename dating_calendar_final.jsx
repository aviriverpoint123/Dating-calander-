import React, { useState, useEffect } from 'react';

const Confetti = () => {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1,
    color: ['#FF6B5B', '#FFB84D', '#6C63FF', '#FF8FB1'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 9998 }}>
      {confetti.map(piece => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.left}%`,
            top: '-10px',
            width: '12px',
            height: '12px',
            background: piece.color,
            borderRadius: '50%',
            animation: `fall ${piece.duration}s linear ${piece.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function DatingCalendar() {
  const [step, setStep] = useState('landing');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 18));
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', location: '', notes: '', about: '' });
  const [lastBooking, setLastBooking] = useState(null);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const result = await window.storage?.get('dating-bookings');
        if (result?.value) {
          setBookings(JSON.parse(result.value));
        }
      } catch (err) {
        console.log('No stored bookings yet');
      }
    };
    loadBookings();

    const generateBlockedDates = () => {
      const blocked = [];
      for (let month = 5; month <= 7; month++) {
        const daysInMonth = new Date(2026, month + 1, 0).getDate();
        const numToBlock = Math.floor(daysInMonth * 0.75);
        
        for (let i = 0; i < numToBlock; i++) {
          let day = Math.floor(Math.random() * daysInMonth) + 1;
          let dayOfWeek = new Date(2026, month, day).getDay();
          
          while (dayOfWeek < 1 || dayOfWeek > 4) {
            day = Math.floor(Math.random() * daysInMonth) + 1;
            dayOfWeek = new Date(2026, month, day).getDay();
          }
          
          const dateStr = `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (!blocked.includes(dateStr)) {
            blocked.push(dateStr);
          }
        }
      }
      setBlockedDates(blocked);
    };
    
    generateBlockedDates();
  }, []);

  useEffect(() => {
    const saveBookings = async () => {
      if (bookings.length > 0) {
        try {
          await window.storage?.set('dating-bookings', JSON.stringify(bookings));
        } catch (err) {
          console.error('Failed to save bookings');
        }
      }
    };
    saveBookings();
  }, [bookings]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isDateBooked = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.some(b => b.date === dateStr) || blockedDates.includes(dateStr);
  };

  const isAvailableDay = (dayOfWeek) => {
    return dayOfWeek >= 1 && dayOfWeek <= 4;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleScreeningSubmit = () => {
    if (!screeningAnswer.trim()) {
      alert('Tell me a bit about yourself');
      return;
    }
    setStep('calendar');
  };

  const handleDateClick = (day) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    if (!isAvailableDay(dayOfWeek) || isDateBooked(day)) return;

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate({ day, dateStr });
    setShowBookingForm(true);
  };

  const handleBooking = (e) => {
    e.preventDefault();

    const newBooking = {
      date: selectedDate.dateStr,
      day: selectedDate.day,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      notes: formData.notes,
      about: formData.about,
      time: '8:00 PM',
      bookedAt: new Date().toISOString(),
      cancellationToken: Math.random().toString(36).substring(7)
    };

    setBookings([...bookings, newBooking]);
    setLastBooking(newBooking);
    setFormData({ name: '', phone: '', location: '', notes: '', about: '' });
    setShowBookingForm(false);
    setStep('success');
  };

  // Landing Page
  if (step === 'landing') {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 100%)', 
        color: '#1A1A1A', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '60px 20px',
        fontFamily: '"DM Sans", "Outfit", sans-serif'
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
          
          * {
            font-family: 'DM Sans', sans-serif;
          }
          
          h1, h2, h3 {
            font-family: 'Outfit', sans-serif;
            letter-spacing: -0.015em;
          }
        `}</style>

        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
            <h1 style={{ 
              fontSize: '56px', 
              fontWeight: '700',
              margin: '0 0 20px 0', 
              lineHeight: '1.15',
              color: '#1A1A1A'
            }}>
              You got picked
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#555555',
              margin: '0',
              lineHeight: '1.6',
              maxWidth: '550px',
              fontWeight: '400',
              letterSpacing: '-0.003em'
            }}>
              I'm looking to meet interesting people and have a real conversation. Pick a time that works for you.
            </p>
          </div>

          {/* Photo */}
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              width: '220px',
              height: '220px',
              background: 'linear-gradient(135deg, #FF6B5B 0%, #FFB84D 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '100px',
              marginBottom: '20px',
              boxShadow: '0 20px 40px rgba(255, 107, 91, 0.15)'
            }}>
              👤
            </div>
            <p style={{ color: '#888888', fontSize: '12px', margin: 0, fontWeight: '500', letterSpacing: '0.5px' }}>Add your photo here</p>
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 24px 0' }}>Actual humans. Actual conversations.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '500px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #FF6B5B, #FFB84D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>45+</div>
                <div style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>Good nights</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #FF6B5B, #FFB84D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>4.8★</div>
                <div style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>Would recommend</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #6C63FF, #FF8FB1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>0</div>
                <div style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>Flakes 🚫</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #6C63FF, #FF8FB1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>100%</div>
                <div style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>On time ✅</div>
              </div>
            </div>
          </div>

          {/* Vibe */}
          <div style={{ marginBottom: '80px', maxWidth: '550px' }}>
            <p style={{ fontSize: '14px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 16px 0' }}>What to expect</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {[
                'Good conversation. The kind where you lose track of time.',
                'Someone who actually listens.',
                'Best case: you meet someone worth your time. Worst case: solid material for your therapist.'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ 
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B5B, #FFB84D)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '12px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>✓</span>
                  <span style={{ fontSize: '15px', color: '#1A1A1A', lineHeight: '1.5', fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep('calendar')}
            style={{
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #FF6B5B 0%, #FFB84D 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(255, 107, 91, 0.25)',
              letterSpacing: '-0.003em'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 16px 40px rgba(255, 107, 91, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 12px 30px rgba(255, 107, 91, 0.25)';
            }}
          >
            Pick a date
          </button>

          <p style={{ color: '#999999', fontSize: '12px', marginTop: '16px', fontWeight: '500' }}>
            Two spots open this month
          </p>
        </div>
      </div>
    );
  }

  // Success Page
  if (step === 'success' && lastBooking) {
    const bookingDate = new Date(lastBooking.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 100%)', 
        color: '#1A1A1A', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        fontFamily: '"DM Sans", "Outfit", sans-serif'
      }}>
        <Confetti />
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '32px' }}>🎉</div>
          
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px', color: '#1A1A1A' }}>
            You're set
          </h1>
          
          <p style={{ fontSize: '16px', color: '#666666', marginBottom: '48px', lineHeight: '1.6' }}>
            Looking forward to meeting you
          </p>

          <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', marginBottom: '48px', border: '1.5px solid #E8E0D5', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: '12px', color: '#999999', marginBottom: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</div>
            <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px', color: '#1A1A1A' }}>
              {bookingDate}
            </div>
            <div style={{ fontSize: '15px', background: 'linear-gradient(135deg, #FF6B5B, #FFB84D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '16px' }}>
              8:00 PM
            </div>
            {lastBooking.location && (
              <div style={{ fontSize: '14px', color: '#666666' }}>📍 {lastBooking.location}</div>
            )}
          </div>

          <p style={{ fontSize: '15px', color: '#666666', marginBottom: '40px', lineHeight: '1.8' }}>
            I'll send you the spot 24 hours before. Bring good energy and an open mind. See you soon.
          </p>

          <button
            onClick={() => setStep('email')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #FF6B5B 0%, #FFB84D 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(255, 107, 91, 0.25)',
              letterSpacing: '-0.003em'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 16px 40px rgba(255, 107, 91, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 12px 30px rgba(255, 107, 91, 0.25)';
            }}
          >
            View confirmation
          </button>

          <button
            onClick={() => setStep('landing')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'transparent',
              color: '#666666',
              border: '1.5px solid #E8E0D5',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '-0.003em'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FFFFFF';
              e.target.style.borderColor = '#D8D0C5';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = '#E8E0D5';
            }}
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  // Email Preview Page
  if (step === 'email' && lastBooking) {
    const bookingDate = new Date(lastBooking.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div style={{ background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 100%)', color: '#1A1A1A', minHeight: '100vh', padding: '40px 20px', fontFamily: '"DM Sans", "Outfit", sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={() => setStep('success')}
            style={{ background: 'none', border: 'none', color: '#FF6B5B', fontSize: '14px', cursor: 'pointer', marginBottom: '32px', fontWeight: '700', letterSpacing: '-0.003em' }}
          >
            ← Back
          </button>

          <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '700' }}>Your confirmation</h2>

          <div style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D5', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
            {/* Email Header */}
            <div style={{ background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 100%)', padding: '24px', borderBottom: '1.5px solid #E8E0D5' }}>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From</div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A1A1A' }}>avi@coffee.com</div>
              
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Date confirmed – {bookingDate}</div>
            </div>

            {/* Email Body */}
            <div style={{ padding: '40px 32px', lineHeight: '1.7', fontSize: '15px', color: '#444444' }}>
              <p style={{ margin: '0 0 24px 0' }}>Hey {lastBooking.name},</p>

              <p style={{ margin: '0 0 32px 0' }}>You're all set for <strong style={{ color: '#1A1A1A', fontSize: '16px' }}>{bookingDate} at 8:00 PM</strong>.</p>

              <div style={{ background: '#FAFAF8', padding: '20px', borderRadius: '12px', margin: '32px 0', borderLeft: '4px solid #FF6B5B' }}>
                <div style={{ fontSize: '12px', color: '#999999', marginBottom: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What's next</div>
                <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px', color: '#1A1A1A' }}>You'll get the location 24 hours before</div>
                <div style={{ fontSize: '14px', color: '#666666' }}>You mentioned {lastBooking.location}. I'll pick somewhere good there.</div>
              </div>

              <p style={{ margin: '24px 0 32px 0' }}>About you:</p>
              {lastBooking.about && <p style={{ margin: '0 0 32px 0', fontStyle: 'italic', color: '#666666', padding: '16px', background: '#FAFAF8', borderRadius: '8px', fontSize: '14px' }}>"{lastBooking.about}"</p>}

              <div style={{ background: '#FAFAF8', padding: '20px', borderRadius: '12px', margin: '32px 0' }}>
                <strong style={{ display: 'block', marginBottom: '16px', color: '#1A1A1A' }}>Quick heads up</strong>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#666666', lineHeight: '1.8' }}>
                  <li>If you need to cancel, just let me know 48 hours before.</li>
                  <li>I'll confirm with logistics the day of.</li>
                  <li>Just be yourself. That's all that matters.</li>
                </ul>
              </div>

              <p style={{ margin: '32px 0 8px 0', color: '#1A1A1A' }}>See you soon.</p>
              <p style={{ margin: '0 0 32px 0', color: '#1A1A1A', fontWeight: '700' }}>Avi</p>

              {/* Cancel Link */}
              <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1.5px solid #E8E0D5' }}>
                <a
                  href={`#cancel-${lastBooking.cancellationToken}`}
                  style={{ color: '#FF6B5B', fontSize: '13px', textDecoration: 'none', fontWeight: '700', letterSpacing: '-0.003em' }}
                >
                  Need to cancel? Let me know
                </a>
              </div>
            </div>
          </div>

          <p style={{ color: '#999999', fontSize: '12px', marginTop: '24px', textAlign: 'center', fontWeight: '500' }}>
            Confirmation sent
          </p>
        </div>
      </div>
    );
  }

  // Calendar Page
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const canNavigateBack = () => {
    const startDate = new Date(2026, 5, 18);
    return currentDate.getMonth() > startDate.getMonth() || currentDate.getFullYear() > startDate.getFullYear();
  };

  const prevMonth = () => {
    if (canNavigateBack()) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };
  
  const canNavigateForward = () => {
    const startDate = new Date(2026, 5, 18);
    const nextPossibleMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const maxDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 14);
    return nextPossibleMonth <= maxDate;
  };
  
  const nextMonth = () => {
    if (canNavigateForward()) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 100%)', color: '#1A1A1A', minHeight: '100vh', padding: '40px 20px', fontFamily: '"DM Sans", "Outfit", sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => setStep('landing')}
          style={{ background: 'none', border: 'none', color: '#FF6B5B', fontSize: '14px', cursor: 'pointer', marginBottom: '40px', fontWeight: '700', letterSpacing: '-0.003em' }}
        >
          ← Back
        </button>

        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '700', margin: '0 0 12px 0', color: '#1A1A1A' }}>Pick your date</h1>
          <p style={{ color: '#666666', margin: 0, fontSize: '15px', fontWeight: '500' }}>Available times. {bookings.length < 2 ? 2 - bookings.length : 1} spot{bookings.length < 2 ? 's' : ''} left.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button onClick={prevMonth} disabled={!canNavigateBack()} style={{ background: 'none', border: 'none', color: canNavigateBack() ? '#FF6B5B' : '#E8E0D5', fontSize: '20px', cursor: canNavigateBack() ? 'pointer' : 'default', fontWeight: '700', transition: 'all 0.2s' }}>←</button>
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.003em' }}>{monthName}</h2>
          <button onClick={nextMonth} disabled={!canNavigateForward()} style={{ background: 'none', border: 'none', color: canNavigateForward() ? '#FF6B5B' : '#E8E0D5', fontSize: '20px', cursor: canNavigateForward() ? 'pointer' : 'default', fontWeight: '700', transition: 'all 0.2s' }}>→</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: '#999999', fontSize: '11px', fontWeight: '700', padding: '8px' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '48px' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
          ))}

          {days.map(day => {
            const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
            const available = isAvailableDay(dayOfWeek);
            const booked = isDateBooked(day);
            const isClickable = available && !booked;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={!isClickable}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: booked ? '1.5px solid #E8E0D5' : available ? '1.5px solid #FF6B5B' : 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: isClickable ? 'pointer' : 'default',
                  background: booked ? '#F5F0E8' : available ? '#FFFFFF' : 'transparent',
                  color: booked ? '#CCCCCC' : available ? '#FF6B5B' : '#CCCCCC',
                  transition: 'all 0.2s',
                  textDecoration: booked ? 'line-through' : 'none',
                  boxShadow: available && !booked ? '0 4px 15px rgba(255, 107, 91, 0.12)' : 'none',
                  letterSpacing: '-0.003em'
                }}
                onMouseEnter={(e) => isClickable && (e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 91, 0.2)')}
                onMouseLeave={(e) => isClickable && (e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 91, 0.12)')}
              >
                {day}
              </button>
            );
          })}
        </div>

        {showBookingForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: '#FFFFFF',
              padding: '40px',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              border: '1.5px solid #E8E0D5',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '28px', fontSize: '18px', fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.003em' }}>
                {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at 8 PM
              </h3>

              <form onSubmit={handleBooking}>
                {[
                  { label: 'Name', key: 'name', type: 'text', placeholder: 'Your name', required: true },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1 (555) 123-4567', required: false },
                  { label: 'Preferred bar or neighborhood', key: 'location', type: 'text', placeholder: 'Midtown, West Village, etc.', required: false }
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#1A1A1A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => {
                        setFormData({ ...formData, [field.key]: e.target.value });
                      }}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1.5px solid #E8E0D5',
                        background: '#FFFFFF',
                        color: '#1A1A1A',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        letterSpacing: '-0.003em'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#FF6B5B')}
                      onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
                      required={field.required}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#1A1A1A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>A little about you (optional)</label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="What do you like? Anything I should know about you?"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #E8E0D5',
                      background: '#FFFFFF',
                      color: '#1A1A1A',
                      boxSizing: 'border-box',
                      fontSize: '14px',
                      fontWeight: '500',
                      resize: 'vertical',
                      minHeight: '80px',
                      transition: 'all 0.2s',
                      letterSpacing: '-0.003em',
                      fontFamily: '"DM Sans", sans-serif'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF6B5B'}
                    onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #E8E0D5',
                      background: '#FFFFFF',
                      color: '#666666',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      letterSpacing: '-0.003em'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#FAFAF8';
                      e.target.style.borderColor = '#D8D0C5';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#E8E0D5';
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #FF6B5B 0%, #FFB84D 100%)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      letterSpacing: '-0.003em'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
