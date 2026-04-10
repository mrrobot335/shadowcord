import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { RotateCcw } from 'lucide-react';

const PRESETS = [
  { name: 'Red & Grey (Default)', primary: '#dc2626', primaryHover: '#b91c1c', bg1: '#111111', bg2: '#1a1a1a', bg3: '#222222', bg4: '#2a2a2a', bg5: '#333333' },
  { name: 'Blue & Dark', primary: '#2563eb', primaryHover: '#1d4ed8', bg1: '#0a0f1e', bg2: '#111827', bg3: '#1e2533', bg4: '#252d3d', bg5: '#2e3747' },
  { name: 'Purple & Dark', primary: '#7c3aed', primaryHover: '#6d28d9', bg1: '#0d0a1a', bg2: '#160f2b', bg3: '#1e1538', bg4: '#251b44', bg5: '#2d2254' },
  { name: 'Green & Dark', primary: '#16a34a', primaryHover: '#15803d', bg1: '#0a130d', bg2: '#0f1f14', bg3: '#162c1c', bg4: '#1c3824', bg5: '#22452c' },
  { name: 'Orange & Dark', primary: '#ea580c', primaryHover: '#c2410c', bg1: '#111108', bg2: '#1a190d', bg3: '#222114', bg4: '#2a2a1a', bg5: '#333322' },
];

const ColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>{label}</span>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', border: 'none', background: 'transparent' }} />
      <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>{value}</span>
    </div>
  </div>
);

const ThemeSettings = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const applyPreset = (preset) => updateTheme({ primary: preset.primary, primaryHover: preset.primaryHover, bg1: preset.bg1, bg2: preset.bg2, bg3: preset.bg3, bg4: preset.bg4, bg5: preset.bg5 });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-1)' }}>Color Presets</h3>
        <div className="grid grid-cols-1 gap-2">
          {PRESETS.map(preset => (
            <button key={preset.name} onClick={() => applyPreset(preset)} className="flex items-center gap-3 p-3 rounded-lg text-left"
              style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
              <div className="flex gap-1">
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: preset.bg2 }} />
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: preset.primary }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text-1)' }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-1)' }}>Custom Colors</h3>
        <div className="space-y-3 p-4 rounded-lg" style={{ background: 'var(--color-bg-3)' }}>
          <ColorPicker label="Accent Color" value={theme.primary} onChange={(v) => updateTheme({ primary: v })} />
          <ColorPicker label="Accent Hover" value={theme.primaryHover} onChange={(v) => updateTheme({ primaryHover: v })} />
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '8px 0' }} />
          <ColorPicker label="Background Deep" value={theme.bg1} onChange={(v) => updateTheme({ bg1: v })} />
          <ColorPicker label="Background Server Bar" value={theme.bg2} onChange={(v) => updateTheme({ bg2: v })} />
          <ColorPicker label="Background Sidebar" value={theme.bg3} onChange={(v) => updateTheme({ bg3: v })} />
          <ColorPicker label="Background Content" value={theme.bg4} onChange={(v) => updateTheme({ bg4: v })} />
          <ColorPicker label="Background Input" value={theme.bg5} onChange={(v) => updateTheme({ bg5: v })} />
        </div>
      </div>

      <button onClick={resetTheme} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        style={{ background: 'var(--color-bg-5)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
        <RotateCcw size={14} />Reset to Default
      </button>
    </div>
  );
};

export default ThemeSettings;
