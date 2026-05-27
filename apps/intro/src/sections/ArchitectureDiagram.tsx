export function ArchitectureDiagram() {
	return (
		<section className="px-24 py-96 border-t border-divider">
			<div className="mx-auto max-w-[112rem]">
				<h2 className="font-header font-bold text-h-2 mb-16 text-dark-primary">Tre lager. Du rör bara det översta.</h2>
				<p className="text-lead leading-normal text-dark-secondary mb-48 max-w-[70ch]">
					Designsystemet är uppdelat i tre npm-paket som bygger på varandra. När varumärket eller en
					komponent förändras, uppdaterar vi paketen — du kör <code className="font-mono">npm update</code> och får ändringen automatiskt.
				</p>

				<div className="grid gap-16 lg:grid-cols-3">
					<Layer
						order="01"
						name="@sk-web-gui/theme"
						role="Tokens + GuiProvider"
						desc="Hex-värden, fontsizes, spacing, radius. Light- och dark-scheman. Levererar CSS-variabler i :root via GuiProvider."
					/>
					<Layer
						order="02"
						name="@sk-web-gui/react"
						role="Komponenter"
						desc="80+ React-komponenter byggda mot tokens. Button, Modal, FormControl, Alert — allt som behövs för en kommun-app. Kompletteras med @sk-web-gui/core (Tailwind preset)."
					/>
					<Layer
						order="03"
						name="Din applikation"
						role="Det här ligger på dig"
						desc="Du importerar komponenterna och sätter ihop sidor. Aldrig token-värden i din kod – bara props (color=, variant=) eller Tailwind-klasser från presetet."
						highlight
					/>
				</div>

				<div className="mt-48 bg-background-200 rounded-cards p-32 border border-divider">
					<p className="text-base leading-normal text-dark-secondary m-0">
						<strong className="font-header text-dark-primary">Konsekvensen:</strong> uppgraderingar är två kommandon (<code className="font-mono">npm update</code> + redeploy).
						Dark mode kostar ingen kod. Tillgänglighet är inte ett separat projekt — den ärvs från
						komponentlagret. Och en AI-assistent som läser{' '}
						<a className="underline" href="https://ui.sundsvall.dev/llms-full.txt">ui.sundsvall.dev/llms-full.txt</a>
						{' '}producerar kod som följer reglerna direkt.
					</p>
				</div>
			</div>
		</section>
	);
}

interface LayerProps {
	order: string;
	name: string;
	role: string;
	desc: string;
	highlight?: boolean;
}

function Layer({ order, name, role, desc, highlight }: LayerProps) {
	return (
		<div
			className={
				highlight
					? 'rounded-cards p-32 border-2 border-vattjom-surface-primary bg-vattjom-background-100'
					: 'rounded-cards p-32 border border-divider bg-background-content'
			}
		>
			<span className="font-mono text-small text-dark-secondary block mb-8">{order}</span>
			<h3 className="font-header font-bold text-h-3 text-dark-primary mb-4">
				<code className="font-mono text-h-4">{name}</code>
			</h3>
			<p className="font-header text-base text-vattjom-text-primary mb-16 m-0">{role}</p>
			<p className="text-base leading-normal text-dark-secondary m-0">{desc}</p>
		</div>
	);
}
