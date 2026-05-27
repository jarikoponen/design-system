import { useState } from 'react';
import {
	Alert,
	Button,
	ColorSchemeMode,
	FormControl,
	FormLabel,
	FormHelperText,
	Input,
	Modal,
	RadioButton,
} from '@sk-web-gui/react';
import { useAppColorScheme } from '../App';

export function LiveDemo() {
	const { colorScheme, setColorScheme } = useAppColorScheme();
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<section className="px-24 py-96 border-t border-divider">
			<div className="mx-auto max-w-[112rem]">
				<h2 className="font-header font-bold text-h-2 mb-16 text-dark-primary">Allt på den här sidan kommer från npm</h2>
				<p className="text-lead leading-normal text-dark-secondary mb-32 max-w-[70ch]">
					Knapparna, formulärfälten, modalen — inget av det är gjort för demonstrationen. Det är
					komponenter importerade rakt från <code className="font-mono">@sk-web-gui/react</code>.
				</p>

				<div className="mb-48 rounded-cards p-24 bg-vattjom-background-100 border border-vattjom-surface-accent">
					<p className="font-header text-base text-vattjom-text-primary mb-12 m-0 font-bold">
						Prova: växla färgschema och se hur hela sidan följer med.
					</p>
					<div className="flex flex-wrap gap-12 items-center">
						<RadioButton
							name="colorScheme"
							value={ColorSchemeMode.Light}
							checked={colorScheme === ColorSchemeMode.Light}
							onChange={() => setColorScheme(ColorSchemeMode.Light)}
						>
							Light
						</RadioButton>
						<RadioButton
							name="colorScheme"
							value={ColorSchemeMode.Dark}
							checked={colorScheme === ColorSchemeMode.Dark}
							onChange={() => setColorScheme(ColorSchemeMode.Dark)}
						>
							Dark
						</RadioButton>
						<RadioButton
							name="colorScheme"
							value={ColorSchemeMode.System}
							checked={colorScheme === ColorSchemeMode.System}
							onChange={() => setColorScheme(ColorSchemeMode.System)}
						>
							System
						</RadioButton>
					</div>
				</div>

				<div className="grid gap-24 lg:grid-cols-2">
					<Panel title="Button — alla teman">
						<div className="flex flex-wrap gap-12">
							<Button color="vattjom" variant="primary">Skicka</Button>
							<Button color="gronsta" variant="primary">Godkänn</Button>
							<Button color="juniskar" variant="primary">Påbörja</Button>
							<Button color="bjornstigen" variant="primary">Utforska</Button>
						</div>
						<div className="flex flex-wrap gap-12 mt-16">
							<Button color="vattjom" variant="primary">Primary</Button>
							<Button color="vattjom" variant="secondary">Secondary</Button>
							<Button color="vattjom" variant="tertiary">Tertiary</Button>
							<Button color="vattjom" variant="ghost">Ghost</Button>
						</div>
						<div className="flex flex-wrap gap-12 mt-16 items-center">
							<Button color="vattjom" size="sm">Liten</Button>
							<Button color="vattjom" size="md">Mellan</Button>
							<Button color="vattjom" size="lg">Stor</Button>
						</div>
					</Panel>

					<Panel title="Alert — fyra typer">
						<div className="flex flex-col gap-12">
							{(['info', 'success', 'warning', 'error'] as const).map((type) => (
								<Alert key={type} type={type}>
									<Alert.Icon />
									<Alert.Content>
										<Alert.Content.Title>
											{type === 'info' && 'Bra att veta'}
											{type === 'success' && 'Klart'}
											{type === 'warning' && 'Observera'}
											{type === 'error' && 'Något gick fel'}
										</Alert.Content.Title>
										<Alert.Content.Description>
											{type === 'info' && 'Ansökan tar 1–2 minuter att fylla i.'}
											{type === 'success' && 'Du har skickat in din ansökan.'}
											{type === 'warning' && 'Vissa fält behöver kompletteras.'}
											{type === 'error' && 'E-postadressen saknar ett snabel-a.'}
										</Alert.Content.Description>
									</Alert.Content>
								</Alert>
							))}
						</div>
					</Panel>

					<Panel title="Formulär — FormControl + Input">
						<FormControl id="demo-namn">
							<FormLabel>Namn</FormLabel>
							<Input placeholder="Förnamn Efternamn" />
							<FormHelperText>Använd det namn du vill bli kallad.</FormHelperText>
						</FormControl>
					</Panel>

					<Panel title="Modal — riktig dialog">
						<Button color="vattjom" variant="primary" onClick={() => setModalOpen(true)}>
							Öppna en modal
						</Button>
						<Modal
							show={modalOpen}
							label="En verklig modal från @sk-web-gui/react"
							onClose={() => setModalOpen(false)}
						>
							<p className="text-base m-0 mb-16">
								Den här modalen är inte byggd för demon. Den är samma komponent som du själv får när
								du gör <code className="font-mono">import &#123; Modal &#125; from '@sk-web-gui/react'</code>.
							</p>
							<p className="text-base m-0 mb-16 text-dark-secondary">
								Tangentbordet fungerar (Esc stänger), fokus återgår till knappen som öppnade den,
								och bakgrunden är otillgänglig medan modalen är öppen — utan att vi gjort något.
							</p>
							<div className="flex gap-12 justify-end mt-24">
								<Button variant="tertiary" onClick={() => setModalOpen(false)}>
									Stäng
								</Button>
							</div>
						</Modal>
					</Panel>
				</div>
			</div>
		</section>
	);
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-cards p-32 bg-background-200 border border-divider">
			<h3 className="font-header font-bold text-h-4 text-dark-primary mb-24">{title}</h3>
			{children}
		</div>
	);
}
