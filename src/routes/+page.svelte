<script lang="ts">
	import { getThemeContext } from '$lib/stores/theme-store.svelte';
	import Logo from '$lib/components/brand/Logo.svelte';
	import { Moon, Sun } from '@lucide/svelte';

	const theme = getThemeContext();

	const GITHUB_URL = 'https://github.com/doublej/mermaid-gantt';

	// Hero example: one entry per Mermaid line, so each bar sits on the row of the line that defines it.
	const SPAN_DAYS = 35;
	const WEEKS = ['Oct 5', 'Oct 12', 'Oct 19', 'Oct 26', 'Nov 2'];

	interface SheetLine {
		kind: 'meta' | 'title' | 'axis' | 'section' | 'task' | 'milestone';
		keyword?: string;
		text: string;
		tags?: string;
		start?: number;
		days?: number;
		color?: string;
	}

	const lines: SheetLine[] = [
		{ kind: 'meta', keyword: 'gantt', text: '' },
		{ kind: 'title', keyword: 'title', text: 'Product launch' },
		{ kind: 'axis', keyword: 'dateFormat', text: 'YYYY-MM-DD' },
		{ kind: 'section', keyword: 'section', text: 'Planning' },
		{ kind: 'task', text: 'User research', tags: 'done, research, 2026-10-05, 7d', start: 0, days: 7, color: 'var(--color-status-done)' },
		{ kind: 'task', text: 'Design sprint', tags: 'active, design, after research, 7d', start: 7, days: 7, color: 'var(--color-status-active)' },
		{ kind: 'section', keyword: 'section', text: 'Build' },
		{ kind: 'task', text: 'Frontend', tags: 'frontend, after design, 14d', start: 14, days: 14, color: 'var(--color-accent)' },
		{ kind: 'task', text: 'API', tags: 'crit, api, after design, 10d', start: 14, days: 10, color: 'var(--color-status-critical)' },
		{ kind: 'section', keyword: 'section', text: 'Launch' },
		{ kind: 'milestone', text: 'Release', tags: 'milestone, release, after frontend, 0d', start: 28, days: 0, color: 'var(--color-status-milestone)' }
	];

	const INDENT = '    ';

	const shortcuts = [
		{ keys: ['Ctrl', 'N'], action: 'New task' },
		{ keys: ['Ctrl', '←', '→'], action: 'Move a task by one day' },
		{ keys: ['Ctrl', 'K'], action: 'Command palette' },
		{ keys: ['?'], action: 'All shortcuts' }
	];

	const comparison = [
		{ label: 'Price', values: ['Free', '$30+/user/mo', '$8+/user/mo', '$49+/mo'] },
		{ label: 'Account required', values: ['No', 'Yes', 'Yes', 'Yes'] },
		{ label: 'Embeds in Markdown docs', values: ['Yes', 'No', 'No', 'No'] },
		{ label: 'Diffable in Git', values: ['Yes', 'No', 'No', 'No'] },
		{ label: 'Vendor lock-in', values: ['None', 'High', 'Medium', 'Medium'] }
	];

	const tradeoffs = [
		{ need: 'Resource workload balancing', tool: 'GanttPRO or MS Project' },
		{ need: 'Real-time collaborative editing', tool: 'Any paid tool' },
		{ need: 'Enterprise SSO and compliance', tool: 'MS Project' },
		{ need: 'Critical path analysis', tool: 'GanttPRO or MS Project' },
		{ need: 'Non-technical stakeholders editing the plan', tool: 'TeamGantt or GanttPRO' }
	];
</script>

<svelte:head>
	<title>Mermaid Gantt — Plan at the speed of thought</title>
	<meta
		name="description"
		content="Build Gantt charts with your keyboard and plain-text Mermaid. Diff them in Git, drop them in any Markdown file, and keep your data in your browser. Free, no signup."
	/>
</svelte:head>

<div class="page">
	<nav class="nav">
		<div class="wrap nav-inner">
			<a href="/" class="nav-home" aria-label="Mermaid Gantt home"><Logo size={26} showText /></a>
			<div class="nav-actions">
				<a href={GITHUB_URL} class="nav-link" target="_blank" rel="noopener">GitHub</a>
				<button
					onclick={() => theme.toggleTheme()}
					class="theme-btn"
					aria-label={theme.resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
				>
					{#if theme.resolvedTheme === 'light'}
						<Moon size={18} />
					{:else}
						<Sun size={18} />
					{/if}
				</button>
				<a href="/editor" class="btn btn-primary btn-sm">Open editor</a>
			</div>
		</div>
	</nav>

	<header class="hero">
		<div class="wrap">
			<div class="hero-top">
				<h1 class="hero-title">Plan at the speed of thought</h1>
				<div class="hero-copy">
					<p class="lead">
						A keyboard-first Gantt editor built on plain-text Mermaid. Type your plan, watch the
						timeline build itself — no mouse, no signup, no lock-in.
					</p>
					<div class="actions">
						<a href="/editor" class="btn btn-primary">Open the editor</a>
						<a href={GITHUB_URL} class="btn btn-quiet" target="_blank" rel="noopener">View on GitHub</a>
					</div>
					<p class="assurance">Free to use. No account. Charts are saved in your browser, not on a server.</p>
				</div>
			</div>

			<figure class="sheet" aria-labelledby="sheet-caption">
				<div class="sheet-head">
					<span class="sheet-file">launch.mmd</span>
					<span class="sheet-view">Timeline</span>
				</div>
				<div class="sheet-body" style="--span: {SPAN_DAYS}">
					{#each lines as line, i}
						<div class="row row-{line.kind}" style="--i: {i}; --start: {line.start ?? 0}; --days: {line.days ?? 0}; --c: {line.color ?? 'transparent'}">
							<code class="src">{#if line.keyword}{line.keyword === 'gantt' ? '' : INDENT}<span class="kw">{line.keyword}</span>{line.text ? ` ${line.text}` : ''}{:else}{INDENT}<span class="name">{line.text.padEnd(14)}</span><span class="tags">:{line.tags}</span>{/if}</code>
							<div class="lane" aria-hidden="true">
								{#if line.kind === 'title'}
									<span class="lane-title">{line.text}</span>
								{:else if line.kind === 'axis'}
									{#each WEEKS as week, w}
										<span class="tick" style="--w: {w}">{week}</span>
									{/each}
								{:else if line.kind === 'section'}
									<span class="lane-section">{line.text}</span>
								{:else if line.kind === 'task' || line.kind === 'milestone'}
									<span class="bar"></span>
									<span class="bar-label">{line.text}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
				<figcaption id="sheet-caption" class="sheet-caption">
					Each line of Mermaid is one row on the timeline. Edit either side and the other follows.
				</figcaption>
			</figure>
		</div>
	</header>

	<main>
		<section class="section" aria-labelledby="features-title">
			<div class="wrap">
				<h2 id="features-title" class="section-title">For plans that live next to your code</h2>
				<div class="features">
					<article class="feature">
						<h3 class="feature-title">Keyboard first</h3>
						<p>Add, move, and reschedule tasks without reaching for the mouse. Every action has a shortcut.</p>
						<dl class="keys">
							{#each shortcuts as shortcut}
								<div class="key-row">
									<dt>{#each shortcut.keys as key}<kbd>{key}</kbd>{/each}</dt>
									<dd>{shortcut.action}</dd>
								</div>
							{/each}
						</dl>
					</article>
					<article class="feature">
						<h3 class="feature-title">Plain-text Mermaid</h3>
						<p>
							Import and export standard Mermaid. Your timeline is plain text: diff it, review it in
							pull requests, paste it into any Markdown file.
						</p>
						<p class="feature-note">Renders in GitHub, GitLab, Notion, and Obsidian.</p>
					</article>
					<article class="feature">
						<h3 class="feature-title">Drag when it's faster</h3>
						<p>
							Drag a bar to reschedule, drag an edge to resize, click to rename. The Mermaid source
							updates as you go.
						</p>
					</article>
					<article class="feature">
						<h3 class="feature-title">Nothing to set up</h3>
						<p>No account, no installation, no trial, no seat limit. Open the editor and start typing.</p>
					</article>
				</div>
			</div>
		</section>

		<section class="section section-alt" aria-labelledby="privacy-title">
			<div class="wrap split">
				<div>
					<h2 id="privacy-title" class="section-title">Your plans stay in your browser</h2>
					<p class="section-intro">
						Mermaid Gantt is a static site with no backend. There is nothing to sign in to and nowhere
						for your charts to go.
					</p>
				</div>
				<dl class="facts">
					<div class="fact">
						<dt>Storage</dt>
						<dd>Charts are saved in your browser's local storage, on this device only.</dd>
					</div>
					<div class="fact">
						<dt>Export</dt>
						<dd>Download Mermaid (.mmd), JSON, or CSV, or export PNG and PDF, whenever you want.</dd>
					</div>
					<div class="fact">
						<dt>Analytics</dt>
						<dd>Page views are counted with Umami, which sets no cookies. Chart content is never sent.</dd>
					</div>
					<div class="fact">
						<dt>Source</dt>
						<dd>
							The full source code is public on
							<a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>.
						</dd>
					</div>
				</dl>
			</div>
		</section>

		<section class="section" aria-labelledby="compare-title">
			<div class="wrap">
				<h2 id="compare-title" class="section-title">Mermaid Gantt next to paid tools</h2>
				<p class="section-intro">Where plain text wins, and where a paid tool earns its price.</p>

				<div class="table-scroll">
					<table class="compare">
						<thead>
							<tr>
								<td></td>
								<th scope="col" class="ours">Mermaid Gantt</th>
								<th scope="col">MS Project</th>
								<th scope="col">GanttPRO</th>
								<th scope="col">TeamGantt</th>
							</tr>
						</thead>
						<tbody>
							{#each comparison as row}
								<tr>
									<th scope="row">{row.label}</th>
									{#each row.values as value, v}
										<td class:ours={v === 0}>{value}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="table-note">Prices are each vendor's published starting price and may change.</p>

				<h3 class="subhead">When a paid tool fits better</h3>
				<ul class="tradeoffs">
					{#each tradeoffs as item}
						<li class="tradeoff">
							<span>{item.need}</span>
							<span class="tradeoff-tool">{item.tool}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<section class="section closing" aria-labelledby="closing-title">
			<div class="wrap">
				<h2 id="closing-title" class="section-title">Ready to plan at the speed of thought?</h2>
				<p class="section-intro">Start from a blank chart, or import Mermaid you already have.</p>
				<div class="actions">
					<a href="/editor" class="btn btn-primary">Open the editor</a>
				</div>
			</div>
		</section>
	</main>

	<footer class="footer">
		<div class="wrap footer-inner">
			<Logo size={20} showText />
			<nav class="footer-links" aria-label="Footer">
				<a href="/editor">Editor</a>
				<a href="/brand">Brand</a>
				<a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
			</nav>
		</div>
	</footer>
</div>

<style>
	/* Tokens: built on the app palette so light/dark follow the theme store.
	   Primary is the brand sky one step deeper than the editor's accent, so white text passes AA. */
	.page {
		--ink: var(--color-text);
		--ink-2: var(--color-text-secondary);
		--ink-3: var(--color-text-tertiary);
		--rule: var(--color-border);
		--primary: #0369a1;
		--primary-hover: #075985;
		--on-primary: #ffffff;
		--row: 40px; /* the editor's ROW_HEIGHT */
		--code-col: 31rem;

		min-height: 100vh;
		background: var(--color-bg);
		color: var(--ink);
		font-size: 1rem;
		line-height: 1.6;
	}

	:global(html.dark) .page {
		--primary: #38bdf8;
		--primary-hover: #7dd3fc;
		--on-primary: #082f49;
	}

	.wrap {
		max-width: 70rem;
		margin: 0 auto;
		padding-inline: 1.5rem;
	}

	a {
		color: inherit;
	}

	:focus-visible {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
		border-radius: 4px;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2.75rem;
		padding: 0 1.25rem;
		border-radius: 6px;
		font-size: 0.9375rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.btn-sm {
		height: 2.25rem;
		padding: 0 0.875rem;
		font-size: 0.875rem;
	}

	.btn-primary {
		background: var(--primary);
		color: var(--on-primary);
	}

	.btn-primary:hover {
		background: var(--primary-hover);
	}

	.btn-quiet {
		background: var(--color-surface);
		color: var(--ink);
		border: 1px solid var(--color-border-emphasis);
	}

	.btn-quiet:hover {
		border-color: var(--ink-3);
	}

	/* Nav */
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--color-bg) 92%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--rule);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 3.75rem;
	}

	.nav-home {
		text-decoration: none;
		white-space: nowrap;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-link {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--ink-2);
		text-decoration: none;
	}

	.nav-link:hover {
		color: var(--ink);
	}

	.theme-btn {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		margin-right: 0.25rem;
		border-radius: 6px;
		color: var(--ink-2);
	}

	.theme-btn:hover {
		color: var(--ink);
		background: var(--color-surface-elevated);
	}

	/* Hero */
	.hero {
		padding-block: 5.5rem 6rem;
	}

	.hero-top {
		display: grid;
		grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
		gap: 2rem 4rem;
		align-items: end;
	}

	.hero-title {
		margin: 0;
		font-size: clamp(2.75rem, 6vw, 4.5rem);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.lead {
		margin: 0;
		font-size: 1.1875rem;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.75rem;
	}

	.assurance {
		margin: 1rem 0 0;
		font-size: 0.875rem;
		color: var(--ink-3);
	}

	/* The sheet: Mermaid source and rendered timeline, locked row to row */
	.sheet {
		margin: 4rem 0 0;
		background: var(--color-surface);
		border: 1px solid var(--rule);
		border-radius: 10px;
		box-shadow: 0 30px 60px -40px rgb(3 40 70 / 0.35);
		overflow: hidden;
	}

	.sheet-head,
	.row {
		display: grid;
		grid-template-columns: var(--code-col) minmax(0, 1fr);
	}

	.sheet-head {
		height: var(--row);
		align-items: center;
		border-bottom: 1px solid var(--rule);
		font-size: 0.8125rem;
		color: var(--ink-2);
	}

	.sheet-file {
		padding-inline: 1.25rem;
		font-family: var(--font-family-mono);
		border-right: 1px solid var(--rule);
		line-height: var(--row);
	}

	.sheet-view {
		padding-inline: 1rem;
	}

	.sheet-body {
		padding-block: 0.5rem;
	}

	.row {
		height: var(--row);
	}

	.row-section {
		background: var(--color-surface-elevated);
	}

	.src {
		display: block;
		overflow: hidden;
		line-height: var(--row);
		padding-inline: 1.25rem;
		font-family: var(--font-family-mono);
		font-size: 0.8125rem;
		white-space: pre;
		color: var(--ink-3);
		border-right: 1px solid var(--rule);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.kw {
		color: var(--primary);
	}

	.name {
		color: var(--ink);
	}

	.tags {
		color: var(--ink-2);
	}

	.lane {
		position: relative;
		background-image: repeating-linear-gradient(to right, var(--rule) 0 1px, transparent 1px 20%);
	}

	.row-meta .lane,
	.row-title .lane {
		background-image: none;
	}

	.lane-title,
	.lane-section {
		position: absolute;
		inset: 0 auto 0 1rem;
		display: flex;
		align-items: center;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.lane-section {
		color: var(--ink-2);
	}

	.tick {
		position: absolute;
		top: 50%;
		left: calc(var(--w) * 20%);
		padding-left: 0.5rem;
		transform: translateY(-50%);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		color: var(--ink-3);
	}

	.bar {
		position: absolute;
		top: 50%;
		left: calc(var(--start) * 100% / var(--span));
		width: calc(var(--days) * 100% / var(--span));
		height: 20px;
		margin-top: -10px;
		border-radius: 4px;
		background: var(--c);
		transform-origin: left center;
		animation: grow 700ms var(--ease-out) both;
		animation-delay: calc(var(--i) * 70ms + 150ms);
	}

	.row-milestone .bar {
		width: 14px;
		height: 14px;
		margin: -7px 0 0 -7px;
		border-radius: 2px;
		rotate: 45deg;
		transform-origin: center;
		animation-name: pop;
	}

	.bar-label {
		position: absolute;
		top: 50%;
		left: calc((var(--start) + var(--days)) * 100% / var(--span));
		padding-left: 0.625rem;
		transform: translateY(-50%);
		font-size: 0.8125rem;
		white-space: nowrap;
		color: var(--ink);
		animation: appear 400ms var(--ease-out) both;
		animation-delay: calc(var(--i) * 70ms + 600ms);
	}

	.row-milestone .bar-label {
		padding-left: 1rem;
	}

	.row:hover .src {
		background: var(--color-accent-subtle);
	}

	.row:hover .bar {
		outline: 2px solid var(--c);
		outline-offset: 2px;
	}

	.sheet-caption {
		padding: 0.75rem 1.25rem;
		border-top: 1px solid var(--rule);
		font-size: 0.8125rem;
		color: var(--ink-2);
	}

	@keyframes grow {
		from {
			scale: 0 1;
		}
	}

	@keyframes pop {
		from {
			scale: 0;
		}
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}

	/* Sections */
	.section {
		padding-block: 6rem;
	}

	.section-alt {
		background: var(--color-surface);
		border-block: 1px solid var(--rule);
	}

	.section-title {
		margin: 0;
		max-width: 22ch;
		font-size: clamp(1.75rem, 3.2vw, 2.375rem);
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.section-intro {
		margin: 1rem 0 0;
		max-width: 38rem;
		font-size: 1.0625rem;
		color: var(--ink-2);
	}

	/* Features */
	.features {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 4rem;
		margin-top: 3rem;
	}

	.feature {
		padding-block: 1.75rem 2.5rem;
		border-top: 1px solid var(--rule);
	}

	.feature p {
		margin: 0.5rem 0 0;
		max-width: 34rem;
		color: var(--ink-2);
	}

	.feature-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.feature .feature-note {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: var(--ink-3);
	}

	.keys {
		display: grid;
		gap: 0.625rem;
		margin: 1.25rem 0 0;
	}

	.key-row {
		display: grid;
		grid-template-columns: 7.5rem 1fr;
		align-items: center;
		gap: 1rem;
		font-size: 0.875rem;
	}

	.key-row dt {
		display: flex;
		gap: 0.25rem;
	}

	.key-row dd {
		margin: 0;
		color: var(--ink-2);
	}

	kbd {
		min-width: 1.75rem;
		padding: 0.125rem 0.375rem;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		text-align: center;
		color: var(--ink);
		background: var(--color-surface);
		border: 1px solid var(--color-border-emphasis);
		border-bottom-width: 2px;
		border-radius: 4px;
	}

	/* Privacy */
	.split {
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		gap: 3rem 5rem;
	}

	.facts {
		margin: 0;
	}

	.fact {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 1.5rem;
		padding-block: 1.25rem;
		border-top: 1px solid var(--rule);
	}

	.fact:last-child {
		border-bottom: 1px solid var(--rule);
	}

	.fact dt {
		font-weight: 600;
	}

	.fact dd {
		margin: 0;
		color: var(--ink-2);
	}

	.fact a {
		color: var(--primary);
		text-underline-offset: 3px;
	}

	/* Comparison */
	.table-scroll {
		margin-top: 2.5rem;
		overflow-x: auto;
		background: var(--color-surface);
		border: 1px solid var(--rule);
		border-radius: 10px;
	}

	.compare {
		width: 100%;
		min-width: 40rem;
		border-collapse: collapse;
		font-size: 0.9375rem;
	}

	.compare th,
	.compare td {
		padding: 0.875rem 1.25rem;
		text-align: left;
		border-bottom: 1px solid var(--rule);
	}

	.compare tbody tr:last-child > * {
		border-bottom: 0;
	}

	.compare thead th {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--ink-2);
	}

	.compare tbody th {
		font-weight: 500;
	}

	.compare td {
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}

	.compare .ours {
		background: var(--color-accent-subtle);
		color: var(--ink);
		font-weight: 600;
	}

	.table-note {
		margin: 0.75rem 0 0;
		font-size: 0.8125rem;
		color: var(--ink-3);
	}

	.subhead {
		margin: 4rem 0 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.tradeoffs {
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}

	.tradeoff {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.25rem 2rem;
		padding-block: 0.875rem;
		border-top: 1px solid var(--rule);
	}

	.tradeoff-tool {
		color: var(--ink-2);
	}

	/* Closing + footer */
	.closing {
		border-top: 1px solid var(--rule);
	}

	.footer {
		border-top: 1px solid var(--rule);
	}

	.footer-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 2rem;
		color: var(--ink-2);
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
		font-size: 0.875rem;
	}

	.footer-links a {
		color: var(--ink-2);
		text-decoration: none;
	}

	.footer-links a:hover {
		color: var(--ink);
	}

	/* Narrow screens */
	@media (max-width: 860px) {
		.hero {
			padding-block: 3.5rem 4rem;
		}

		.hero-top,
		.split,
		.features {
			grid-template-columns: minmax(0, 1fr);
		}

		.section {
			padding-block: 4.5rem;
		}

		/* Stack each source line over a thin bar; widest line sets the scroll width */
		.sheet-body {
			display: grid;
			grid-template-columns: minmax(100%, max-content);
			overflow-x: auto;
		}

		.sheet-head,
		.row {
			grid-template-columns: minmax(0, 1fr);
		}

		.sheet-file {
			border-right: 0;
		}

		.sheet-view,
		.row-meta .lane,
		.row-title .lane,
		.row-axis .lane,
		.row-section .lane,
		.bar-label {
			display: none;
		}

		.row {
			height: auto;
		}

		.src {
			line-height: 2rem;
			padding-inline: 1rem;
			border-right: 0;
			font-size: 0.75rem;
		}

		.lane {
			height: 0.875rem;
			margin-inline: 1rem;
			background-image: none;
		}

		.bar {
			height: 6px;
			margin-top: -3px;
		}

		.row-milestone .bar {
			width: 8px;
			height: 8px;
			margin: -4px 0 0 -4px;
		}
	}

	@media (max-width: 480px) {
		.wrap {
			padding-inline: 1rem;
		}

		.nav-link {
			display: none;
		}

		.nav-actions {
			gap: 0.25rem;
		}

		.fact,
		.key-row {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.25rem;
		}
	}

	/* Phones: the logo and the editor button need the room more than the theme toggle does */
	@media (max-width: 400px) {
		.theme-btn {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar,
		.bar-label {
			animation: none;
		}
	}
</style>
