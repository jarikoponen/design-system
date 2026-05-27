import { createContext, useContext, useState } from 'react';
import { GuiProvider, defaultTheme, ColorSchemeMode } from '@sk-web-gui/react';
import { Hero } from './sections/Hero';
import { ArchitectureDiagram } from './sections/ArchitectureDiagram';
import { HowToUse } from './sections/HowToUse';
import { LiveDemo } from './sections/LiveDemo';
import { Benefits } from './sections/Benefits';
import { Footer } from './sections/Footer';

interface ColorSchemeContext {
	colorScheme: ColorSchemeMode;
	setColorScheme: (s: ColorSchemeMode) => void;
}

const ColorSchemeCtx = createContext<ColorSchemeContext | null>(null);

export function useAppColorScheme() {
	const ctx = useContext(ColorSchemeCtx);
	if (!ctx) throw new Error('useAppColorScheme must be used inside <App>');
	return ctx;
}

export function App() {
	const [colorScheme, setColorScheme] = useState<ColorSchemeMode>(ColorSchemeMode.System);

	return (
		<ColorSchemeCtx.Provider value={{ colorScheme, setColorScheme }}>
			<GuiProvider theme={defaultTheme} colorScheme={colorScheme}>
				<div className="min-h-screen bg-background text-dark-primary">
					<Hero />
					<ArchitectureDiagram />
					<HowToUse />
					<LiveDemo />
					<Benefits />
					<Footer />
				</div>
			</GuiProvider>
		</ColorSchemeCtx.Provider>
	);
}
