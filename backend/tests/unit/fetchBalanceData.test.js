/**
 * Pruebas unitarias para el servicio fetchBalanceData
 */

jest.mock('axios');
const axios = require('axios');
const fetchBalanceData = require('../../src/services/fetchBalanceData');
const BalanceEntry = require('../../src/models/BalanceEntry');

// Stub de updateOne
BalanceEntry.updateOne = jest.fn().mockResolvedValue({});

describe('Servicio fetchBalanceData', () => {
  afterEach(() => jest.clearAllMocks());

  it('no llama a updateOne si `included` viene vacío', async () => {
    axios.get.mockResolvedValue({ data: { included: [] } });
    await fetchBalanceData('2020-01-01T00:00', '2020-01-02T00:00');
    expect(BalanceEntry.updateOne).not.toHaveBeenCalled();
  });

  it('guarda valores correctamente en MongoDB', async () => {
    const fakeIncluded = [{
      id: 'X',
      attributes: {
        content: [{
          attributes: {
            title: 'T',
            values: [{ datetime: '2020-01-01T00:00:00Z', value: 123 }]
          }
        }]
      }
    }];

    axios.get.mockResolvedValue({ data: { included: fakeIncluded } });
    await fetchBalanceData('2020-01-01T00:00', '2020-01-02T00:00');

    expect(BalanceEntry.updateOne).toHaveBeenCalledWith(
      { datetime: new Date('2020-01-01T00:00:00Z') },
      // Primer nivel: objeto update
      expect.objectContaining({
        $set: 
          // Segundo nivel: dentro de $set sólo comprobar la clave que nos interesa
          expect.objectContaining({ 'values.T': 123 })
      }),
      { upsert: true }
    );
  });
});
