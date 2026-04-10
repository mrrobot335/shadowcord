import React, { useState } from 'react';
import { X, User, Palette } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import ThemeSettings from './ThemeSettings';

const SettingsPage = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const sections = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'theme', label: 'Appearance', icon: <Palette size={16} /> }
  ];

  return (
    <div className="flex h-screen" style={{ background: 'var(--color-bg-1)' }}>
      <div className="p-4" style={{ width: '256px', background: 'var(--color-bg-3)', borderRight: '1px solid var(--color-border)' }}>
        <h2 className="text-xs font-semibold uppercase mb-3 px-2" style={{ color: 'var(--color-text-3)' }}>User Settings</h2>
        {sections.map(section => (
          <button key={section.id} onClick={() => setActiveSection(section.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1"
            style={{ background: activeSection === section.id ? 'var(--color-bg-5)' : 'transparent', color: activeSection === section.id ? 'var(--color-text-1)' : 'var(--color-text-2)', border: 'none', cursor: 'pointer' }}>
            {section.icon}{section.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-1)' }}>
              {sections.find(s => s.id === activeSection)?.label}
            </h1>
            <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          {activeSection === 'profile' && <ProfileSettings />}
          {activeSection === 'theme' && <ThemeSettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
