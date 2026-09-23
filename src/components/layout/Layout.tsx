import React from 'react';
import type { NavSection } from '../../types/common';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentSection, onNavigate, children }) => {
  return (
    <div className="app-container">
      <Sidebar currentSection={currentSection} onNavigate={onNavigate} />
      <div className="main-content">
        <Header currentSection={currentSection} />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
};
