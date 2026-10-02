import React from 'react';
import type { NavSection } from '../../types/common';
import {
  DashboardIcon,
  CustomersIcon,
  NotificationsIcon,
  TasksIcon,
  BillingIcon,
  ReportsIcon,
} from '../common/Icons';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

interface NavItemConfig {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'customers', label: 'Customers', icon: <CustomersIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'tasks', label: 'Tasks', icon: <TasksIcon /> },
  { id: 'billing', label: 'Billing', icon: <BillingIcon /> },
  { id: 'reports', label: 'Reports', icon: <ReportsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onNavigate }) => {
  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <div className="brand-icon">SX</div>
        <div>
          <div className="brand-title">SparrowX</div>
          <div className="brand-subtitle">Web Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={currentSection === item.id ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>SparrowX Labs Platform</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Multi-Team Service Golden Path</div>
      </div>
    </aside>
  );
};
