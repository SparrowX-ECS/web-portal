import React, { useState } from 'react';
import type { NavSection } from './types/common';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TasksPage } from './pages/TasksPage';
import { BillingPage } from './pages/BillingPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentSection} />;
      case 'customers':
        return <CustomersPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'billing':
        return <BillingPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentSection} />;
    }
  };

  return (
    <Layout currentSection={currentSection} onNavigate={setCurrentSection}>
      {renderSection()}
    </Layout>
  );
};

export default App;
