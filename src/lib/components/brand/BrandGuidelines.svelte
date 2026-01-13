<script lang="ts">
	import Logo from './Logo-Pro.svelte';

	let darkPreview = $state(false);
</script>

<div class="guidelines">
	<header class="header">
		<div class="header-logo">
			<Logo size={48} />
		</div>
		<div class="header-text">
			<h1>Brand Guidelines</h1>
			<p>Mermaid Gantt Identity System</p>
		</div>
	</header>

	<!-- Logo Overview -->
	<section class="section">
		<h2>01 — Logo</h2>
		<div class="logo-hero">
			<Logo size={120} />
		</div>
		<p class="section-intro">
			The Mermaid Gantt logo combines stacked timeline bars with an anchor node,
			representing task dependencies and project flow. Built on golden ratio proportions
			for mathematical harmony.
		</p>
	</section>

	<!-- Construction Grid -->
	<section class="section">
		<h2>02 — Construction</h2>
		<div class="construction-grid">
			<svg viewBox="0 0 24 24" class="construction-svg">
				<!-- Base grid -->
				{#each Array(25) as _, i}
					<line x1={i} y1="0" x2={i} y2="24" stroke="#e2e8f0" stroke-width="0.04" />
					<line x1="0" y1={i} x2="24" y2={i} stroke="#e2e8f0" stroke-width="0.04" />
				{/each}

				<!-- Golden ratio markers -->
				<line x1="5" y1="0" x2="5" y2="24" stroke="#0ea5e9" stroke-width="0.06" stroke-dasharray="0.2" />
				<line x1="20" y1="0" x2="20" y2="24" stroke="#0ea5e9" stroke-width="0.06" stroke-dasharray="0.2" />

				<!-- Logo elements -->
				<rect x="5" y="6" width="15" height="4" rx="1" fill="#0f172a" />
				<rect x="7" y="10" width="13" height="4" rx="1" fill="#0f172a" opacity="0.55" />
				<rect x="5" y="14" width="8" height="4" rx="1" fill="#0f172a" opacity="0.3" />
				<circle cx="5" cy="12" r="2" fill="#0f172a" />
			</svg>
			<div class="construction-notes">
				<h3>Grid System</h3>
				<ul>
					<li><strong>Base:</strong> 24 × 24 unit grid</li>
					<li><strong>Bar heights:</strong> 4 units consistent</li>
					<li><strong>Vertical rhythm:</strong> 4-unit spacing</li>
					<li><strong>Corner radius:</strong> 1 unit</li>
					<li><strong>Anchor node:</strong> 2-unit radius at y=12</li>
				</ul>
				<h3>Golden Ratio (φ = 1.618)</h3>
				<ul>
					<li>Bar 1: 15 units</li>
					<li>Bar 2: 13 units (offset +2)</li>
					<li>Bar 3: 8 units (~15 ÷ φ²)</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Clear Space -->
	<section class="section">
		<h2>03 — Clear Space</h2>
		<div class="clearspace-demo">
			<svg viewBox="0 0 24 24" class="clearspace-svg">
				<!-- Grid (identical to Construction) -->
				{#each Array(25) as _, i}
					<line x1={i} y1="0" x2={i} y2="24" stroke="#e2e8f0" stroke-width="0.04" />
					<line x1="0" y1={i} x2="24" y2={i} stroke="#e2e8f0" stroke-width="0.04" />
				{/each}

				<!-- Logo bounds - horizontal (same positions as Construction) -->
				<line x1="5" y1="0" x2="5" y2="24" stroke="#0ea5e9" stroke-width="0.06" stroke-dasharray="0.2" />
				<line x1="20" y1="0" x2="20" y2="24" stroke="#0ea5e9" stroke-width="0.06" stroke-dasharray="0.2" />

				<!-- Logo bounds - vertical (top of bar 1, bottom of bar 3) -->
				<line x1="0" y1="6" x2="24" y2="6" stroke="#0ea5e9" stroke-width="0.06" stroke-dasharray="0.2" />
				<line x1="0" y1="18" x2="24" y2="18" stroke="#0ea5e9" stroke-width="0.06" stroke-dasharray="0.2" />

				<!-- Clear space shading (X = 4 units = 1 bar height) -->
				<!-- Top: from y=2 to y=6 -->
				<rect x="1" y="2" width="22" height="4" fill="#0ea5e9" opacity="0.08" />
				<!-- Bottom: from y=18 to y=22 -->
				<rect x="1" y="18" width="22" height="4" fill="#0ea5e9" opacity="0.08" />
				<!-- Left: from x=1 to x=5 -->
				<rect x="1" y="6" width="4" height="12" fill="#0ea5e9" opacity="0.08" />
				<!-- Right: from x=20 to x=24 (but show to 23) -->
				<rect x="20" y="6" width="3" height="12" fill="#0ea5e9" opacity="0.08" />

				<!-- Logo elements (identical to Construction) -->
				<rect x="5" y="6" width="15" height="4" rx="1" fill="#0f172a" />
				<rect x="7" y="10" width="13" height="4" rx="1" fill="#0f172a" opacity="0.55" />
				<rect x="5" y="14" width="8" height="4" rx="1" fill="#0f172a" opacity="0.3" />
				<circle cx="5" cy="12" r="2" fill="#0f172a" />

				<!-- X dimension - Top -->
				<line x1="12" y1="2" x2="12" y2="6" stroke="#0ea5e9" stroke-width="0.12" />
				<line x1="11" y1="2" x2="13" y2="2" stroke="#0ea5e9" stroke-width="0.12" />
				<text x="13.2" y="4.5" font-size="1.8" fill="#0ea5e9" font-weight="600" font-family="system-ui">X</text>

				<!-- X dimension - Bottom -->
				<line x1="12" y1="18" x2="12" y2="22" stroke="#0ea5e9" stroke-width="0.12" />
				<line x1="11" y1="22" x2="13" y2="22" stroke="#0ea5e9" stroke-width="0.12" />
				<text x="13.2" y="20.5" font-size="1.8" fill="#0ea5e9" font-weight="600" font-family="system-ui">X</text>

				<!-- X dimension - Left -->
				<line x1="1" y1="12" x2="5" y2="12" stroke="#0ea5e9" stroke-width="0.12" />
				<line x1="1" y1="11" x2="1" y2="13" stroke="#0ea5e9" stroke-width="0.12" />
				<text x="2.5" y="10.5" font-size="1.8" fill="#0ea5e9" font-weight="600" font-family="system-ui">X</text>

				<!-- X dimension - Right -->
				<line x1="20" y1="12" x2="23" y2="12" stroke="#0ea5e9" stroke-width="0.12" />
				<line x1="23" y1="11" x2="23" y2="13" stroke="#0ea5e9" stroke-width="0.12" />
				<text x="21" y="10.5" font-size="1.8" fill="#0ea5e9" font-weight="600" font-family="system-ui">X</text>

				<!-- Minimum container boundary -->
				<rect x="1" y="2" width="22" height="20" fill="none" stroke="#94a3b8" stroke-width="0.08" stroke-dasharray="0.4" />
			</svg>
			<div class="clearspace-notes">
				<h3>Minimum Clear Space</h3>
				<p><strong>X = 4 grid units</strong> (height of one bar)</p>
				<p>The dashed lines at x=5 and x=20 mark the logo's horizontal bounds (same as Construction). Measure X outward from these.</p>
				<p>Minimum container = logo bounds + X on each side.</p>
				<div class="clearspace-donts">
					<span>Never allow:</span>
					<ul>
						<li>Text within the clear zone</li>
						<li>Other graphics or icons</li>
						<li>Container edges within X</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- Minimum Size -->
	<section class="section">
		<h2>04 — Minimum Size</h2>
		<div class="minsize-demo">
			<div class="minsize-item correct">
				<Logo size={24} />
				<span>24px — Minimum</span>
			</div>
			<div class="minsize-item correct">
				<Logo size={32} />
				<span>32px — Recommended</span>
			</div>
			<div class="minsize-item incorrect">
				<Logo size={16} />
				<span>16px — Favicon only</span>
			</div>
		</div>
		<p class="note">Below 24px, details compress. Use 16px exclusively for favicons where context is established.</p>
	</section>

	<!-- Color Palette -->
	<section class="section">
		<h2>05 — Color Palette</h2>

		<h3>Primary</h3>
		<div class="color-grid">
			<div class="color-card">
				<div class="color-swatch" style="background: #0f172a;"></div>
				<div class="color-info">
					<strong>Slate 900</strong>
					<code>#0f172a</code>
					<span>Primary logo, text</span>
				</div>
			</div>
			<div class="color-card">
				<div class="color-swatch" style="background: #f8fafc;"></div>
				<div class="color-info">
					<strong>Slate 50</strong>
					<code>#f8fafc</code>
					<span>Light backgrounds</span>
				</div>
			</div>
		</div>

		<h3>Brand Accent</h3>
		<div class="color-grid">
			<div class="color-card">
				<div class="color-swatch" style="background: #0ea5e9;"></div>
				<div class="color-info">
					<strong>Sky 500</strong>
					<code>#0ea5e9</code>
					<span>Primary accent, links</span>
				</div>
			</div>
			<div class="color-card">
				<div class="color-swatch" style="background: #0284c7;"></div>
				<div class="color-info">
					<strong>Sky 600</strong>
					<code>#0284c7</code>
					<span>Hover states</span>
				</div>
			</div>
			<div class="color-card">
				<div class="color-swatch" style="background: #0c4a6e;"></div>
				<div class="color-info">
					<strong>Sky 900</strong>
					<code>#0c4a6e</code>
					<span>Dark accent</span>
				</div>
			</div>
		</div>

		<h3>Supporting</h3>
		<div class="color-grid">
			<div class="color-card">
				<div class="color-swatch" style="background: #10b981;"></div>
				<div class="color-info">
					<strong>Emerald 500</strong>
					<code>#10b981</code>
					<span>Success, completed</span>
				</div>
			</div>
			<div class="color-card">
				<div class="color-swatch" style="background: #f59e0b;"></div>
				<div class="color-info">
					<strong>Amber 500</strong>
					<code>#f59e0b</code>
					<span>Warning, in-progress</span>
				</div>
			</div>
			<div class="color-card">
				<div class="color-swatch" style="background: #ef4444;"></div>
				<div class="color-info">
					<strong>Red 500</strong>
					<code>#ef4444</code>
					<span>Error, critical</span>
				</div>
			</div>
		</div>

		<h3>Neutral Scale</h3>
		<div class="neutral-scale">
			<div class="neutral-swatch" style="background: #0f172a;"><span>900</span></div>
			<div class="neutral-swatch" style="background: #1e293b;"><span>800</span></div>
			<div class="neutral-swatch" style="background: #334155;"><span>700</span></div>
			<div class="neutral-swatch" style="background: #475569;"><span>600</span></div>
			<div class="neutral-swatch" style="background: #64748b;"><span>500</span></div>
			<div class="neutral-swatch light" style="background: #94a3b8;"><span>400</span></div>
			<div class="neutral-swatch light" style="background: #cbd5e1;"><span>300</span></div>
			<div class="neutral-swatch light" style="background: #e2e8f0;"><span>200</span></div>
			<div class="neutral-swatch light" style="background: #f1f5f9;"><span>100</span></div>
			<div class="neutral-swatch light" style="background: #f8fafc;"><span>50</span></div>
		</div>
	</section>

	<!-- Logo on Backgrounds -->
	<section class="section">
		<h2>06 — Background Usage</h2>
		<div class="background-grid">
			<div class="bg-card" style="background: #ffffff; color: #0f172a;">
				<Logo size={48} />
				<span>White</span>
			</div>
			<div class="bg-card" style="background: #f1f5f9; color: #0f172a;">
				<Logo size={48} />
				<span>Slate 100</span>
			</div>
			<div class="bg-card" style="background: #0f172a; color: #f8fafc;">
				<Logo size={48} />
				<span>Slate 900</span>
			</div>
			<div class="bg-card" style="background: #0ea5e9; color: #ffffff;">
				<Logo size={48} />
				<span>Sky 500</span>
			</div>
			<div class="bg-card" style="background: #0c4a6e; color: #f8fafc;">
				<Logo size={48} />
				<span>Sky 900</span>
			</div>
			<div class="bg-card" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #ffffff;">
				<Logo size={48} />
				<span>Gradient</span>
			</div>
		</div>
	</section>

	<!-- Typography -->
	<section class="section">
		<h2>07 — Typography</h2>

		<div class="type-specimen">
			<div class="type-sample display">
				<span class="type-label">Display / Headlines</span>
				<h3 style="font-family: 'DM Sans', system-ui; font-weight: 700; font-size: 2rem; letter-spacing: -0.02em;">
					DM Sans Bold
				</h3>
				<p class="type-meta">Weight 700 · Tracking -0.02em</p>
			</div>

			<div class="type-sample body">
				<span class="type-label">Body / UI</span>
				<p style="font-family: 'DM Sans', system-ui; font-weight: 400; font-size: 1rem; line-height: 1.6;">
					DM Sans Regular — Clean geometric sans-serif with excellent legibility at all sizes.
					Use for body text, UI labels, and secondary content.
				</p>
				<p class="type-meta">Weight 400 · Line height 1.6</p>
			</div>

			<div class="type-sample mono">
				<span class="type-label">Code / Data</span>
				<code style="font-family: 'DM Mono', 'SF Mono', monospace; font-size: 0.9rem;">
					gantt dateFormat YYYY-MM-DD
				</code>
				<p class="type-meta">DM Mono · For Mermaid syntax, code blocks</p>
			</div>
		</div>

		<div class="type-scale">
			<h3>Type Scale</h3>
			<div class="scale-item"><span>4xl</span><span style="font-size: 2.25rem; font-weight: 700;">36px / Bold</span></div>
			<div class="scale-item"><span>3xl</span><span style="font-size: 1.875rem; font-weight: 700;">30px / Bold</span></div>
			<div class="scale-item"><span>2xl</span><span style="font-size: 1.5rem; font-weight: 600;">24px / Semibold</span></div>
			<div class="scale-item"><span>xl</span><span style="font-size: 1.25rem; font-weight: 600;">20px / Semibold</span></div>
			<div class="scale-item"><span>lg</span><span style="font-size: 1.125rem; font-weight: 500;">18px / Medium</span></div>
			<div class="scale-item"><span>base</span><span style="font-size: 1rem;">16px / Regular</span></div>
			<div class="scale-item"><span>sm</span><span style="font-size: 0.875rem;">14px / Regular</span></div>
			<div class="scale-item"><span>xs</span><span style="font-size: 0.75rem;">12px / Regular</span></div>
		</div>
	</section>

	<!-- Logo + Wordmark -->
	<section class="section">
		<h2>08 — Logo Combinations</h2>

		<div class="combo-grid">
			<!-- Horizontal lockup -->
			<div class="combo-card">
				<div class="combo-demo">
					<div class="lockup horizontal">
						<Logo size={32} />
						<span class="wordmark">Mermaid Gantt</span>
					</div>
				</div>
				<span class="combo-label">Horizontal lockup — Primary</span>
			</div>

			<!-- Stacked lockup -->
			<div class="combo-card">
				<div class="combo-demo">
					<div class="lockup stacked">
						<Logo size={48} />
						<span class="wordmark">Mermaid Gantt</span>
					</div>
				</div>
				<span class="combo-label">Stacked lockup</span>
			</div>

			<!-- Mark only -->
			<div class="combo-card">
				<div class="combo-demo">
					<Logo size={48} />
				</div>
				<span class="combo-label">Mark only — When space is limited</span>
			</div>

			<!-- Wordmark only -->
			<div class="combo-card">
				<div class="combo-demo">
					<span class="wordmark-only">Mermaid Gantt</span>
				</div>
				<span class="combo-label">Wordmark only — Established contexts</span>
			</div>
		</div>
	</section>

	<!-- Don'ts -->
	<section class="section">
		<h2>09 — Incorrect Usage</h2>
		<div class="donts-grid">
			<div class="dont-card">
				<div class="dont-demo">
					<div style="transform: rotate(15deg);">
						<Logo size={48} />
					</div>
				</div>
				<span>Don't rotate</span>
			</div>
			<div class="dont-card">
				<div class="dont-demo">
					<div style="transform: scaleX(1.5);">
						<Logo size={48} />
					</div>
				</div>
				<span>Don't stretch</span>
			</div>
			<div class="dont-card">
				<div class="dont-demo">
					<div style="opacity: 0.3;">
						<Logo size={48} />
					</div>
				</div>
				<span>Don't reduce opacity</span>
			</div>
			<div class="dont-card">
				<div class="dont-demo" style="background: linear-gradient(45deg, #f59e0b, #ef4444); color: white;">
					<Logo size={48} />
				</div>
				<span>Don't use unapproved colors</span>
			</div>
			<div class="dont-card">
				<div class="dont-demo">
					<div style="filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.4));">
						<Logo size={48} />
					</div>
				</div>
				<span>Don't add effects</span>
			</div>
			<div class="dont-card">
				<div class="dont-demo" style="background: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect fill=%22%23ddd%22 width=%2210%22 height=%2210%22/><rect fill=%22%23ddd%22 x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22/></svg>'); color: #0f172a;">
					<Logo size={48} />
				</div>
				<span>Don't place on busy backgrounds</span>
			</div>
		</div>
	</section>

	<!-- File Formats -->
	<section class="section">
		<h2>10 — File Formats</h2>
		<div class="formats-table">
			<div class="format-row header">
				<span>Format</span>
				<span>Use Case</span>
				<span>Notes</span>
			</div>
			<div class="format-row">
				<span><code>.svg</code></span>
				<span>Web, print, any size</span>
				<span>Primary format — infinitely scalable</span>
			</div>
			<div class="format-row">
				<span><code>.png</code></span>
				<span>Social media, presentations</span>
				<span>Export at 2x for retina displays</span>
			</div>
			<div class="format-row">
				<span><code>.ico</code></span>
				<span>Favicon</span>
				<span>16×16, 32×32, 48×48 multi-size</span>
			</div>
		</div>
	</section>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@400;500;600;700&display=swap');

	.guidelines {
		font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem;
		color: #0f172a;
		line-height: 1.6;
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding-bottom: 3rem;
		border-bottom: 1px solid #e2e8f0;
		margin-bottom: 3rem;
	}

	.header-logo {
		padding: 1rem;
		background: #f8fafc;
		border-radius: 12px;
	}

	.header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.header p {
		margin: 0.25rem 0 0;
		color: #64748b;
		font-size: 0.9rem;
	}

	/* Sections */
	.section {
		margin-bottom: 4rem;
	}

	.section h2 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #64748b;
		margin: 0 0 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.section h3 {
		font-size: 0.85rem;
		font-weight: 600;
		margin: 1.5rem 0 1rem;
		color: #334155;
	}

	.section-intro {
		font-size: 1rem;
		color: #475569;
		max-width: 600px;
	}

	/* Logo Hero */
	.logo-hero {
		display: flex;
		justify-content: center;
		padding: 4rem;
		background: #f8fafc;
		border-radius: 16px;
		margin-bottom: 1.5rem;
	}

	/* Construction */
	.construction-grid {
		display: flex;
		gap: 3rem;
		align-items: flex-start;
	}

	.construction-svg {
		width: 280px;
		height: 280px;
		background: #fafafa;
		border-radius: 12px;
		flex-shrink: 0;
	}

	.construction-notes {
		flex: 1;
	}

	.construction-notes ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.85rem;
		color: #475569;
	}

	.construction-notes li {
		margin-bottom: 0.5rem;
	}

	/* Clear Space */
	.clearspace-demo {
		display: flex;
		gap: 3rem;
		align-items: flex-start;
	}

	.clearspace-svg {
		width: 280px;
		height: 280px;
		background: #fafafa;
		flex-shrink: 0;
		border-radius: 12px;
	}

	.clearspace-notes {
		flex: 1;
	}

	.clearspace-notes h3 {
		margin-top: 0;
	}

	.clearspace-notes p {
		margin: 0 0 1rem;
		font-size: 0.9rem;
		color: #475569;
	}

	.clearspace-donts {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		padding: 1rem;
		margin-top: 1rem;
	}

	.clearspace-donts span {
		font-size: 0.8rem;
		font-weight: 600;
		color: #dc2626;
	}

	.clearspace-donts ul {
		margin: 0.5rem 0 0;
		padding-left: 1.25rem;
		font-size: 0.8rem;
		color: #991b1b;
	}

	.clearspace-donts li {
		margin-bottom: 0.25rem;
	}

	/* Minimum Size */
	.minsize-demo {
		display: flex;
		gap: 2rem;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.minsize-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		border-radius: 8px;
		background: white;
	}

	.minsize-item span {
		font-size: 0.75rem;
		color: #64748b;
	}

	.minsize-item.incorrect {
		opacity: 0.5;
	}

	.note {
		font-size: 0.85rem;
		color: #64748b;
	}

	/* Colors */
	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.color-card {
		display: flex;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.color-swatch {
		width: 80px;
		flex-shrink: 0;
	}

	.color-info {
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.color-info strong {
		font-size: 0.85rem;
	}

	.color-info code {
		font-family: 'DM Mono', monospace;
		font-size: 0.75rem;
		color: #64748b;
	}

	.color-info span {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	.neutral-scale {
		display: flex;
		border-radius: 8px;
		overflow: hidden;
	}

	.neutral-swatch {
		flex: 1;
		height: 60px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 0.5rem;
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
	}

	.neutral-swatch.light {
		color: #334155;
	}

	/* Backgrounds */
	.background-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.bg-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.bg-card span {
		font-size: 0.7rem;
		opacity: 0.7;
	}

	/* Typography */
	.type-specimen {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.type-sample {
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 12px;
	}

	.type-label {
		display: block;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #94a3b8;
		margin-bottom: 0.75rem;
	}

	.type-sample h3 {
		margin: 0;
	}

	.type-sample p {
		margin: 0;
	}

	.type-meta {
		font-size: 0.75rem !important;
		color: #94a3b8 !important;
		margin-top: 0.75rem !important;
	}

	.type-sample code {
		display: block;
		padding: 0.75rem 1rem;
		background: #0f172a;
		color: #e2e8f0;
		border-radius: 6px;
	}

	.type-scale {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 12px;
	}

	.type-scale h3 {
		margin-top: 0;
	}

	.scale-item {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.scale-item:last-child {
		border-bottom: none;
	}

	.scale-item span:first-child {
		width: 3rem;
		font-size: 0.7rem;
		color: #94a3b8;
		font-weight: 600;
	}

	/* Combinations */
	.combo-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.combo-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
	}

	.combo-demo {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #f8fafc;
		min-height: 100px;
	}

	.combo-label {
		display: block;
		padding: 0.75rem 1rem;
		font-size: 0.75rem;
		color: #64748b;
		border-top: 1px solid #e2e8f0;
	}

	.lockup {
		display: flex;
		align-items: center;
	}

	.lockup.horizontal {
		gap: 0.75rem;
	}

	.lockup.stacked {
		flex-direction: column;
		gap: 0.5rem;
	}

	.wordmark {
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.wordmark-only {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	/* Don'ts */
	.donts-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.dont-card {
		text-align: center;
	}

	.dont-demo {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #fef2f2;
		border: 2px solid #fecaca;
		border-radius: 12px;
		margin-bottom: 0.5rem;
	}

	.dont-card span {
		font-size: 0.75rem;
		color: #dc2626;
		font-weight: 500;
	}

	/* Formats */
	.formats-table {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
	}

	.format-row {
		display: grid;
		grid-template-columns: 100px 200px 1fr;
		padding: 1rem 1.25rem;
		font-size: 0.85rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.format-row:last-child {
		border-bottom: none;
	}

	.format-row.header {
		background: #f8fafc;
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
	}

	.format-row code {
		font-family: 'DM Mono', monospace;
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.8rem;
	}
</style>
