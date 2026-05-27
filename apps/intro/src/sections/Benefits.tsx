export function Benefits() {
	return (
		<section className="bg-background-200 px-24 py-96 border-t border-divider">
			<div className="mx-auto max-w-[112rem]">
				<h2 className="font-header font-bold text-h-2 mb-16 text-dark-primary">Varför inte bara bygga själv</h2>
				<p className="text-lead leading-normal text-dark-secondary mb-48 max-w-[70ch]">
					Den fråga som alltid kommer. Här är vad du faktiskt får – och vad du slipper – när du
					använder ett centralt designsystem istället för att rita varje sida från noll.
				</p>

				<div className="grid gap-24 md:grid-cols-2 lg:grid-cols-3">
					<Benefit
						title="Uppdateras med en kommandorad"
						body={
							<>
								<code className="font-mono">npm update @sk-web-gui/react</code> hämtar nya komponentversioner och
								varumärkesuppdateringar. Din kod ändras inte – men resultatet blir bättre.
							</>
						}
					/>
					<Benefit
						title="Dark mode på köpet"
						body={
							<>
								<code className="font-mono">colorScheme="system"</code> följer användarens OS-inställning. Inga
								extra Tailwind-klasser, ingen <code className="font-mono">prefers-color-scheme</code>-CSS att skriva.
							</>
						}
					/>
					<Benefit
						title="Tillgänglighet är inbyggd"
						body={
							<>
								WCAG 2.2 AA, synlig fokusring, semantisk HTML, tangentbordsnavigering – ärvt från komponentlagret.
								Du slipper testa det från grunden i varje ny app.
							</>
						}
					/>
					<Benefit
						title="Fyra varumärkesteman"
						body={
							<>
								<code className="font-mono">color="vattjom"</code> för standard, <code className="font-mono">"gronsta"</code> för framgång,{' '}
								<code className="font-mono">"juniskar"</code> för expressivt, <code className="font-mono">"bjornstigen"</code>{' '}
								för sekundärt – utan att rita en enda färgpalett.
							</>
						}
					/>
					<Benefit
						title="80+ komponenter färdiga"
						body={
							<>
								Button, Modal, Alert, FormControl, Table, Pagination, NavigationBar, Tabs, Accordion,
								Snackbar – pluss en hel AI-familj (AICornerModule, ChatInput, Bubble).
							</>
						}
					/>
					<Benefit
						title="AI-vänlig dokumentation"
						body={
							<>
								<a className="underline" href="https://ui.sundsvall.dev/llms-full.txt">ui.sundsvall.dev/llms-full.txt</a>{' '}
								— en AI-assistent får hela designsystemet som kontext och kan producera korrekt kod direkt mot paketen.
							</>
						}
					/>
				</div>
			</div>
		</section>
	);
}

function Benefit({ title, body }: { title: string; body: React.ReactNode }) {
	return (
		<article className="rounded-cards p-32 bg-background-content border border-divider">
			<h3 className="font-header font-bold text-h-4 text-dark-primary mb-12">{title}</h3>
			<p className="text-base leading-normal text-dark-secondary m-0">{body}</p>
		</article>
	);
}
