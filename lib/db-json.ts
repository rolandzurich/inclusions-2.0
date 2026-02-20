import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Dir exists
  }
}

async function readJsonFile(filename: string): Promise<any[]> {
  try {
    const data = await fs.readFile(join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJsonFile(filename: string, data: any[]) {
  await ensureDataDir();
  await fs.writeFile(join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

export async function insertNewsletterSubscriber(data: any) {
  const subscribers = await readJsonFile('newsletter_subscribers.json');
  const newEntry = {
    id: Date.now(),
    ...data,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  subscribers.push(newEntry);
  await writeJsonFile('newsletter_subscribers.json', subscribers);
  return { success: true, data: newEntry };
}

export async function insertContactRequest(data: any) {
  const requests = await readJsonFile('contact_requests.json');
  const newEntry = {
    id: Date.now(),
    ...data,
    status: 'new',
    created_at: new Date().toISOString()
  };
  requests.push(newEntry);
  await writeJsonFile('contact_requests.json', requests);
  return { success: true, data: newEntry };
}

export async function insertVipRegistration(data: any) {
  const registrations = await readJsonFile('vip_registrations.json');
  const newEntry = {
    id: Date.now(),
    ...data, // Alle übergebenen Daten speichern
    status: 'pending',
    created_at: new Date().toISOString()
  };
  registrations.push(newEntry);
  await writeJsonFile('vip_registrations.json', registrations);
  console.log('✅ VIP-Anmeldung gespeichert mit allen Feldern:', Object.keys(newEntry));
  return { success: true, data: newEntry };
}

export async function getAllNewsletterSubscribers() {
  return await readJsonFile('newsletter_subscribers.json');
}
