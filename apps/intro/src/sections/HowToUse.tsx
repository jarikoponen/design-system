export function HowToUse() {
	return (
		<section id="anvanda" className="bg-background-200 px-24 py-96 border-t border-divider">
			<div className="mx-auto max-w-[112rem]">
				<h2 className="font-header font-bold text-h-2 mb-16 text-dark-primary">Så använder du systemet</h2>
				<p className="text-lead leading-normal text-dark-secondary mb-48 max-w-[70ch]">
					Tre steg. Inget mer. Den här sidan är levande bevis – kolla{' '}
					<code className="font-mono">apps/intro/src/</code> i repot.
				</p>

				<div className="grid gap-24 lg:grid-cols-3">
					<Step n="1" title="Installera paketen">
						<CodeBlock language="bash">{`npm install @sk-web-gui/react @sk-web-gui/core`}</CodeBlock>
						<p className="text-base text-dark-secondary mt-16 mb-0">
							<code className="font-mono">@sk-web-gui/react</code> är komponenterna.{' '}
							<code className="font-mono">@sk-web-gui/core</code> är Tailwind-presetet som ger dig alla
							token-klasser (<code className="font-mono">bg-vattjom-surface-primary</code> osv.).
						</p>
					</Step>

					<Step n="2" title="Wrappa appen i GuiProvider">
						<CodeBlock>{`import { GuiProvider } from '@sk-web-gui/react';

<GuiProvider colorScheme="system">
  <App />
</GuiProvider>`}</CodeBlock>
						<p className="text-base text-dark-secondary mt-16 mb-0">
							GuiProvider registrerar alla CSS-variabler i <code className="font-mono">:root</code>{' '}
							och växlar automatiskt mellan light/dark utifrån användarens OS-inställning.
						</p>
					</Step>

					<Step n="3" title="Använd komponenter">
						<CodeBlock>{`import { Button } from '@sk-web-gui/react';

<Button color="vattjom" variant="primary">
  Skicka ansökan
</Button>`}</CodeBlock>
						<p className="text-base text-dark-secondary mt-16 mb-0">
							Färger som <code className="font-mono">"vattjom"</code> och{' '}
							<code className="font-mono">"gronsta"</code> är inbyggda i komponenten. Du skriver aldrig
							ett hex-värde själv.
						</p>
					</Step>
				</div>

				<p className="mt-48 text-base text-dark-secondary max-w-[70ch]">
					Det är allt. Du har nu fyra varumärkesteman, dark mode, tillgänglig fokusring, 80+ komponenter
					och en konsekvent typografi. När designsystemet uppdateras: kör{' '}
					<code className="font-mono">npm update @sk-web-gui/react @sk-web-gui/core</code>.
				</p>
			</div>
		</section>
	);
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-cards p-32 bg-background-content border border-divider">
			<span className="font-mono text-small text-dark-secondary block mb-8">Steg {n}</span>
			<h3 className="font-header font-bold text-h-4 text-dark-primary mb-16">{title}</h3>
			{children}
		</div>
	);
}

function CodeBlock({ children, language = 'tsx' }: { children: string; language?: string }) {
	return (
		<pre className="bg-dark-primary text-light-primary rounded-button-md p-16 overflow-x-auto m-0 font-mono text-small leading-normal">
			<code data-language={language}>{children}</code>
		</pre>
	);
}
