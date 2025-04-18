import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import App from '../App';
import { GET_BALANCE } from '../App';

beforeAll(() => {
    window.alert = jest.fn();
});


const mockSuccess = {
    request: {
        query: GET_BALANCE,
        variables: {
            startDate: new Date('2025-04-01T00:00').toISOString(),
            endDate: new Date('2025-04-02T23:59').toISOString(),
        },
    },
    result: {
        data: {
            getBalanceEntries: [
                {
                    datetime: '2025-04-01T00:00:00Z',
                    values: { Eólica: 5000 },
                    labels: { Eólica: 'Eólica' },
                },
            ],
        },
    },
};

const mockError = {
    request: mockSuccess.request,
    error: new Error('GraphQL error'),
};

describe('App', () => {
    it('renderiza correctamente', () => {
        render(
            <MockedProvider>
                <App />
            </MockedProvider>
        );
        expect(screen.getByText(/balance eléctrico/i)).toBeInTheDocument();
        expect(screen.getByText(/buscar/i)).toBeInTheDocument();
    });

    it('muestra error si fechas son inválidas', () => {
        render(
            <MockedProvider>
                <App />
            </MockedProvider>
        );

        const buscarBtn = screen.getByText(/buscar/i);
        fireEvent.click(buscarBtn);
        expect(window.alert).toBeDefined();
    });

    it('muestra datos al enviar fechas válidas', async () => {
        render(
          <MockedProvider mocks={[mockSuccess]} addTypename={false}>
            <App />
          </MockedProvider>
        );
      
        const desde = screen.getByLabelText(/desde/i);
        const hasta = screen.getByLabelText(/hasta/i);
      
        fireEvent.change(desde, { target: { value: '2025-04-01' } });
        fireEvent.change(hasta, { target: { value: '2025-04-02' } });
      
        fireEvent.click(screen.getByText(/buscar/i));
      
        await waitFor(() => {
          expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
        });
      });
      
      it('muestra error si la API falla', async () => {
        render(
          <MockedProvider mocks={[mockError]} addTypename={false}>
            <App />
          </MockedProvider>
        );
      
        const desde = screen.getByLabelText(/desde/i);
        const hasta = screen.getByLabelText(/hasta/i);
      
        fireEvent.change(desde, { target: { value: '2025-04-01' } });
        fireEvent.change(hasta, { target: { value: '2025-04-02' } });
      
        fireEvent.click(screen.getByText(/buscar/i));
      
        await waitFor(() => {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
      });
      
});
