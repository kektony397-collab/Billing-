import Dexie, { Table } from 'dexie';
import { Medicine, Party, Invoice } from './types';

class GopiDatabase extends Dexie {
  medicines!: Table<Medicine>;
  parties!: Table<Party>;
  invoices!: Table<Invoice>;

  constructor() {
    super('GopiDistributorsDB');
    // @ts-ignore
    this.version(1).stores({
      medicines: '++id, name, batchNo, hsn',
      parties: '++id, name, gstin, mobile',
      invoices: '++id, invoiceNo, date, partyId'
    });
  }
}

export const db = new GopiDatabase();