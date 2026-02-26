import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import EntryForm from '../components/EntryForm';
import HistoryList from '../components/HistoryList';
import apiService from '../services/apiService';
import { Entry } from '../types'; // Use central types

const DashboardPage: React.FC = () => {
  const [dailySummary, setDailySummary] = useState({
    dailyEarnings: 0,
    dailyExpenses: 0,
    dailyBalance: 0,
  });
  const [dailyEntries, setDailyEntries] = useState<Entry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allEntries = await apiService.getEntries();
      calculateDailySummary(allEntries);
    } catch (error) {
      console.error('Failed to load entries', error);
    }
  };

  const calculateDailySummary = (allEntries: Entry[]) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todaysEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfDay && entryDate <= endOfDay;
    });

    const dailyEarnings = todaysEntries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const dailyExpenses = todaysEntries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    setDailySummary({
      dailyEarnings,
      dailyExpenses,
      dailyBalance: dailyEarnings - dailyExpenses,
    });
    setDailyEntries(todaysEntries);
  };

  const handleAddEntry = async (type: 'income' | 'expense', amount: number, category?: string) => {
    try {
      await apiService.addEntry({ type, amount, category, date: new Date().toISOString() });
      loadData(); // Reload data after adding a new entry
    } catch (error) {
      console.error('Failed to add entry', error);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-4">
        <Dashboard
          dailyEarnings={dailySummary.dailyEarnings}
          dailyExpenses={dailySummary.dailyExpenses}
          dailyBalance={dailySummary.dailyBalance}
        />
        <EntryForm onAddEntry={handleAddEntry} />
        <HistoryList entries={dailyEntries} />
      </Container>
    </>
  );
};

export default DashboardPage;