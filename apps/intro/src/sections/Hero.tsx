import { Button } from '@sk-web-gui/react';

const ctaPrimary =
	'inline-flex items-center justify-center gap-8 font-header font-bold no-underline px-24 py-16 rounded-button-md bg-vattjom-surface-primary text-vattjom-text-secondary hover:bg-vattjom-surface-primary-hover transition-colors';
const ctaSecondary =
	'inline-flex items-center justify-center gap-8 font-header font-bold no-underline px-24 py-16 rounded-button-md bg-vattjom-surface-accent text-vattjom-text-primary hover:bg-vattjom-surface-accent-hover transition-colors';

export function Hero() {
	return (
		<section className="bg-vattjom-background-100 px-24 py-96">
			<div className="mx-auto max-w-[112rem] grid gap-48 lg:grid-cols-[1.2fr_1fr] items-center">
				<div>
					<span className="inline-block uppercase tracking-widest font-header font-bold text-small text-vattjom-text-primary bg-vattjom-surface-accent rounded-button-md px-12 py-4 mb-16">
						Sundsvalls designsystem
					</span>
					<h1 className="font-header font-bold text-h-1 leading-tight mb-24 text-dark-primary">
						Ett designsystem som installerar sig själv.
					</h1>
					<p className="text-lead leading-normal text-dark-secondary mb-32 max-w-[60ch]">
						Den här sidan är inte byggd <em>om</em> Sundsvalls designsystem — den är byggd <em>med</em> det.
						Två rader i en <code className="font-mono">package.json</code>, och du har 80+ komponenter,
						fyra varumärkesteman, dark mode och WCAG 2.2 AA på köpet.
					</p>
					<div className="flex flex-wrap gap-16">
						<a href="#anvanda" className={ctaPrimary}>Så använder du systemet</a>
						<a href="https://ui.sundsvall.dev" target="_blank" rel="noopener noreferrer" className={ctaSecondary}>
							Öppna dokumentationen
						</a>
					</div>
					<p className="mt-24 text-small text-dark-secondary">
						Källkoden för paketen finns på{' '}
						<a
							className="underline text-vattjom-text-primary"
							href="https://github.com/Sundsvallskommun/web-shared-components"
							target="_blank"
							rel="noopener noreferrer"
						>
							web-shared-components
						</a>
						.
					</p>
				</div>
				<div className="flex flex-col gap-16">
					<Button color="vattjom" variant="primary" size="lg">
						Vattjom – primärt blått
					</Button>
					<Button color="gronsta" variant="primary" size="lg">
						Grönsta – framgång
					</Button>
					<Button color="juniskar" variant="primary" size="lg">
						Juniskär – expressiv
					</Button>
					<Button color="bjornstigen" variant="primary" size="lg">
						Björnstigen – sekundär
					</Button>
				</div>
			</div>
		</section>
	);
}
