/**
 * Pruebas unitarias para los resolvers de GraphQL
 */

jest.mock('../../src/models/BalanceEntry', () => ({
    find: jest.fn(),
  }));
  
  const { resolvers } = require('../../src/schema');
  const BalanceEntry = require('../../src/models/BalanceEntry');
  
  describe('Resolvers de GraphQL', () => {
    it('hello devuelve el saludo', () => {
      const saludo = resolvers.Query.hello();
      expect(saludo).toBe('Hello World from GraphQL!');
    });
  
    it('getBalanceEntries llama a Mongoose con filtros correctos y ordena', async () => {
      // Datos falsos de retorno
      const fakeEntries = [
        { _id: '1', datetime: 'd1', values: {}, labels: {} },
        { _id: '2', datetime: 'd2', values: {}, labels: {} },
      ];
      // Creamos un mock de sort() que resuelve fakeEntries
      const mockSort = jest.fn().mockResolvedValue(fakeEntries);
      // Hacemos que find() devuelva un "Query" con sort()
      BalanceEntry.find.mockReturnValue({ sort: mockSort });
  
      const args = {
        startDate: '2025-04-01T00:00:00Z',
        endDate:   '2025-04-03T00:00:00Z',
      };
      // Ejecutamos directamente el resolver
      const result = await resolvers.Query.getBalanceEntries(null, args);
  
      // Compruebo que find() reciba el filtro correcto
      expect(BalanceEntry.find).toHaveBeenCalledWith({
        datetime: {
          $gte: new Date(args.startDate),
          $lt:  new Date(args.endDate),
        }
      });
      // Y que luego se llame a sort()
      expect(mockSort).toHaveBeenCalledWith({ datetime: 1 });
      // Finalmente que el resolver devuelva el array simulado
      expect(result).toBe(fakeEntries);
    });
  });