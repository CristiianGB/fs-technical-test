import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangePicker from '../components/DateRangePicker';

describe('DateRangePicker', () => {
  it('renderiza los inputs de fecha', () => {
    render(<DateRangePicker onChange={() => {}} />);
    expect(screen.getByLabelText(/Desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasta/i)).toBeInTheDocument();
  });

  it('llama a onChange correctamente al cambiar la fecha de inicio', () => {
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);

    const startInput = screen.getByLabelText(/Desde/i);
    fireEvent.change(startInput, { target: { value: '2025-04-01' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      start: '2025-04-01T00:00',
      end: '',
    });
  });

  it('llama a onChange correctamente al cambiar la fecha de fin', () => {
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);

    const endInput = screen.getByLabelText(/Hasta/i);
    fireEvent.change(endInput, { target: { value: '2025-04-15' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      start: '',
      end: '2025-04-15T23:59',
    });
  });
});
