
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeMode, CornerStyle, UI_Density, FontFamily, AnimationSpeed } from '../types';

const ThemeSettings: React.FC = () => {
  const { settings, updateSetting, resetTheme } = useTheme();

  // Preset Options
  const accentColors = [
    { name: 'Neon Green', value: '#00FF8A' },
    { name: 'Electric Blue', value: '#1E88E5' },
    { name: 'Purple Glow', value: '#9B59FF' },
    { name: 'Orange Gold', value: '#FFC47C' },
    { name: 'Red Energy', value: '#FF4A4A' },
    { name: 'Teal Wave', value: '#1ABC9C' },
  ];

  const fonts: FontFamily[] = ['Inter', 'SF Pro', 'Poppins', 'Roboto'];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Appearance</h1>
          <p className="text-[var(--text-secondary)] mt-1">Customize the look and feel of your trading dashboard.</p>
        </div>
        <button 
          onClick={resetTheme}
          className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-color)] rounded-[var(--border-radius)] hover:bg-[var(--bg-card)] transition-colors"
        >
          Reset to Default
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Settings Controls */}
        <div className="space-y-8">
          
          {/* 1. Theme Modes */}
          <section className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)]">
             <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Theme Mode</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               {(['light', 'dark', 'amoled', 'auto'] as ThemeMode[]).map(mode => (
                 <button
                   key={mode}
                   onClick={() => updateSetting('mode', mode)}
                   className={`
                     px-3 py-3 rounded-[var(--border-radius)] text-sm font-medium capitalize border transition-all duration-[var(--transition-speed)]
                     ${settings.mode === mode 
                       ? 'border-[var(--accent-color)] bg-[var(--accent-glow)] text-[var(--accent-color)]' 
                       : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'}
                   `}
                 >
                   {mode === 'amoled' ? 'AMOLED' : mode}
                 </button>
               ))}
             </div>
          </section>

          {/* 2. Accent Color */}
          <section className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)]">
             <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Accent Color</h3>
             <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {accentColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting('accentColor', color.value)}
                    className={`
                      relative h-12 rounded-full border-2 transition-transform duration-[var(--transition-speed)] hover:scale-110
                      ${settings.accentColor === color.value ? 'border-white ring-2 ring-[var(--accent-color)]' : 'border-transparent'}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {settings.accentColor === color.value && (
                       <div className="absolute inset-0 flex items-center justify-center">
                         <svg className="w-5 h-5 text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                         </svg>
                       </div>
                    )}
                  </button>
                ))}
             </div>
          </section>

          {/* 3. UI Density */}
          <section className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)]">
             <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">UI Density</h3>
             <div className="flex bg-[var(--bg-main)] p-1 rounded-[var(--border-radius)]">
                {(['compact', 'comfort', 'expanded'] as UI_Density[]).map(d => (
                   <button
                     key={d}
                     onClick={() => updateSetting('density', d)}
                     className={`flex-1 py-2 text-sm font-medium capitalize rounded-[var(--border-radius)] transition-all duration-[var(--transition-speed)]
                       ${settings.density === d ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                     `}
                   >
                     {d}
                   </button>
                ))}
             </div>
          </section>

          {/* 4. Tile Style */}
          <section className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)]">
             <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Corner Style</h3>
             <div className="grid grid-cols-2 gap-3">
               {(['rounded', 'extra-rounded', 'sharp', 'glass'] as CornerStyle[]).map(style => (
                 <button
                   key={style}
                   onClick={() => updateSetting('cornerStyle', style)}
                   className={`
                     px-4 py-3 text-sm font-medium border transition-all duration-[var(--transition-speed)]
                     ${settings.cornerStyle === style 
                        ? 'border-[var(--accent-color)] bg-[var(--accent-glow)] text-[var(--text-primary)]' 
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'}
                   `}
                   style={{ 
                     borderRadius: style === 'extra-rounded' ? '24px' : style === 'sharp' ? '0px' : style === 'rounded' ? '12px' : '16px',
                     backdropFilter: style === 'glass' ? 'blur(10px)' : 'none'
                   }}
                 >
                   {style.replace('-', ' ')}
                 </button>
               ))}
             </div>
          </section>

        </div>

        {/* Right Column: More Settings + Live Preview */}
        <div className="space-y-8">
           
           {/* 5. Typography */}
           <section className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Typography</h3>
                <span className="text-xs text-[var(--text-secondary)] border border-[var(--border-color)] px-2 py-1 rounded-[var(--border-radius)]">
                   {settings.fontSize}
                </span>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-2 block">Font Family</label>
                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {fonts.map(font => (
                         <button
                           key={font}
                           onClick={() => updateSetting('fontFamily', font)}
                           className={`
                             whitespace-nowrap px-4 py-2 text-sm border rounded-[var(--border-radius)] transition-all
                             ${settings.fontFamily === font 
                                ? 'border-[var(--accent-color)] text-[var(--text-primary)] bg-[var(--accent-glow)]' 
                                : 'border-[var(--border-color)] text-[var(--text-secondary)]'}
                           `}
                           style={{ fontFamily: font }}
                         >
                           {font}
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-2 block">Font Size</label>
                   <input 
                     type="range" 
                     min="0" max="3" step="1"
                     value={['small', 'medium', 'large', 'xl'].indexOf(settings.fontSize)}
                     onChange={(e) => updateSetting('fontSize', ['small', 'medium', 'large', 'xl'][parseInt(e.target.value)] as any)}
                     className="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                   />
                   <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2">
                      <span>Small</span>
                      <span>Medium</span>
                      <span>Large</span>
                      <span>XL</span>
                   </div>
                </div>
             </div>
           </section>

           {/* 6. Animations */}
           <section className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)]">
             <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Motion & Animation</h3>
             <div className="flex bg-[var(--bg-main)] p-1 rounded-[var(--border-radius)]">
                {(['smooth', 'fast', 'reduced'] as AnimationSpeed[]).map(spd => (
                   <button
                     key={spd}
                     onClick={() => updateSetting('animationSpeed', spd)}
                     className={`flex-1 py-2 text-sm font-medium capitalize rounded-[var(--border-radius)] transition-all duration-[var(--transition-speed)]
                       ${settings.animationSpeed === spd ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                     `}
                   >
                     {spd}
                   </button>
                ))}
             </div>
           </section>

           {/* Live Preview Card */}
           <div className="bg-[var(--bg-card)] p-6 rounded-[var(--border-radius)] border border-[var(--border-color)] shadow-lg transition-all duration-[var(--transition-speed)]" style={{ borderColor: 'var(--accent-color)', boxShadow: '0 0 15px var(--accent-glow)' }}>
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: 'var(--accent-color)' }}>
                       TS
                    </div>
                    <div>
                       <h4 className="font-bold text-[var(--text-primary)] leading-none">Theme Preview</h4>
                       <p className="text-xs text-[var(--text-secondary)] mt-1">Live UI reflection</p>
                    </div>
                 </div>
                 <button className="px-3 py-1 rounded-[var(--border-radius)] text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--accent-color)' }}>
                    Action
                 </button>
              </div>
              
              <div className="space-y-3">
                 <div className="h-2 w-3/4 rounded bg-[var(--bg-main)]"></div>
                 <div className="h-2 w-1/2 rounded bg-[var(--bg-main)]"></div>
              </div>

              <div className="mt-6 flex gap-3">
                 <div className="flex-1 p-3 rounded-[var(--border-radius)] bg-[var(--bg-main)] border border-[var(--border-color)] text-center">
                    <span className="block text-xl font-bold text-[var(--text-primary)]">1.2%</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Gain</span>
                 </div>
                 <div className="flex-1 p-3 rounded-[var(--border-radius)] bg-[var(--bg-main)] border border-[var(--border-color)] text-center">
                    <span className="block text-xl font-bold text-[var(--text-primary)]">4.5x</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Volume</span>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
