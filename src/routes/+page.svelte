<script lang="ts">
	import { getThemeContext } from '$lib/stores/theme-store.svelte';
	import Logo from '$lib/components/brand/Logo.svelte';
	import DemoChart from '$lib/components/landing/DemoChart.svelte';
	import TypewriterCode from '$lib/components/landing/TypewriterCode.svelte';
	import { demoMermaidSyntax } from '$lib/data/demo-data';

	const theme = getThemeContext();

	const features = [
		{
			title: 'Keyboard-First',
			description: 'Navigate, edit, and manage tasks with your keyboard. Mouse optional.',
			icon: 'keyboard'
		},
		{
			title: 'Mermaid Syntax',
			description: 'Import and export standard Mermaid Gantt charts. Version control friendly.',
			icon: 'code'
		},
		{
			title: 'Visual Editing',
			description: 'Drag to resize, click to edit. See your timeline come to life.',
			icon: 'chart'
		},
		{
			title: 'Offline-First',
			description: 'Your data stays in your browser. No signup, no cloud, complete privacy.',
			icon: 'lock'
		}
	];
</script>

<svelte:head>
	<title>Mermaid Gantt — Plan at the speed of thought</title>
	<meta
		name="description"
		content="Keyboard-first Gantt chart editor with Mermaid syntax. Plan visually, export as code. No signup required."
	/>
</svelte:head>

<div class="page">
	<!-- Nav -->
	<nav class="nav">
		<div class="nav-inner">
			<Logo size={28} showText />
			<div class="nav-actions">
				<button
					onclick={() => theme.toggleTheme()}
					class="theme-btn"
					aria-label="Toggle theme"
				>
					{#if theme.resolvedTheme === 'light'}
						<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{:else}
						<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{/if}
				</button>
				<a href="/editor" class="nav-cta">Open Editor</a>
			</div>
		</div>
	</nav>

	<!-- Hero: 55/45 split -->
	<section class="hero">
		<div class="hero-inner">
			<div class="hero-left">
				<div class="hero-badge">
					<kbd>⌘</kbd><span>K</span>
					<span class="badge-label">to command</span>
				</div>
				<h1 class="hero-title">
					Plan at the<br />speed of thought
				</h1>
				<p class="hero-tagline">
					Keyboard-first Gantt charts with Mermaid syntax.<br />
					Your fingers never leave the keyboard.
				</p>
				<div class="hero-cta">
					<a href="/editor" class="btn-primary">
						<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						Launch Editor
					</a>
					<a href="#code-visual" class="btn-secondary">See How It Works</a>
				</div>
			</div>
			<div class="hero-right">
				<DemoChart interactive maxHeight="360px" />
				<p class="hero-hint">
					<span class="hint-group"><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
					<span class="hint-group"><kbd>Enter</kbd> edit</span>
					<span class="hint-group"><kbd>D</kbd> drag</span>
				</p>
			</div>
		</div>
	</section>

	<!-- Code ↔ Visual -->
	<section id="code-visual" class="code-section">
		<div class="section-inner">
			<h2 class="section-title">Code ↔ Visual</h2>
			<p class="section-desc">
				Write Mermaid syntax, see the timeline. Edit visually, export as code.<br />
				Bidirectional sync keeps everything in harmony.
			</p>
			<div class="code-visual-grid">
				<div class="code-panel">
					<div class="panel-header">
						<div class="dots">
							<span class="dot red"></span>
							<span class="dot yellow"></span>
							<span class="dot green"></span>
						</div>
						<span class="panel-title">chart.mmd</span>
					</div>
					<div class="panel-body">
						<TypewriterCode code={demoMermaidSyntax} typingSpeed={20} startDelay={600} />
					</div>
				</div>
				<div class="code-arrow">
					<svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<!-- Left arrow -->
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M7 17l-4-4m0 0l4-4m-4 4h18"
						/>
						<!-- Right arrow -->
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M17 7l4 4m0 0l-4 4"
						/>
					</svg>
				</div>
				<div class="visual-panel">
					<div class="panel-header">
						<span class="panel-title">Visual Output</span>
					</div>
					<div class="panel-body">
						<div class="mini-gantt">
							<div class="mini-row">
								<span class="mini-label">Research</span>
								<div class="mini-track">
									<div class="mini-bar done" style="width: 28%; margin-left: 0;"></div>
								</div>
							</div>
							<div class="mini-row">
								<span class="mini-label">Design</span>
								<div class="mini-track">
									<div class="mini-bar active" style="width: 28%; margin-left: 28%;"></div>
								</div>
							</div>
							<div class="mini-row">
								<span class="mini-label">Frontend</span>
								<div class="mini-track">
									<div class="mini-bar" style="width: 40%; margin-left: 36%;"></div>
								</div>
							</div>
							<div class="mini-row">
								<span class="mini-label">Backend</span>
								<div class="mini-track">
									<div class="mini-bar crit" style="width: 32%; margin-left: 36%;"></div>
								</div>
							</div>
							<div class="mini-row">
								<span class="mini-label">Deploy</span>
								<div class="mini-track">
									<div class="mini-bar milestone" style="margin-left: 72%;"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="features-section">
		<div class="section-inner">
			<h2 class="section-title">Why Mermaid Gantt?</h2>
			<div class="features-grid">
				{#each features as feature}
					<div class="feature-card">
						<div class="feature-icon">
							{#if feature.icon === 'keyboard'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<rect x="2" y="6" width="20" height="12" rx="2" />
									<path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
								</svg>
							{:else if feature.icon === 'code'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
								</svg>
							{:else if feature.icon === 'chart'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M3 9h18M9 21V9" />
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<rect x="3" y="11" width="18" height="11" rx="2" />
									<path d="M7 11V7a5 5 0 0110 0v4" />
								</svg>
							{/if}
						</div>
						<h3 class="feature-title">{feature.title}</h3>
						<p class="feature-desc">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Comparison -->
	<section class="comparison-section">
		<div class="comparison-inner">
			<div class="comparison-header">
				<span class="comparison-label">The Honest Truth</span>
				<h2 class="comparison-title">Mermaid vs Paid Gantt Tools</h2>
				<p class="comparison-desc">A practical comparison for teams evaluating their options.</p>
			</div>

			<!-- Quick Comparison Table -->
			<div class="comparison-table-wrapper">
				<div class="comparison-table">
					<div class="table-header">
						<div class="table-cell metric-header"></div>
						<div class="table-cell tool-header highlight">
							<span class="tool-badge">Free</span>
							Mermaid
						</div>
						<div class="table-cell tool-header">MS Project</div>
						<div class="table-cell tool-header">GanttPRO</div>
						<div class="table-cell tool-header">TeamGantt</div>
					</div>
					<div class="table-row">
						<div class="table-cell metric-cell">Time to First Chart</div>
						<div class="table-cell value-cell highlight">~5 min</div>
						<div class="table-cell value-cell muted">1-4 hours</div>
						<div class="table-cell value-cell muted">~20 min</div>
						<div class="table-cell value-cell muted">~15 min</div>
					</div>
					<div class="table-row">
						<div class="table-cell metric-cell">Cost</div>
						<div class="table-cell value-cell highlight">
							<span class="value-accent">$0</span>
						</div>
						<div class="table-cell value-cell muted">$30+/user/mo</div>
						<div class="table-cell value-cell muted">$8+/user/mo</div>
						<div class="table-cell value-cell muted">$49+/mo</div>
					</div>
					<div class="table-row">
						<div class="table-cell metric-cell">Signup Required</div>
						<div class="table-cell value-cell highlight">
							<span class="check-icon">✓</span> No
						</div>
						<div class="table-cell value-cell muted">Yes</div>
						<div class="table-cell value-cell muted">Yes</div>
						<div class="table-cell value-cell muted">Yes</div>
					</div>
					<div class="table-row">
						<div class="table-cell metric-cell">Embeds in Docs</div>
						<div class="table-cell value-cell highlight">
							<span class="check-icon">✓</span>
						</div>
						<div class="table-cell value-cell muted">
							<span class="x-icon">✗</span>
						</div>
						<div class="table-cell value-cell muted">
							<span class="x-icon">✗</span>
						</div>
						<div class="table-cell value-cell muted">
							<span class="x-icon">✗</span>
						</div>
					</div>
					<div class="table-row">
						<div class="table-cell metric-cell">Version Control</div>
						<div class="table-cell value-cell highlight">
							<span class="check-icon">✓</span>
						</div>
						<div class="table-cell value-cell muted">
							<span class="x-icon">✗</span>
						</div>
						<div class="table-cell value-cell muted">
							<span class="x-icon">✗</span>
						</div>
						<div class="table-cell value-cell muted">
							<span class="x-icon">✗</span>
						</div>
					</div>
					<div class="table-row">
						<div class="table-cell metric-cell">Vendor Lock-in</div>
						<div class="table-cell value-cell highlight">
							<span class="value-accent">None</span>
						</div>
						<div class="table-cell value-cell muted">High</div>
						<div class="table-cell value-cell muted">Medium</div>
						<div class="table-cell value-cell muted">Medium</div>
					</div>
				</div>
			</div>

			<!-- Why Teams Choose Mermaid -->
			<div class="benefits-section">
				<h3 class="benefits-title">Why Teams Choose Mermaid</h3>
				<div class="benefits-grid">
					<div class="benefit-card">
						<div class="benefit-number">01</div>
						<h4 class="benefit-heading">No Setup</h4>
						<p class="benefit-text">No account, no installation. Use mermaid.live, VS Code, or any Markdown editor.</p>
					</div>
					<div class="benefit-card">
						<div class="benefit-number">02</div>
						<h4 class="benefit-heading">Lives With Your Code</h4>
						<p class="benefit-text">Embed in GitHub READMEs, Notion, Confluence, or wikis. The chart stays with the project.</p>
					</div>
					<div class="benefit-card">
						<div class="benefit-number">03</div>
						<h4 class="benefit-heading">Version Controlled</h4>
						<p class="benefit-text">Diff your timelines. Review changes in PRs. Roll back if needed.</p>
					</div>
					<div class="benefit-card">
						<div class="benefit-number">04</div>
						<h4 class="benefit-heading">Free & Open Source</h4>
						<p class="benefit-text">No trials, no seat limits, no feature gates.</p>
					</div>
				</div>
			</div>

			<!-- Cost Comparison Visual -->
			<div class="cost-section">
				<h3 class="cost-title">Annual Cost <span class="cost-subtitle">(10-person team)</span></h3>
				<div class="cost-bars">
					<div class="cost-row">
						<span class="cost-label">Mermaid</span>
						<div class="cost-bar-track">
							<div class="cost-bar mermaid" style="--bar-width: 0%;">
								<span class="cost-amount">$0</span>
							</div>
						</div>
					</div>
					<div class="cost-row">
						<span class="cost-label">GanttPRO</span>
						<div class="cost-bar-track">
							<div class="cost-bar ganttpro" style="--bar-width: 36%;">
								<span class="cost-amount">$960–$2,400</span>
							</div>
						</div>
					</div>
					<div class="cost-row">
						<span class="cost-label">TeamGantt</span>
						<div class="cost-bar-track">
							<div class="cost-bar teamgantt" style="--bar-width: 18%;">
								<span class="cost-amount">$588–$1,188</span>
							</div>
						</div>
					</div>
					<div class="cost-row">
						<span class="cost-label">MS Project</span>
						<div class="cost-bar-track">
							<div class="cost-bar msproject" style="--bar-width: 100%;">
								<span class="cost-amount">$3,600–$6,600</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- When Paid Tools Make Sense -->
			<div class="tradeoffs-section">
				<h3 class="tradeoffs-title">When Paid Tools Fit Better</h3>
				<div class="tradeoffs-grid">
					<div class="tradeoff-item">
						<span class="tradeoff-need">Resource workload balancing</span>
						<span class="tradeoff-arrow">→</span>
						<span class="tradeoff-tool">GanttPRO or MS Project</span>
					</div>
					<div class="tradeoff-item">
						<span class="tradeoff-need">Real-time collaborative editing</span>
						<span class="tradeoff-arrow">→</span>
						<span class="tradeoff-tool">Any paid tool</span>
					</div>
					<div class="tradeoff-item">
						<span class="tradeoff-need">Enterprise SSO/compliance</span>
						<span class="tradeoff-arrow">→</span>
						<span class="tradeoff-tool">MS Project</span>
					</div>
					<div class="tradeoff-item">
						<span class="tradeoff-need">Critical path analysis</span>
						<span class="tradeoff-arrow">→</span>
						<span class="tradeoff-tool">GanttPRO or MS Project</span>
					</div>
					<div class="tradeoff-item">
						<span class="tradeoff-need">Non-technical stakeholders</span>
						<span class="tradeoff-arrow">→</span>
						<span class="tradeoff-tool">TeamGantt or GanttPRO</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="cta-section">
		<div class="section-inner cta-inner">
			<h2 class="cta-title">Ready to plan?</h2>
			<p class="cta-desc">No signup. Your data stays local. Open source.</p>
			<a href="/editor" class="btn-primary btn-lg">
				Start Planning
				<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14 5l7 7m0 0l-7 7m7-7H3"
					/>
				</svg>
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-inner">
			<p class="footer-text">
				Built with Svelte.
				<a href="https://github.com/jjjjjjjjjjjjjj/mermaid-gantt" target="_blank" rel="noopener">Open source on GitHub</a>.
			</p>
		</div>
	</footer>
</div>

<style>
	/* Page */
	.page {
		min-height: 100vh;
		background: var(--color-bg);
		color: var(--color-text);
	}

	/* Nav */
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
	}

	.nav-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0.875rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.theme-btn {
		padding: 0.5rem;
		color: var(--color-text-secondary);
		border-radius: var(--radius-card);
		transition: background 0.15s, color 0.15s;
	}

	.theme-btn:hover {
		background: var(--color-surface-elevated);
		color: var(--color-text);
	}

	.nav-cta {
		padding: 0.5rem 1rem;
		font-family: var(--font-family-display);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		text-transform: uppercase;
		color: white;
		background: var(--color-accent);
		border-radius: var(--radius-card);
		transition: background 0.15s;
	}

	.nav-cta:hover {
		background: var(--color-accent-hover);
	}

	/* Hero */
	.hero {
		padding: 4rem 1.5rem 5rem;
	}

	.hero-inner {
		max-width: 72rem;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 55% 45%;
		gap: 3rem;
		align-items: center;
	}

	@media (max-width: 900px) {
		.hero-inner {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 1.5rem;
		padding: 0.375rem 0.75rem;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.hero-badge kbd {
		padding: 0.125rem 0.375rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
	}

	.badge-label {
		margin-left: 0.375rem;
		color: var(--color-text-tertiary);
	}

	.hero-title {
		font-family: var(--font-family-display);
		font-size: clamp(2.25rem, 5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--color-text);
		margin-bottom: 1.25rem;
	}

	.hero-tagline {
		font-family: var(--font-family-body);
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
	}

	.hero-cta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		font-family: var(--font-family-display);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		text-transform: uppercase;
		color: white;
		background: var(--color-accent);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-card);
		transition: background 0.15s, transform 0.15s;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
		border-color: var(--color-accent-hover);
		transform: translateY(-1px);
	}

	.btn-primary.btn-lg {
		padding: 1rem 1.75rem;
		font-size: 0.875rem;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		font-family: var(--font-family-display);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		text-transform: uppercase;
		color: var(--color-text);
		background: transparent;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-card);
		transition: border-color 0.15s, background 0.15s;
	}

	.btn-secondary:hover {
		border-color: var(--color-border-emphasis);
		background: var(--color-surface-elevated);
	}

	.hero-right {
		position: relative;
	}

	.hero-hint {
		margin-top: 0.75rem;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
	}

	.hint-group {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}

	.hero-hint kbd {
		padding: 0.1875rem 0.375rem;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		font-size: 0.625rem;
		line-height: 1;
	}

	/* Sections */
	.section-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.section-title {
		font-family: var(--font-family-display);
		font-size: 1.75rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		text-align: center;
		margin-bottom: 0.75rem;
	}

	.section-desc {
		font-family: var(--font-family-body);
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		text-align: center;
		max-width: 36rem;
		margin: 0 auto 2.5rem;
	}

	/* Code ↔ Visual */
	.code-section {
		padding: 5rem 0;
		background: var(--color-surface-elevated);
	}

	.code-visual-grid {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1.5rem;
		align-items: stretch;
	}

	@media (max-width: 800px) {
		.code-visual-grid {
			grid-template-columns: 1fr;
		}

		.code-arrow {
			transform: rotate(90deg);
			justify-self: center;
		}
	}

	.code-panel,
	.visual-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-modal);
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 1rem;
		background: var(--color-surface-elevated);
		border-bottom: 1px solid var(--color-border);
	}

	.dots {
		display: flex;
		gap: 0.375rem;
	}

	.dot {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
		background: var(--color-border-emphasis);
	}

	.dot.red {
		background: #ef4444;
	}

	.dot.yellow {
		background: #eab308;
	}

	.dot.green {
		background: #22c55e;
	}

	.panel-title {
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
	}

	.panel-body {
		padding: 1rem;
		min-height: 200px;
	}

	.code-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-accent);
	}

	/* Mini Gantt */
	.mini-gantt {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mini-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.mini-label {
		width: 4.5rem;
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		text-align: right;
		flex-shrink: 0;
	}

	.mini-track {
		flex: 1;
		height: 1.25rem;
		position: relative;
	}

	.mini-bar {
		height: 100%;
		background: var(--color-accent);
		border-radius: 3px;
	}

	.mini-bar.done {
		background: var(--color-status-done);
	}

	.mini-bar.active {
		background: var(--color-accent);
	}

	.mini-bar.crit {
		background: var(--color-status-critical);
	}

	.mini-bar.milestone {
		background: var(--color-status-milestone);
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
	}

	/* Features */
	.features-section {
		padding: 5rem 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-modal);
		transition: border-color 0.15s, transform 0.15s;
	}

	.feature-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
	}

	.feature-icon {
		width: 2.5rem;
		height: 2.5rem;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background: var(--color-accent-subtle);
		border-radius: var(--radius-card);
		color: var(--color-accent);
	}

	.feature-title {
		font-family: var(--font-family-display);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		margin-bottom: 0.375rem;
	}

	.feature-desc {
		font-family: var(--font-family-body);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	/* CTA */
	.cta-section {
		padding: 5rem 0;
		background: var(--color-accent-subtle);
	}

	.cta-inner {
		text-align: center;
	}

	.cta-title {
		font-family: var(--font-family-display);
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		margin-bottom: 0.5rem;
	}

	.cta-desc {
		font-family: var(--font-family-body);
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}

	/* Footer */
	.footer {
		padding: 1.5rem 0;
		border-top: 1px solid var(--color-border);
	}

	.footer-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.5rem;
		text-align: center;
	}

	.footer-text {
		font-family: var(--font-family-body);
		font-size: 0.8125rem;
		color: var(--color-text-tertiary);
	}

	.footer-text a {
		color: var(--color-text-secondary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.footer-text a:hover {
		color: var(--color-accent);
	}

	/* Comparison Section */
	.comparison-section {
		padding: 6rem 0;
		background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface-elevated) 100%);
		position: relative;
		overflow: hidden;
	}

	.comparison-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--color-border-emphasis), transparent);
	}

	.comparison-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.comparison-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.comparison-label {
		display: inline-block;
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-accent);
		padding: 0.375rem 0.875rem;
		background: var(--color-accent-subtle);
		border-radius: 9999px;
		margin-bottom: 1.25rem;
	}

	.comparison-title {
		font-family: var(--font-family-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 0.75rem;
	}

	.comparison-desc {
		font-family: var(--font-family-body);
		font-size: 1.0625rem;
		color: var(--color-text-secondary);
	}

	/* Comparison Table */
	.comparison-table-wrapper {
		overflow-x: auto;
		margin-bottom: 4rem;
		-webkit-overflow-scrolling: touch;
	}

	.comparison-table {
		min-width: 640px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-modal);
		overflow: hidden;
	}

	.table-header {
		display: grid;
		grid-template-columns: 1.5fr repeat(4, 1fr);
		background: var(--color-surface-elevated);
		border-bottom: 1px solid var(--color-border);
	}

	.table-row {
		display: grid;
		grid-template-columns: 1.5fr repeat(4, 1fr);
		border-bottom: 1px solid var(--color-border);
		transition: background 0.15s;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row:hover {
		background: var(--color-surface-elevated);
	}

	.table-cell {
		padding: 1rem 1.25rem;
		font-family: var(--font-family-body);
		font-size: 0.875rem;
	}

	.metric-header {
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
	}

	.tool-header {
		font-family: var(--font-family-display);
		font-weight: 600;
		font-size: 0.8125rem;
		text-align: center;
		color: var(--color-text-secondary);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.tool-header.highlight {
		color: var(--color-text);
		background: var(--color-accent-subtle);
	}

	.tool-badge {
		font-family: var(--font-family-mono);
		font-size: 0.5625rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-status-done);
		padding: 0.125rem 0.5rem;
		background: color-mix(in srgb, var(--color-status-done) 15%, transparent);
		border-radius: 9999px;
	}

	.metric-cell {
		font-family: var(--font-family-body);
		font-weight: 500;
		color: var(--color-text);
	}

	.value-cell {
		text-align: center;
		color: var(--color-text);
	}

	.value-cell.highlight {
		background: var(--color-accent-subtle);
		font-weight: 600;
	}

	.value-cell.muted {
		color: var(--color-text-secondary);
	}

	.value-accent {
		color: var(--color-status-done);
		font-weight: 700;
	}

	.check-icon {
		color: var(--color-status-done);
		font-weight: 700;
	}

	.x-icon {
		color: var(--color-text-tertiary);
		opacity: 0.6;
	}

	/* Benefits Section */
	.benefits-section {
		margin-bottom: 4rem;
	}

	.benefits-title {
		font-family: var(--font-family-display);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		text-align: center;
		margin-bottom: 2rem;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.25rem;
	}

	.benefit-card {
		position: relative;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-modal);
		transition: border-color 0.2s, transform 0.2s;
	}

	.benefit-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-3px);
	}

	.benefit-number {
		font-family: var(--font-family-mono);
		font-size: 0.625rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.benefit-heading {
		font-family: var(--font-family-display);
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		margin-bottom: 0.5rem;
	}

	.benefit-text {
		font-family: var(--font-family-body);
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	/* Cost Section */
	.cost-section {
		margin-bottom: 4rem;
		padding: 2rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-modal);
	}

	.cost-title {
		font-family: var(--font-family-display);
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		margin-bottom: 1.5rem;
	}

	.cost-subtitle {
		font-family: var(--font-family-body);
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--color-text-secondary);
	}

	.cost-bars {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cost-row {
		display: grid;
		grid-template-columns: 6rem 1fr;
		align-items: center;
		gap: 1rem;
	}

	@media (max-width: 600px) {
		.cost-row {
			grid-template-columns: 5rem 1fr;
		}
	}

	.cost-label {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-align: right;
	}

	.cost-bar-track {
		height: 2.25rem;
		background: var(--color-surface-elevated);
		border-radius: var(--radius-card);
		position: relative;
		overflow: hidden;
	}

	.cost-bar {
		height: 100%;
		width: var(--bar-width);
		min-width: 5rem;
		border-radius: var(--radius-card);
		display: flex;
		align-items: center;
		padding: 0 0.875rem;
		transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
		animation: barGrow 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: 0.2s;
		transform-origin: left;
	}

	@keyframes barGrow {
		from {
			transform: scaleX(0);
			opacity: 0;
		}
		to {
			transform: scaleX(1);
			opacity: 1;
		}
	}

	.cost-bar.mermaid {
		background: linear-gradient(90deg, var(--color-status-done), color-mix(in srgb, var(--color-status-done) 80%, var(--color-accent)));
		min-width: 4rem;
	}

	.cost-bar.ganttpro {
		background: linear-gradient(90deg, #6366F1, #818CF8);
		animation-delay: 0.35s;
	}

	.cost-bar.teamgantt {
		background: linear-gradient(90deg, #EC4899, #F472B6);
		animation-delay: 0.5s;
	}

	.cost-bar.msproject {
		background: linear-gradient(90deg, var(--color-status-critical), #F87171);
		animation-delay: 0.65s;
	}

	.cost-amount {
		font-family: var(--font-family-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		color: white;
		white-space: nowrap;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	/* Tradeoffs Section */
	.tradeoffs-section {
		padding: 2rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-modal);
	}

	.tradeoffs-title {
		font-family: var(--font-family-display);
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		margin-bottom: 1.5rem;
	}

	.tradeoffs-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tradeoff-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--color-surface-elevated);
		border-radius: var(--radius-card);
		font-size: 0.8125rem;
		transition: background 0.15s;
	}

	.tradeoff-item:hover {
		background: var(--color-border);
	}

	.tradeoff-need {
		flex: 1;
		font-family: var(--font-family-body);
		color: var(--color-text);
	}

	.tradeoff-arrow {
		font-family: var(--font-family-mono);
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.tradeoff-tool {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.tradeoff-item {
			flex-wrap: wrap;
		}

		.tradeoff-arrow {
			display: none;
		}

		.tradeoff-tool {
			width: 100%;
			padding-top: 0.5rem;
			border-top: 1px solid var(--color-border);
			margin-top: 0.25rem;
		}
	}
</style>
