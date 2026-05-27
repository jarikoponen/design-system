import { Link } from '@sk-web-gui/react';

export function Footer() {
	return (
		<footer className="bg-dark-primary text-light-primary px-24 py-64 border-t border-divider">
			<div className="mx-auto max-w-[112rem] grid gap-48 md:grid-cols-3">
				<div>
					<h3 className="font-header font-bold text-h-4 text-light-primary mb-16">Portal</h3>
					<ul className="list-none p-0 m-0 flex flex-col gap-8">
						<li>
							<Link inverted href="https://ui.sundsvall.dev/identitet/farger/">
								Färgpaletten
							</Link>
						</li>
						<li>
							<Link inverted href="https://ui.sundsvall.dev/identitet/typografi/">
								Typografi
							</Link>
						</li>
						<li>
							<Link inverted href="https://ui.sundsvall.dev/komponenter/button/">
								Button-komponenten
							</Link>
						</li>
						<li>
							<Link inverted href="https://ui.sundsvall.dev/for-ai/">
								För AI-agenter
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<h3 className="font-header font-bold text-h-4 text-light-primary mb-16">Källkod</h3>
					<ul className="list-none p-0 m-0 flex flex-col gap-8">
						<li>
							<Link inverted external href="https://github.com/Sundsvallskommun/web-shared-components">
								web-shared-components
							</Link>
						</li>
						<li>
							<Link inverted external href="https://www.npmjs.com/package/@sk-web-gui/react">
								@sk-web-gui/react
							</Link>
						</li>
						<li>
							<Link inverted external href="https://www.npmjs.com/package/@sk-web-gui/core">
								@sk-web-gui/core
							</Link>
						</li>
						<li>
							<Link inverted external href="https://stilguide.sundsvall.se">
								Den ursprungliga stilguiden
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<h3 className="font-header font-bold text-h-4 text-light-primary mb-16">Den här sidan</h3>
					<p className="text-base text-light-secondary m-0 mb-12">
						Byggd med <code className="font-mono">@sk-web-gui/react</code> + Vite +{' '}
						<code className="font-mono">@sk-web-gui/core</code>-presetet. Ingen lokal hex, ingen{' '}
						återskapad CSS-variabel. Sök i koden om du vill verifiera:
					</p>
					<pre className="font-mono text-small bg-background-content text-dark-primary p-12 rounded-button-md m-0 overflow-x-auto">
						<code>grep -rn "#[0-9a-f]&#123;6&#125;" apps/intro/src/</code>
					</pre>
				</div>
			</div>

			<p className="mt-48 max-w-[112rem] mx-auto text-small text-light-secondary">
				Prototyp – inte officiell publikation. Sundsvalls kommun.
			</p>
		</footer>
	);
}
