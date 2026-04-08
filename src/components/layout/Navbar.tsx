import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

export function Navbar({ isSidebarOpen, setIsSidebarOpen }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="btn"
                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
            </div>

            <div className="navbar-right">
                <button
                    onClick={toggleTheme}
                    className="btn"
                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} />}
                </button>
            </div>
        </header>
    );
}
