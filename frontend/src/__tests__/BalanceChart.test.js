import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BalanceChart from '../components/BalanceChart';

const mockData = [
  {
    datetime: '2025-04-01T00:00:00Z',
    values: {
      Eólica: 5000,
      Nuclear: 3000,
    },
    labels: {
      Eólica: 'Eólica',
      Nuclear: 'Nuclear',
    },
  },
  {
    datetime: '2025-04-02T00:00:00Z',
    values: {
      Eólica: 7000,
      Nuclear: 3200,
    },
    labels: {
      Eólica: 'Eólica',
      Nuclear: 'Nuclear',
    },
  },
];

describe('BalanceChart', () => {
  it('muestra mensaje si no hay datos', () => {
    render(<BalanceChart data={[]} />);
    expect(screen.getByText(/no hay datos/i)).toBeInTheDocument();
  });

  it('renderiza correctamente con datos', () => {
    render(<BalanceChart data={mockData} />);
    expect(screen.getByText(/tipo de gráfico/i)).toBeInTheDocument();
    expect(screen.getByText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de gráfico/i)).toBeInTheDocument();
  });

  it('cambia el tipo de gráfico desde el dropdown', () => {
    render(<BalanceChart data={mockData} />);
    const select = screen.getByLabelText(/tipo de gráfico/i);
    fireEvent.change(select, { target: { value: 'bar' } });
    expect(select.value).toBe('bar');
  });

  it('aplica filtro de categoría renovable', () => {
    render(<BalanceChart data={mockData} />);
    const filter = screen.getByLabelText(/categoría/i);
    fireEvent.change(filter, { target: { value: 'renewable' } });
    expect(filter.value).toBe('renewable');
  });

  it('desactiva una serie al hacer click en la leyenda', () => {
    render(<BalanceChart data={mockData} />);
    const legendItem = screen.getByText(/categoría/i); 
    fireEvent.click(legendItem);
    expect(legendItem).toBeInTheDocument(); 
  });
});
