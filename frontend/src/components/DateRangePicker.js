import React, { useState } from 'react';

export default function DateRangePicker({ onChange }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleStart = (e) => {
    const date = e.target.value;
    setStart(date);
    if (date) {
      onChange({ start: `${date}T00:00`, end: end ? `${end}T23:59` : '' });
    }
  };

  const handleEnd = (e) => {
    const date = e.target.value;
    setEnd(date);
    if (date) {
      onChange({ start: start ? `${start}T00:00` : '', end: `${date}T23:59` });
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <label>
        Desde:{' '}
        <input type="date" value={start} onChange={handleStart} />
      </label>{' '}
      <label>
        Hasta:{' '}
        <input type="date" value={end} onChange={handleEnd} />
      </label>
    </div>
  );
}
