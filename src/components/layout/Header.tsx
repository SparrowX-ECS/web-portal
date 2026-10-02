import React, { useEffect, useState, useCallback } from 'react';
import type { NavSection } from '../../types/common';
import { customerApi } from '../../api/customerApi';
import { notificationApi } from '../../api/notificationApi';
import { taskApi } from '../../api/taskApi';
import { billingApi } from '../../api/billingApi';
import { reportingApi } from '../../api/reportingApi';
import { RefreshIcon } from '../common/Icons';

interface HeaderProps {
  currentSection: NavSection;
}

type ServiceStatus = 'up' | 'down' | 'checking';

interface HealthMap {
  customer: ServiceStatus;
  notification: ServiceStatus;
  task: ServiceStatus;
  billing: ServiceStatus;
  reporting: ServiceStatus;
}

const SECTION_INFO: Record<NavSection, { title: string; desc: string }> = {
  dashboard: { title: 'Dashboard', desc: 'Real-time operational summary & activity overview' },
  customers: { title: 'Customers', desc: 'Customer account management (Customer Experience Team)' },
  notifications: { title: 'Notifications', desc: 'Customer notification dispatch & tracking (Communications Team)' },
  tasks: { title: 'Tasks', desc: 'Operational task management & tracking (Operations Team)' },
  billing: { title: 'Billing', desc: 'Customer invoices & payment processing (Finance Platform Team)' },
  reports: { title: 'Reports', desc: 'Operational statistics & aggregates (Analytics Team)' },
};

export const Header: React.FC<HeaderProps> = ({ currentSection }) => {
  const [health, setHealth] = useState<HealthMap>({
    customer: 'checking',
    notification: 'checking',
    task: 'checking',
    billing: 'checking',
    reporting: 'checking',
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkAllHealth = useCallback(async () => {
    setIsChecking(true);
    setHealth({
      customer: 'checking',
      notification: 'checking',
      task: 'checking',
      billing: 'checking',
      reporting: 'checking',
    });

    const [c, n, t, b, r] = await Promise.allSettled([
      customerApi.checkHealth(),
      notificationApi.checkHealth(),
      taskApi.checkHealth(),
      billingApi.checkHealth(),
      reportingApi.checkHealth(),
    ]);

    setHealth({
      customer: c.status === 'fulfilled' ? 'up' : 'down',
      notification: n.status === 'fulfilled' ? 'up' : 'down',
      task: t.status === 'fulfilled' ? 'up' : 'down',
      billing: b.status === 'fulfilled' ? 'up' : 'down',
      reporting: r.status === 'fulfilled' ? 'up' : 'down',
    });
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkAllHealth();
  }, [checkAllHealth]);

  const { title, desc } = SECTION_INFO[currentSection];

  return (
    <header className="top-header">
      <div className="header-title-group">
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>

      <div className="service-status-bar">
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginRight: 4 }}>APIs:</span>
        <span className="service-pill" title={`Customer API is ${health.customer}`}>
          <span className={`status-dot ${health.customer}`} />
          Cust
        </span>
        <span className="service-pill" title={`Notification API is ${health.notification}`}>
          <span className={`status-dot ${health.notification}`} />
          Notif
        </span>
        <span className="service-pill" title={`Task API is ${health.task}`}>
          <span className={`status-dot ${health.task}`} />
          Task
        </span>
        <span className="service-pill" title={`Billing API is ${health.billing}`}>
          <span className={`status-dot ${health.billing}`} />
          Bill
        </span>
        <span className="service-pill" title={`Reporting API is ${health.reporting}`}>
          <span className={`status-dot ${health.reporting}`} />
          Rep
        </span>

        <button
          type="button"
          className="btn-icon"
          title="Check service health"
          onClick={checkAllHealth}
          disabled={isChecking}
          aria-label="Refresh API service health"
        >
          <RefreshIcon size={14} />
        </button>
      </div>
    </header>
  );
};
