interface Entry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  date: string;
}

const LOCAL_STORAGE_KEY = 'driversLedgerEntries';

export const getEntries = (): Entry[] => {
  const entriesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
  return entriesJson ? JSON.parse(entriesJson) : [];
};

export const saveEntries = (entries: Entry[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
};

export const addEntry = (newEntry: Omit<Entry, 'id' | 'date'>): Entry => {
  const entries = getEntries();
  const entryWithIdAndDate: Entry = {
    ...newEntry,
    id: Date.now().toString(), // Simple unique ID
    date: new Date().toISOString(),
  };
  entries.push(entryWithIdAndDate);
  saveEntries(entries);
  return entryWithIdAndDate;
};

export const getDailySummary = (date: Date = new Date()) => {
  const entries = getEntries();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfDay && entryDate <= endOfDay;
  });

  const dailyEarnings = dailyEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const dailyExpenses = dailyEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  return { dailyEarnings, dailyExpenses, dailyBalance: dailyEarnings - dailyExpenses, dailyEntries };
};
