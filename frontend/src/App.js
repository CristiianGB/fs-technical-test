import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import DateRangePicker from './components/DateRangePicker';
import BalanceChart from './components/BalanceChart';
import './App.css';

const GET_BALANCE = gql`
  query GetBalance($startDate: String!, $endDate: String!) {
    getBalanceEntries(startDate: $startDate, endDate: $endDate) {
      datetime
      values
      labels
    }
  }
`;

function App() {
  const [inputs, setInputs] = useState({ start: '', end: '' });
  const [queryRange, setQueryRange] = useState(null);

  const handleChange = vals => setInputs(vals);
  const handleSubmit = e => {
    e.preventDefault();
    const { start, end } = inputs;
  
    if (!start || !end) {
      alert('⚠️ Por favor selecciona un rango de fechas antes de buscar.');
      return;
    }
  
    if (new Date(start) >= new Date(end)) {
      alert('⚠️ Rango de fechas inválido.');
      return;
    }
  
    setQueryRange(inputs);
  };
  

  const variables = queryRange
    ? {
        startDate: new Date(queryRange.start).toISOString(),
        endDate: new Date(queryRange.end).toISOString(),
      }
    : undefined;

  const { data, loading, error } = useQuery(GET_BALANCE, {
    skip: !queryRange,
    variables,
  });

  return (
    <div className="App">
      <h1>Balance Eléctrico</h1>
      <form onSubmit={handleSubmit}>
        <DateRangePicker onChange={handleChange} />
        <button
          type="submit"
          disabled={loading || !inputs.start || !inputs.end}
        >
          {loading ? 'Cargando…' : 'Buscar'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>⚠️ Error: {error.message}</p>}
      {data && (
        <div className="chart-container">
          <BalanceChart data={data.getBalanceEntries} />
        </div>
      )}
    </div>
  );
}

export { GET_BALANCE };

export default App;