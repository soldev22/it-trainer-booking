'use client';

import React, { useState, useEffect, JSX } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useSession, SessionProvider } from 'next-auth/react';
import 'bootstrap/dist/css/bootstrap.min.css';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function CalendarContent() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('full');
  const [courseTitle, setCourseTitle] = useState('');
  const [numDays, setNumDays] = useState(1);
  const [monthOffset, setMonthOffset] = useState(0);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/bookings?fromToday=true');
        if (!res.ok) throw new Error('Failed to load bookings');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [monthOffset]);

  const openModal = (date: string) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle,
          startDate: selectedDate,
          numDays,
          timeOfDay,
          status: 'provisional',
          email: session?.user?.email,
        }),
      });
      if (!res.ok) throw new Error('Failed to save booking');
      const updated = await res.json();
      setBookings([...bookings, updated]);
      setShowModal(false);
      setCourseTitle('');
      setNumDays(1);
      setTimeOfDay('full');
    } catch (err) {
      console.error(err);
    }
  };

  const generateCalendarGrid = () => {
    const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const startDay = (startOfMonth.getDay() + 6) % 7;
    const start = new Date(startOfMonth);
    start.setDate(start.getDate() - startDay);

    const cells: JSX.Element[] = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const isCurrentMonth = current.getMonth() === baseDate.getMonth();
      const isWeekday = current.getDay() >= 1 && current.getDay() <= 5;
      const dateStr = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      const existingBooking = bookings.find(b => {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(bStart);
        bEnd.setDate(bEnd.getDate() + b.numDays);
        const currentDate = new Date(dateStr);
        return currentDate >= bStart && currentDate < bEnd;
      });

      const canEdit = session?.user?.email === existingBooking?.email || session?.user?.email === 'mike@solutionsdeveloped';

      cells.push(
        <div
          key={dateStr}
          className={`border p-2 text-center ${isCurrentMonth ? 'bg-light' : 'bg-white text-muted'}`}
          style={{
            height: '100px',
            cursor: isWeekday && isCurrentMonth ? 'pointer' : 'default',
            backgroundColor: existingBooking ? (canEdit ? '#ffc107' : '#ccc') : undefined,
          }}
          onClick={() => isWeekday && isCurrentMonth && (!existingBooking || canEdit) && openModal(dateStr)}
        >
          <>
  <small>{current.getDate()}</small>
  {existingBooking && (
    <div style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
      {existingBooking.courseTitle}
    </div>
  )}
</>
        </div>
      );
    }
    return cells;
  };

  const monthName = new Date(baseDate).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="container py-4">
      <h2>Booking Calendar</h2>
      {session?.user?.email && (
        <p className="text-muted">Logged in as: {session.user.email}</p>
      )}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-primary" onClick={() => setMonthOffset(monthOffset - 1)}>Previous</Button>
        <h4 className="mb-0">{monthName}</h4>
        <Button variant="outline-primary" onClick={() => setMonthOffset(monthOffset + 1)}>Next</Button>
      </div>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', display: 'grid', gap: '1px' }}>
          {weekdays.map((day) => (
            <div key={day} className="text-center fw-bold bg-primary text-white p-2">{day}</div>
          ))}
          {generateCalendarGrid()}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book: {selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course Title</Form.Label>
              <Form.Control
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Days</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={10}
                value={numDays}
                onChange={(e) => setNumDays(parseInt(e.target.value))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time of Day</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Full Day"
                  name="timeOfDay"
                  value="full"
                  checked={timeOfDay === 'full'}
                  onChange={() => setTimeOfDay('full')}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Morning"
                  name="timeOfDay"
                  value="morning"
                  checked={timeOfDay === 'morning'}
                  onChange={() => setTimeOfDay('morning')}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Afternoon"
                  name="timeOfDay"
                  value="afternoon"
                  checked={timeOfDay === 'afternoon'}
                  onChange={() => setTimeOfDay('afternoon')}
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!courseTitle || !selectedDate}>
            Submit Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <SessionProvider>
      <CalendarContent />
    </SessionProvider>
  );
}
