<script lang="ts">
	import LogoPro from './Logo-Pro.svelte';
</script>

<div class="showcase">
	<!-- Hero display -->
	<section class="hero">
		<div class="hero-logo">
			<LogoPro size={120} />
		</div>
		<h1>Gantt Flow</h1>
		<p>Stacked bars + dependency anchor</p>
	</section>

	<!-- Construction grid -->
	<section class="construction">
		<h2>Construction</h2>
		<div class="grid-display">
			<svg width="240" height="240" viewBox="0 0 24 24" class="construction-svg">
				<!-- Grid lines -->
				{#each Array(25) as _, i}
					<line x1={i} y1="0" x2={i} y2="24" stroke="#ddd" stroke-width="0.05" />
					<line x1="0" y1={i} x2="24" y2={i} stroke="#ddd" stroke-width="0.05" />
				{/each}

				<!-- Golden ratio guides -->
				<line x1="5" y1="0" x2="5" y2="24" stroke="#f59e0b" stroke-width="0.08" opacity="0.6" />
				<line x1="20" y1="0" x2="20" y2="24" stroke="#f59e0b" stroke-width="0.08" opacity="0.6" />

				<!-- Vertical rhythm guides -->
				<line x1="0" y1="6" x2="24" y2="6" stroke="#3b82f6" stroke-width="0.05" opacity="0.4" />
				<line x1="0" y1="10" x2="24" y2="10" stroke="#3b82f6" stroke-width="0.05" opacity="0.4" />
				<line x1="0" y1="14" x2="24" y2="14" stroke="#3b82f6" stroke-width="0.05" opacity="0.4" />
				<line x1="0" y1="18" x2="24" y2="18" stroke="#3b82f6" stroke-width="0.05" opacity="0.4" />

				<!-- Anchor circle guide -->
				<circle cx="5" cy="12" r="2" fill="none" stroke="#10b981" stroke-width="0.08" opacity="0.5" />

				<!-- Actual logo elements -->
				<rect x="5" y="6" width="15" height="4" rx="0.1" fill="#1e293b" />
				<rect x="7" y="10" width="13" height="4" rx="0.1" fill="#1e293b" opacity="0.55" />
				<rect x="5" y="14" width="8" height="4" rx="0.1" fill="#1e293b" opacity="0.3" />
				<circle cx="5" cy="12" r="2" fill="#1e293b" />
			</svg>
			<div class="grid-notes">
				<div class="note"><span class="swatch amber"></span> Golden ratio: bar widths 15 → 9.3 → 5.7 (÷φ)</div>
				<div class="note"><span class="swatch blue"></span> 4-unit vertical rhythm</div>
				<div class="note"><span class="swatch green"></span> Central anchor node at y=12</div>
				<div class="note"><span class="swatch gray"></span> 24×24 base grid</div>
			</div>
		</div>
	</section>

	<!-- Size scaling -->
	<section class="scaling">
		<h2>Scaling</h2>
		<div class="scale-row">
			<div class="scale-item">
				<LogoPro size={16} />
				<span>16px</span>
			</div>
			<div class="scale-item">
				<LogoPro size={24} />
				<span>24px</span>
			</div>
			<div class="scale-item">
				<LogoPro size={32} />
				<span>32px</span>
			</div>
			<div class="scale-item">
				<LogoPro size={48} />
				<span>48px</span>
			</div>
			<div class="scale-item">
				<LogoPro size={64} />
				<span>64px</span>
			</div>
			<div class="scale-item">
				<LogoPro size={96} />
				<span>96px</span>
			</div>
		</div>
	</section>

	<!-- Theme contexts -->
	<section class="contexts">
		<h2>Contexts</h2>
		<div class="context-grid">
			<div class="context light">
				<LogoPro size={48} />
				<span>Light</span>
			</div>
			<div class="context dark">
				<LogoPro size={48} />
				<span>Dark</span>
			</div>
			<div class="context brand-blue">
				<LogoPro size={48} />
				<span>Brand</span>
			</div>
			<div class="context subtle">
				<LogoPro size={48} />
				<span>Subtle</span>
			</div>
		</div>
	</section>

	<!-- Usage examples -->
	<section class="usage">
		<h2>Usage</h2>
		<div class="usage-grid">
			<!-- Favicon simulation -->
			<div class="usage-item">
				<div class="favicon-bar">
					<div class="favicon-icon">
						<LogoPro size={16} />
					</div>
					<span>Mermaid Gantt</span>
				</div>
				<span class="usage-label">Browser tab</span>
			</div>

			<!-- App header -->
			<div class="usage-item">
				<div class="app-header">
					<LogoPro size={28} />
					<span>Mermaid Gantt</span>
				</div>
				<span class="usage-label">App header</span>
			</div>

			<!-- Standalone mark -->
			<div class="usage-item">
				<div class="standalone">
					<LogoPro size={64} />
				</div>
				<span class="usage-label">App icon</span>
			</div>
		</div>
	</section>
</div>

<style>
	.showcase {
		font-family: system-ui, -apple-system, sans-serif;
		padding: 3rem;
		max-width: 900px;
		margin: 0 auto;
		color: #1e293b;
	}

	section {
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 1rem 0 0.25rem;
		letter-spacing: -0.02em;
	}

	h2 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
		margin-bottom: 1rem;
	}

	p {
		color: #64748b;
		font-size: 0.9rem;
		margin: 0;
	}

	/* Hero */
	.hero {
		text-align: center;
		padding: 2rem 0 3rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.hero-logo {
		display: inline-flex;
		padding: 2rem;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border-radius: 24px;
		margin-bottom: 1rem;
	}

	/* Construction */
	.grid-display {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	.construction-svg {
		background: #fafafa;
		border-radius: 12px;
		flex-shrink: 0;
	}

	.grid-notes {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 0.5rem;
	}

	.note {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #475569;
	}

	.swatch {
		width: 12px;
		height: 12px;
		border-radius: 3px;
	}

	.swatch.amber { background: #f59e0b; }
	.swatch.blue { background: #3b82f6; }
	.swatch.green { background: #10b981; }
	.swatch.gray { background: #cbd5e1; }

	/* Scaling */
	.scale-row {
		display: flex;
		align-items: flex-end;
		gap: 2rem;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 12px;
	}

	.scale-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: #1e293b;
	}

	.scale-item span {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	/* Contexts */
	.context-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.context {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 2rem 1rem;
		border-radius: 12px;
	}

	.context span {
		font-size: 0.7rem;
		opacity: 0.7;
	}

	.context.light {
		background: #ffffff;
		color: #1e293b;
		border: 1px solid #e2e8f0;
	}

	.context.dark {
		background: #0f172a;
		color: #f8fafc;
	}

	.context.brand-blue {
		background: #1e40af;
		color: #ffffff;
	}

	.context.subtle {
		background: #f1f5f9;
		color: #64748b;
	}

	/* Usage */
	.usage-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}

	.usage-item {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.usage-label {
		font-size: 0.7rem;
		color: #94a3b8;
		text-align: center;
	}

	.favicon-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: #f1f5f9;
		border-radius: 6px 6px 0 0;
		border-bottom: 2px solid #e2e8f0;
	}

	.favicon-icon {
		display: flex;
		color: #1e293b;
	}

	.favicon-bar span {
		font-size: 0.75rem;
		color: #475569;
	}

	.app-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #0f172a;
		border-radius: 8px;
		color: #f8fafc;
	}

	.app-header span {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.standalone {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
		border-radius: 16px;
		color: #ffffff;
	}
</style>
