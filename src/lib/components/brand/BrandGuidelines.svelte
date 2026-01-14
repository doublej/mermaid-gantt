<script lang="ts">
	import Logo from './Logo-Pro.svelte';

	let darkPreview = $state(false);
	let activeSection = $state('logo');

	// Animation demo retrigger states
	let modalKey = $state(0);
	let staggerKey = $state(0);
	let taskBarKey = $state(0);
	let loadingKey = $state(0);

	function retriggerModal() {
		modalKey++;
	}
	function retriggerStagger() {
		staggerKey++;
	}
	function retriggerTaskBar() {
		taskBarKey++;
	}
	function retriggerLoading() {
		loadingKey++;
	}

	// Force animations to play despite reduced-motion preference (for demo purposes)
	// Inject a style tag that overrides the global reduced-motion rule for demo elements
	$effect(() => {
		const styleId = 'brand-animations-override';
		let style = document.getElementById(styleId) as HTMLStyleElement | null;

		if (activeSection === 'motion') {
			if (!style) {
				style = document.createElement('style');
				style.id = styleId;
				style.textContent = `
					.guidelines .loader-spinner {
						animation: spin 1s linear infinite !important;
					}
					.guidelines .loader-pulse {
						animation: pulse 1.5s ease-in-out infinite !important;
					}
					.guidelines .loader-bar::after {
						animation: progressGrow 2s linear infinite !important;
					}
					.guidelines .modal-backdrop {
						animation: backdropFade 200ms cubic-bezier(0, 0, 0.2, 1) forwards !important;
					}
					.guidelines .modal-content {
						animation: modalEntry 200ms cubic-bezier(0, 0, 0.2, 1) forwards !important;
					}
					.guidelines .task-bar-demo {
						animation: taskDrag 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
					}
					.guidelines .stagger-item {
						animation: staggerIn 200ms cubic-bezier(0, 0, 0.2, 1) backwards !important;
					}
					.guidelines .duration-bar {
						animation: durationPulse 2s ease-in-out infinite !important;
					}
				`;
				document.head.appendChild(style);
			}
		}

		return () => {
			style?.remove();
		};
	});

	const sections = [
		{ id: 'logo', label: '01 Logo' },
		{ id: 'construction', label: '02 Construction' },
		{ id: 'clearspace', label: '03 Clear Space' },
		{ id: 'minsize', label: '04 Min Size' },
		{ id: 'colors', label: '05 Colors' },
		{ id: 'backgrounds', label: '06 Backgrounds' },
		{ id: 'typography', label: '07 Typography' },
		{ id: 'combinations', label: '08 Combinations' },
		{ id: 'donts', label: '09 Don\'ts' },
		{ id: 'formats', label: '10 Formats' },
		{ id: 'variations', label: '11 Variations' },
		{ id: 'context', label: '12 Context' },
		{ id: 'motion', label: '13 Motion' }
	];

</script>

<div class="guidelines">
	<nav class="sidebar">
		<div class="sidebar-header">
			<Logo size={32} />
			<span>Brand</span>
		</div>
		{#each sections as section}
			<button
				class="nav-item"
				class:active={activeSection === section.id}
				onclick={() => activeSection = section.id}
			>
				{section.label}
			</button>
		{/each}
	</nav>

	<main class="content">
	<!-- Intro Header -->
	<header class="intro-header">
		<h1>Mermaid Gantt Brand Guidelines</h1>
		<p>
			This guide defines visual identity standards for Mermaid Gantt. Use it to maintain
			consistency across all touchpoints—from UI components to marketing materials.
		</p>
		<a href="/llm.txt" class="llm-link" target="_blank">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
			</svg>
			LLM Reference (llm.txt)
		</a>
	</header>

	<!-- Logo Overview -->
	{#if activeSection === 'logo'}
	<section class="section" id="logo">
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
	{/if}

	{#if activeSection === 'construction'}
	<!-- Construction Grid -->
	<section class="section" id="construction">
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
	{/if}

	{#if activeSection === 'clearspace'}
	<!-- Clear Space -->
	<section class="section" id="clearspace">
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
	{/if}

	{#if activeSection === 'minsize'}
	<!-- Minimum Size -->
	<section class="section" id="minsize">
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
	{/if}

	{#if activeSection === 'colors'}
	<!-- Color Palette -->
	<section class="section" id="colors">
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
	{/if}

	{#if activeSection === 'backgrounds'}
	<!-- Logo on Backgrounds -->
	<section class="section" id="backgrounds">
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
	{/if}

	{#if activeSection === 'typography'}
	<!-- Typography -->
	<section class="section" id="typography">
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
	{/if}

	{#if activeSection === 'combinations'}
	<!-- Logo + Wordmark -->
	<section class="section" id="combinations">
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
	{/if}

	{#if activeSection === 'donts'}
	<!-- Don'ts -->
	<section class="section" id="donts">
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
	{/if}

	{#if activeSection === 'formats'}
	<!-- File Formats -->
	<section class="section" id="formats">
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
	{/if}

	{#if activeSection === 'variations'}
	<!-- Logo Variations -->
	<section class="section" id="variations">
		<h2>11 — Logo Variations</h2>
		<p class="section-intro">
			Different font pairings for varied contexts. Each variation maintains brand recognition while adapting tone.
		</p>

		<div class="variations-grid">
			<!-- Primary: DM Sans -->
			<div class="variation-card primary">
				<div class="variation-badge">Primary</div>
				<div class="variation-demo">
					<Logo size={36} />
					<span class="var-wordmark dm-sans">Mermaid Gantt</span>
				</div>
				<div class="variation-info">
					<strong>DM Sans</strong>
					<span>Clean geometric sans. Default for all applications.</span>
				</div>
			</div>

			<!-- Alternative: Instrument Sans -->
			<div class="variation-card">
				<div class="variation-demo">
					<Logo size={36} />
					<span class="var-wordmark instrument">Mermaid Gantt</span>
				</div>
				<div class="variation-info">
					<strong>Instrument Sans</strong>
					<span>Contemporary, slightly condensed. Technical docs, developer tools.</span>
				</div>
			</div>

			<!-- Geist -->
			<div class="variation-card">
				<div class="variation-demo">
					<Logo size={36} />
					<span class="var-wordmark geist">Mermaid Gantt</span>
				</div>
				<div class="variation-info">
					<strong>Geist</strong>
					<span>Modern, slightly sharp. SaaS, tech-forward contexts.</span>
				</div>
			</div>

			<!-- Satoshi -->
			<div class="variation-card">
				<div class="variation-demo">
					<Logo size={36} />
					<span class="var-wordmark satoshi">Mermaid Gantt</span>
				</div>
				<div class="variation-info">
					<strong>Satoshi</strong>
					<span>Friendly geometric. Marketing, social media.</span>
				</div>
			</div>

			<!-- Space Grotesk -->
			<div class="variation-card">
				<div class="variation-demo">
					<Logo size={36} />
					<span class="var-wordmark space-grotesk">Mermaid Gantt</span>
				</div>
				<div class="variation-info">
					<strong>Space Grotesk</strong>
					<span>Bold presence. Headlines, large displays.</span>
				</div>
			</div>

			<!-- Mono variation -->
			<div class="variation-card">
				<div class="variation-demo mono-bg">
					<Logo size={36} />
					<span class="var-wordmark dm-mono">mermaid-gantt</span>
				</div>
				<div class="variation-info">
					<strong>DM Mono</strong>
					<span>Developer-focused. CLI, terminal, code contexts.</span>
				</div>
			</div>
		</div>

		<!-- Wordmark weight variations -->
		<h3>Weight Variations</h3>
		<div class="weight-grid">
			<div class="weight-item">
				<div class="weight-demo">
					<Logo size={28} />
					<span class="var-wordmark dm-sans light">Mermaid Gantt</span>
				</div>
				<span class="weight-label">Light (300)</span>
			</div>
			<div class="weight-item">
				<div class="weight-demo">
					<Logo size={28} />
					<span class="var-wordmark dm-sans regular">Mermaid Gantt</span>
				</div>
				<span class="weight-label">Regular (400)</span>
			</div>
			<div class="weight-item">
				<div class="weight-demo">
					<Logo size={28} />
					<span class="var-wordmark dm-sans medium">Mermaid Gantt</span>
				</div>
				<span class="weight-label">Medium (500)</span>
			</div>
			<div class="weight-item primary">
				<div class="weight-demo">
					<Logo size={28} />
					<span class="var-wordmark dm-sans semibold">Mermaid Gantt</span>
				</div>
				<span class="weight-label">Semibold (600) — Primary</span>
			</div>
			<div class="weight-item">
				<div class="weight-demo">
					<Logo size={28} />
					<span class="var-wordmark dm-sans bold">Mermaid Gantt</span>
				</div>
				<span class="weight-label">Bold (700)</span>
			</div>
		</div>

		<!-- Stacked variations -->
		<h3>Stacked Arrangements</h3>
		<div class="stacked-grid">
			<div class="stacked-item">
				<div class="stacked-demo">
					<Logo size={48} />
					<div class="stacked-text">
						<span class="stacked-name">Mermaid</span>
						<span class="stacked-sub">Gantt</span>
					</div>
				</div>
				<span class="stacked-label">Split name, centered</span>
			</div>
			<div class="stacked-item">
				<div class="stacked-demo">
					<Logo size={56} />
					<span class="stacked-full">Mermaid Gantt</span>
				</div>
				<span class="stacked-label">Mark above wordmark</span>
			</div>
			<div class="stacked-item">
				<div class="stacked-demo horizontal">
					<Logo size={32} />
					<div class="stacked-text left">
						<span class="stacked-name small">Mermaid</span>
						<span class="stacked-sub small">Gantt</span>
					</div>
				</div>
				<span class="stacked-label">Compact horizontal</span>
			</div>
		</div>
	</section>
	{/if}

	{#if activeSection === 'context'}
	<!-- In Context -->
	<section class="section" id="context">
		<h2>12 — In Context</h2>
		<p class="section-intro">
			Real-world application examples showing proper logo usage in different environments.
		</p>

		<!-- App Header -->
		<h3>Application Header</h3>
		<div class="context-app-header">
			<div class="app-chrome">
				<div class="app-sidebar">
					<div class="app-logo">
						<Logo size={24} />
						<span>Mermaid Gantt</span>
					</div>
					<div class="app-nav">
						<div class="nav-item active">Projects</div>
						<div class="nav-item">Templates</div>
						<div class="nav-item">Settings</div>
					</div>
				</div>
				<div class="app-main">
					<div class="app-toolbar">
						<span class="toolbar-title">Q1 Planning</span>
						<div class="toolbar-actions">
							<div class="btn-outline">Export</div>
							<div class="btn-primary">Share</div>
						</div>
					</div>
					<div class="app-content">
						<div class="gantt-preview">
							<div class="gantt-bar" style="width: 60%; left: 10%;"></div>
							<div class="gantt-bar" style="width: 40%; left: 30%; opacity: 0.6;"></div>
							<div class="gantt-bar" style="width: 50%; left: 20%; opacity: 0.4;"></div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Website Header -->
		<h3>Website Header</h3>
		<div class="context-website">
			<header class="web-header">
				<div class="web-logo">
					<Logo size={28} />
					<span>Mermaid Gantt</span>
				</div>
				<nav class="web-nav">
					<span>Features</span>
					<span>Docs</span>
					<span>Pricing</span>
					<span class="cta">Get Started</span>
				</nav>
			</header>
			<div class="web-hero">
				<h1>Plan projects with Mermaid syntax</h1>
				<p>Visual Gantt charts from code. Export anywhere.</p>
			</div>
		</div>

		<!-- Social Media -->
		<h3>Social Media Profile</h3>
		<div class="context-social-grid">
			<div class="social-card twitter">
				<div class="social-avatar">
					<Logo size={40} />
				</div>
				<div class="social-info">
					<strong>Mermaid Gantt</strong>
					<span>@mermaidgantt</span>
				</div>
			</div>
			<div class="social-card github">
				<div class="social-avatar dark">
					<Logo size={40} />
				</div>
				<div class="social-info">
					<strong>mermaid-gantt</strong>
					<span>Gantt charts from Mermaid syntax</span>
				</div>
			</div>
		</div>

		<!-- Documentation -->
		<h3>Documentation</h3>
		<div class="context-docs">
			<aside class="docs-sidebar">
				<div class="docs-logo">
					<Logo size={20} />
					<span>Docs</span>
				</div>
				<div class="docs-nav">
					<div class="docs-section">Getting Started</div>
					<div class="docs-link">Installation</div>
					<div class="docs-link active">Quick Start</div>
					<div class="docs-link">Configuration</div>
					<div class="docs-section">Syntax</div>
					<div class="docs-link">Tasks</div>
					<div class="docs-link">Sections</div>
				</div>
			</aside>
			<main class="docs-content">
				<h1>Quick Start</h1>
				<p>Get up and running in minutes with Mermaid Gantt.</p>
				<pre><code>gantt
    title My Project
    dateFormat YYYY-MM-DD
    section Planning
    Research :a1, 2024-01-01, 7d</code></pre>
			</main>
		</div>

		<!-- Favicon / Small -->
		<h3>Favicon & Small Contexts</h3>
		<div class="context-favicon-row">
			<div class="favicon-item">
				<div class="browser-tab">
					<Logo size={16} />
					<span>Mermaid Gantt</span>
					<span class="tab-close">×</span>
				</div>
				<span class="favicon-label">Browser tab</span>
			</div>
			<div class="favicon-item">
				<div class="mobile-icon">
					<Logo size={32} />
				</div>
				<span class="favicon-label">Mobile app icon</span>
			</div>
			<div class="favicon-item">
				<div class="bookmark">
					<Logo size={16} />
					<span>Mermaid Gantt</span>
				</div>
				<span class="favicon-label">Bookmark</span>
			</div>
		</div>

		<!-- Dark Mode -->
		<h3>Dark Mode</h3>
		<div class="context-dark">
			<div class="dark-app">
				<div class="dark-header">
					<Logo size={24} />
					<span>Mermaid Gantt</span>
				</div>
				<div class="dark-content">
					<div class="dark-sidebar">
						<div class="dark-item">Dashboard</div>
						<div class="dark-item active">Projects</div>
						<div class="dark-item">Archive</div>
					</div>
					<div class="dark-main">
						<div class="gantt-bar dark-bar" style="width: 70%;"></div>
						<div class="gantt-bar dark-bar" style="width: 50%; opacity: 0.7;"></div>
						<div class="gantt-bar dark-bar" style="width: 40%; opacity: 0.5;"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Print / Monochrome -->
		<h3>Print & Monochrome</h3>
		<div class="context-print">
			<div class="print-letterhead">
				<div class="print-logo">
					<Logo size={32} />
					<span>Mermaid Gantt</span>
				</div>
				<div class="print-meta">
					<span>Project Report</span>
					<span>January 2025</span>
				</div>
			</div>
			<div class="print-content">
				<div class="print-line"></div>
				<div class="print-line short"></div>
				<div class="print-line"></div>
				<div class="print-line medium"></div>
			</div>
		</div>
	</section>
	{/if}

	{#if activeSection === 'motion'}
	<!-- Motion & Animation -->
	<section class="section" id="motion">
		<h2>13 — Motion</h2>
		<p class="section-intro">
			Motion in Mermaid Gantt is purposeful and efficient. Animations serve to communicate state changes,
			guide attention, and provide responsive feedback—never for decoration.
		</p>

		<!-- Core Principles -->
		<h3>Core Principles</h3>
		<div class="motion-principles">
			<div class="principle-card">
				<div class="principle-icon">1</div>
				<h4>Swift & Courteous</h4>
				<p>Entering elements arrive fast and settle gently. Exiting elements depart quickly without lingering.</p>
			</div>
			<div class="principle-card">
				<div class="principle-icon">2</div>
				<h4>Purposeful</h4>
				<p>Every animation communicates something: a state change, a spatial relationship, or feedback to user action.</p>
			</div>
			<div class="principle-card">
				<div class="principle-icon">3</div>
				<h4>Consistent</h4>
				<p>Same interaction patterns use the same timing and easing. Users learn to predict how the interface responds.</p>
			</div>
		</div>

		<!-- Easing Functions -->
		<h3>Easing Functions</h3>
		<div class="easing-section">
			<div class="easing-card primary-easing">
				<div class="easing-badge">Primary</div>
				<div class="easing-header">
					<span class="easing-name">Ease Out</span>
					<code class="easing-code">cubic-bezier(0, 0, 0.2, 1)</code>
				</div>
				<div class="easing-curve">
					<svg viewBox="0 0 100 100" class="curve-svg">
						<path d="M0,100 C0,100 20,0 100,0" stroke="currentColor" stroke-width="3" fill="none" />
						<circle cx="0" cy="100" r="4" fill="currentColor" />
						<circle cx="100" cy="0" r="4" fill="currentColor" />
					</svg>
				</div>
				<p class="easing-use">Elements appearing, modals opening, tooltips, notifications. Fast response, gentle landing.</p>
			</div>

			<div class="easing-card">
				<div class="easing-header">
					<span class="easing-name">Ease In-Out</span>
					<code class="easing-code">cubic-bezier(0.4, 0, 0.2, 1)</code>
				</div>
				<div class="easing-curve">
					<svg viewBox="0 0 100 100" class="curve-svg">
						<path d="M0,100 C40,100 20,0 100,0" stroke="currentColor" stroke-width="3" fill="none" />
						<circle cx="0" cy="100" r="4" fill="currentColor" />
						<circle cx="100" cy="0" r="4" fill="currentColor" />
					</svg>
				</div>
				<p class="easing-use">Position changes, task bar dragging, expanding panels. Symmetric and balanced.</p>
			</div>

			<div class="easing-card">
				<div class="easing-header">
					<span class="easing-name">Ease In</span>
					<code class="easing-code">cubic-bezier(0.4, 0, 1, 1)</code>
				</div>
				<div class="easing-curve">
					<svg viewBox="0 0 100 100" class="curve-svg">
						<path d="M0,100 C40,100 100,0 100,0" stroke="currentColor" stroke-width="3" fill="none" />
						<circle cx="0" cy="100" r="4" fill="currentColor" />
						<circle cx="100" cy="0" r="4" fill="currentColor" />
					</svg>
				</div>
				<p class="easing-use">Elements exiting, modal closing, menu dismissal. Quick departure.</p>
			</div>

			<div class="easing-card">
				<div class="easing-header">
					<span class="easing-name">Linear</span>
					<code class="easing-code">linear</code>
				</div>
				<div class="easing-curve">
					<svg viewBox="0 0 100 100" class="curve-svg">
						<path d="M0,100 L100,0" stroke="currentColor" stroke-width="3" fill="none" />
						<circle cx="0" cy="100" r="4" fill="currentColor" />
						<circle cx="100" cy="0" r="4" fill="currentColor" />
					</svg>
				</div>
				<p class="easing-use">Progress indicators, loading spinners, continuous processes only.</p>
			</div>
		</div>

		<!-- Duration Scale -->
		<h3>Duration Scale</h3>
		<div class="duration-scale">
			<div class="duration-row">
				<div class="duration-bar" style="--dur: 100ms; --width: 15%;"></div>
				<div class="duration-info">
					<span class="duration-value">100ms</span>
					<span class="duration-label">Micro</span>
					<span class="duration-desc">Button press feedback, icon color change, checkbox toggle</span>
				</div>
			</div>
			<div class="duration-row">
				<div class="duration-bar" style="--dur: 150ms; --width: 25%;"></div>
				<div class="duration-info">
					<span class="duration-value">150ms</span>
					<span class="duration-label">Fast</span>
					<span class="duration-desc">Tooltip appear, hover states, small state changes</span>
				</div>
			</div>
			<div class="duration-row primary-duration">
				<div class="duration-bar" style="--dur: 200ms; --width: 40%;"></div>
				<div class="duration-info">
					<span class="duration-value">200ms</span>
					<span class="duration-label">Standard</span>
					<span class="duration-desc">Default for most UI transitions. Modal open, panel expand, navigation</span>
				</div>
			</div>
			<div class="duration-row">
				<div class="duration-bar" style="--dur: 300ms; --width: 55%;"></div>
				<div class="duration-info">
					<span class="duration-value">300ms</span>
					<span class="duration-label">Emphasis</span>
					<span class="duration-desc">Larger panels, significant state changes, complex reveals</span>
				</div>
			</div>
			<div class="duration-row">
				<div class="duration-bar" style="--dur: 500ms; --width: 75%;"></div>
				<div class="duration-info">
					<span class="duration-value">500ms</span>
					<span class="duration-label">Max</span>
					<span class="duration-desc">Page transitions, orchestrated sequences. Upper limit for UI animations.</span>
				</div>
			</div>
		</div>

		<!-- Interactive Demos -->
		<h3>Interactive Examples</h3>

		<!-- Button Interactions -->
		<div class="demo-block">
			<h4>Button States</h4>
			<div class="button-demo">
				<button class="demo-btn primary">Primary Action</button>
				<button class="demo-btn secondary">Secondary</button>
				<button class="demo-btn ghost">Ghost</button>
			</div>
			<div class="demo-spec">
				<code>
					transition: background 100ms ease-out, transform 100ms ease-out, box-shadow 150ms ease-out;
				</code>
				<ul>
					<li><strong>Hover:</strong> Background shift + subtle lift (translateY -1px)</li>
					<li><strong>Active:</strong> Scale 0.98 + shadow removal (instant response)</li>
					<li><strong>Focus:</strong> Ring appears with 150ms ease-out</li>
				</ul>
			</div>
		</div>

		<!-- Modal Animation -->
		<div class="demo-block">
			<div class="demo-header">
				<h4>Modal Entrance</h4>
				<button class="retrigger-btn" onclick={retriggerModal}>
					<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 8a6 6 0 0 1 10.3-4.2M14 8a6 6 0 0 1-10.3 4.2" />
						<path d="M12 2v4h-4M4 14v-4h4" />
					</svg>
					Replay
				</button>
			</div>
			<div class="modal-demo">
				{#key `${activeSection}-${modalKey}`}
					<div class="modal-preview">
						<div class="modal-backdrop"></div>
						<div class="modal-content">
							<div class="modal-header">Edit Task</div>
							<div class="modal-body"></div>
						</div>
					</div>
				{/key}
			</div>
			<div class="demo-spec">
				<code>
					/* Backdrop */ opacity: 0 → 1, 200ms ease-out<br />
					/* Content */ opacity: 0 → 1, scale(0.95) → scale(1), 200ms ease-out
				</code>
				<ul>
					<li><strong>Entry:</strong> Backdrop fades while content scales up slightly</li>
					<li><strong>Exit:</strong> Reverse at 150ms ease-in (quicker departure)</li>
					<li><strong>No transform origin shift</strong>—center scale only</li>
				</ul>
			</div>
		</div>

		<!-- Task Bar Animation -->
		<div class="demo-block">
			<div class="demo-header">
				<h4>Task Bar Interactions</h4>
				<button class="retrigger-btn" onclick={retriggerTaskBar}>
					<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 8a6 6 0 0 1 10.3-4.2M14 8a6 6 0 0 1-10.3 4.2" />
						<path d="M12 2v4h-4M4 14v-4h4" />
					</svg>
					Replay
				</button>
			</div>
			{#key `${activeSection}-${taskBarKey}`}
				<div class="taskbar-demo">
					<div class="task-row">
						<span class="task-label">Design Phase</span>
						<div class="task-track">
							<div class="task-bar-demo"></div>
						</div>
					</div>
					<div class="task-row">
						<span class="task-label">Development</span>
						<div class="task-track">
							<div class="task-bar-demo offset"></div>
						</div>
					</div>
				</div>
			{/key}
			<div class="demo-spec">
				<code>
					/* Drag */ transform, 0ms (immediate)<br />
					/* Snap */ transform, 150ms cubic-bezier(0.4, 0, 0.2, 1)<br />
					/* Resize handles */ opacity 100ms ease-out on hover
				</code>
				<ul>
					<li><strong>Dragging:</strong> No transition—follows cursor immediately</li>
					<li><strong>Snap to grid:</strong> 150ms ease-in-out when released</li>
					<li><strong>Ghost position:</strong> Original position shown at 30% opacity during drag</li>
				</ul>
			</div>
		</div>

		<!-- Stagger Pattern -->
		<div class="demo-block">
			<div class="demo-header">
				<h4>Staggered List Entry</h4>
				<button class="retrigger-btn" onclick={retriggerStagger}>
					<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 8a6 6 0 0 1 10.3-4.2M14 8a6 6 0 0 1-10.3 4.2" />
						<path d="M12 2v4h-4M4 14v-4h4" />
					</svg>
					Replay
				</button>
			</div>
			{#key `${activeSection}-${staggerKey}`}
				<div class="stagger-demo">
					<div class="stagger-item" style="--i: 0">Project Alpha</div>
					<div class="stagger-item" style="--i: 1">Project Beta</div>
					<div class="stagger-item" style="--i: 2">Project Gamma</div>
					<div class="stagger-item" style="--i: 3">Project Delta</div>
				</div>
			{/key}
			<div class="demo-spec">
				<code>
					animation: fadeSlideIn 200ms ease-out backwards;<br />
					animation-delay: calc(var(--i) * 50ms);
				</code>
				<ul>
					<li><strong>Offset:</strong> 50ms between each item</li>
					<li><strong>Direction:</strong> Top to bottom (natural reading flow)</li>
					<li><strong>Max items:</strong> Cap stagger at 8 items to avoid slow reveals</li>
				</ul>
			</div>
		</div>

		<!-- Loading States -->
		<div class="demo-block">
			<div class="demo-header">
				<h4>Loading States</h4>
				<button class="retrigger-btn" onclick={retriggerLoading}>
					<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 8a6 6 0 0 1 10.3-4.2M14 8a6 6 0 0 1-10.3 4.2" />
						<path d="M12 2v4h-4M4 14v-4h4" />
					</svg>
					Replay
				</button>
			</div>
			{#key `${activeSection}-${loadingKey}`}
				<div class="loading-demo">
					<div class="loader-example">
						<div class="loader-bar"></div>
						<span>Progress Bar</span>
					</div>
					<div class="loader-example">
						<div class="loader-pulse"></div>
						<span>Skeleton Pulse</span>
					</div>
					<div class="loader-example">
						<div class="loader-spinner"></div>
						<span>Spinner</span>
					</div>
				</div>
			{/key}
			<div class="demo-spec">
				<code>
					/* Progress */ width transition, linear (reflects actual progress)<br />
					/* Pulse */ opacity 1.5s ease-in-out infinite<br />
					/* Spinner */ rotation 1s linear infinite
				</code>
			</div>
		</div>

		<!-- Reduced Motion -->
		<h3>Accessibility: Reduced Motion</h3>
		<div class="reduced-motion-block">
			<div class="reduced-motion-code">
				<pre><code>@media (prefers-reduced-motion: reduce) &#123;
  *, *::before, *::after &#123;
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  &#125;
&#125;</code></pre>
			</div>
			<div class="reduced-motion-notes">
				<h4>When reduced motion is active:</h4>
				<ul>
					<li>Replace motion with instant state changes</li>
					<li>Opacity fades can remain (≤100ms)</li>
					<li>Never remove the visual feedback entirely—just the motion</li>
					<li>Test with macOS: System Settings → Accessibility → Display → Reduce motion</li>
				</ul>
			</div>
		</div>

		<!-- CSS Variables -->
		<h3>CSS Custom Properties</h3>
		<div class="css-vars-block">
			<pre><code>:root &#123;
  /* Easing */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);

  /* Durations */
  --duration-micro: 100ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-emphasis: 300ms;
  --duration-max: 500ms;

  /* Stagger */
  --stagger-offset: 50ms;
&#125;</code></pre>
		</div>
	</section>
	{/if}
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

	.guidelines {
		font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
		display: flex;
		min-height: 100vh;
		color: #0f172a;
		line-height: 1.6;
	}

	/* Sidebar */
	.sidebar {
		width: 180px;
		flex-shrink: 0;
		background: #f8fafc;
		border-right: 1px solid #e2e8f0;
		padding: 1rem 0.5rem;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		margin-bottom: 1rem;
		font-weight: 600;
		font-size: 0.9rem;
		color: #0f172a;
	}

	.nav-item {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: #64748b;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
	}

	.nav-item:hover {
		color: #0f172a;
		background: #e2e8f0;
	}

	.nav-item.active {
		color: #0f172a;
		background: #ffffff;
		box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	}

	/* Content */
	.content {
		flex: 1;
		padding: 2rem 3rem;
		max-width: 800px;
		overflow-y: auto;
	}

	/* Intro Header */
	.intro-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.intro-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 0.5rem;
		color: #0f172a;
	}

	.intro-header p {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0 0 1rem;
		max-width: 500px;
		line-height: 1.5;
	}

	.llm-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		color: #0284c7;
		text-decoration: none;
		transition: all 100ms cubic-bezier(0, 0, 0.2, 1);
	}

	.llm-link:hover {
		background: #e0f2fe;
		border-color: #7dd3fc;
		color: #0369a1;
	}

	.llm-link svg {
		width: 16px;
		height: 16px;
	}

	/* Sections */
	.section {
		margin-bottom: 2rem;
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
		font-size: 0.75rem;
		color: #94a3b8;
		margin-top: 0.75rem;
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

	/* ============================================
	   Section 11: Logo Variations
	   ============================================ */

	.variations-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.variation-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		position: relative;
	}

	.variation-card.primary {
		border-color: #0ea5e9;
		background: linear-gradient(to bottom, #f0f9ff, #ffffff);
	}

	.variation-badge {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: #0ea5e9;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.variation-demo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: #f8fafc;
	}

	.variation-demo.mono-bg {
		background: #0f172a;
		color: #f8fafc;
	}

	.variation-info {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.variation-info strong {
		font-size: 0.85rem;
	}

	.variation-info span {
		font-size: 0.75rem;
		color: #64748b;
	}

	/* Wordmark font variations */
	.var-wordmark {
		font-size: 1.25rem;
		letter-spacing: -0.01em;
	}

	.var-wordmark.dm-sans {
		font-family: 'DM Sans', system-ui;
		font-weight: 600;
	}

	.var-wordmark.instrument {
		font-family: 'Instrument Sans', 'DM Sans', system-ui;
		font-weight: 600;
	}

	.var-wordmark.geist {
		font-family: 'Geist', 'DM Sans', system-ui;
		font-weight: 500;
	}

	.var-wordmark.satoshi {
		font-family: 'Satoshi', 'DM Sans', system-ui;
		font-weight: 500;
	}

	.var-wordmark.space-grotesk {
		font-family: 'Space Grotesk', system-ui;
		font-weight: 600;
	}

	.var-wordmark.dm-mono {
		font-family: 'DM Mono', monospace;
		font-weight: 400;
		font-size: 1.1rem;
	}

	/* Weight variations */
	.var-wordmark.light { font-weight: 300; }
	.var-wordmark.regular { font-weight: 400; }
	.var-wordmark.medium { font-weight: 500; }
	.var-wordmark.semibold { font-weight: 600; }
	.var-wordmark.bold { font-weight: 700; }

	.weight-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.weight-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		background: #f8fafc;
		border-radius: 8px;
	}

	.weight-item.primary {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
	}

	.weight-demo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.weight-label {
		font-size: 0.75rem;
		color: #64748b;
	}

	/* Stacked arrangements */
	.stacked-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.stacked-item {
		text-align: center;
	}

	.stacked-demo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem 1rem;
		background: #f8fafc;
		border-radius: 12px;
		margin-bottom: 0.5rem;
	}

	.stacked-demo.horizontal {
		flex-direction: row;
		justify-content: center;
		gap: 0.75rem;
	}

	.stacked-text {
		display: flex;
		flex-direction: column;
		text-align: center;
		line-height: 1.1;
	}

	.stacked-text.left {
		text-align: left;
	}

	.stacked-name {
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.stacked-name.small {
		font-size: 0.9rem;
	}

	.stacked-sub {
		font-size: 1rem;
		font-weight: 400;
		color: #64748b;
	}

	.stacked-sub.small {
		font-size: 0.75rem;
	}

	.stacked-full {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.stacked-label {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	/* ============================================
	   Section 12: In Context
	   ============================================ */

	/* Application Header Context */
	.context-app-header {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.app-chrome {
		display: flex;
		height: 280px;
	}

	.app-sidebar {
		width: 200px;
		background: #f8fafc;
		border-right: 1px solid #e2e8f0;
		padding: 1rem;
	}

	.app-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.app-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.nav-item {
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
		color: #64748b;
		cursor: pointer;
	}

	.nav-item.active {
		background: #0ea5e9;
		color: white;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.app-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.toolbar-title {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-outline {
		padding: 0.375rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.8rem;
		color: #475569;
	}

	.btn-primary {
		padding: 0.375rem 0.75rem;
		background: #0ea5e9;
		color: white;
		border-radius: 6px;
		font-size: 0.8rem;
	}

	.app-content {
		flex: 1;
		padding: 1rem;
	}

	.gantt-preview {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 1rem;
	}

	.gantt-bar {
		height: 28px;
		background: #0ea5e9;
		border-radius: 4px;
		position: relative;
	}

	/* Website Header Context */
	.context-website {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.web-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.web-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
	}

	.web-nav {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.web-nav span {
		font-size: 0.85rem;
		color: #475569;
	}

	.web-nav span.cta {
		background: #0ea5e9;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
	}

	.web-hero {
		padding: 3rem 1.5rem;
		background: linear-gradient(to bottom, #f8fafc, #ffffff);
		text-align: center;
	}

	.web-hero h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
	}

	.web-hero p {
		margin: 0;
		color: #64748b;
		font-size: 1rem;
	}

	/* Social Media Context */
	.context-social-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.social-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
	}

	.social-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
	}

	.social-avatar.dark {
		background: #0f172a;
		color: #f8fafc;
	}

	.social-info {
		display: flex;
		flex-direction: column;
	}

	.social-info strong {
		font-size: 0.95rem;
	}

	.social-info span {
		font-size: 0.8rem;
		color: #64748b;
	}

	/* Documentation Context */
	.context-docs {
		display: flex;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 2rem;
		height: 280px;
	}

	.docs-sidebar {
		width: 180px;
		background: #f8fafc;
		border-right: 1px solid #e2e8f0;
		padding: 1rem;
	}

	.docs-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 0.85rem;
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.docs-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.docs-section {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		margin-top: 0.75rem;
		margin-bottom: 0.25rem;
	}

	.docs-link {
		font-size: 0.8rem;
		padding: 0.35rem 0.5rem;
		border-radius: 4px;
		color: #475569;
	}

	.docs-link.active {
		background: #0ea5e9;
		color: white;
	}

	.docs-content {
		flex: 1;
		padding: 1.5rem;
		overflow: hidden;
	}

	.docs-content h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
	}

	.docs-content p {
		margin: 0 0 1rem;
		color: #475569;
		font-size: 0.9rem;
	}

	.docs-content pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: 8px;
		font-size: 0.8rem;
		margin: 0;
		overflow: hidden;
	}

	.docs-content code {
		font-family: 'DM Mono', monospace;
	}

	/* Favicon Context */
	.context-favicon-row {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.favicon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.browser-tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f1f5f9;
		border-radius: 8px 8px 0 0;
		border: 1px solid #e2e8f0;
		border-bottom: none;
		font-size: 0.75rem;
	}

	.tab-close {
		color: #94a3b8;
		margin-left: 0.5rem;
	}

	.mobile-icon {
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #0ea5e9, #0284c7);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.bookmark {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.75rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.favicon-label {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	/* Dark Mode Context */
	.context-dark {
		margin-bottom: 2rem;
	}

	.dark-app {
		background: #0f172a;
		border-radius: 12px;
		overflow: hidden;
	}

	.dark-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #1e293b;
		color: #f8fafc;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.dark-content {
		display: flex;
		height: 180px;
	}

	.dark-sidebar {
		width: 140px;
		padding: 0.75rem;
		border-right: 1px solid #1e293b;
	}

	.dark-item {
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.8rem;
		color: #94a3b8;
		margin-bottom: 0.25rem;
	}

	.dark-item.active {
		background: #1e293b;
		color: #f8fafc;
	}

	.dark-main {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gantt-bar.dark-bar {
		background: #0ea5e9;
	}

	/* Print Context */
	.context-print {
		background: #fafafa;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 2rem;
	}

	.print-letterhead {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #0f172a;
	}

	.print-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-weight: 600;
		font-size: 1rem;
	}

	.print-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 0.8rem;
		color: #475569;
	}

	.print-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.print-line {
		height: 8px;
		background: #e2e8f0;
		border-radius: 4px;
	}

	.print-line.short {
		width: 60%;
	}

	.print-line.medium {
		width: 80%;
	}

	/* Section 13: Motion */

	/* Core Principles */
	.motion-principles {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.principle-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
	}

	.principle-icon {
		font-size: 1.5rem;
		margin-bottom: 0.75rem;
	}

	.principle-card h4 {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		color: #0f172a;
	}

	.principle-card p {
		font-size: 0.8rem;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	/* Easing Section */
	.easing-section {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.easing-card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		position: relative;
	}

	.easing-card.primary-easing {
		border-color: #0ea5e9;
		background: linear-gradient(to bottom, #f0f9ff, #ffffff);
	}

	.easing-badge {
		position: absolute;
		top: -8px;
		right: 12px;
		background: #0ea5e9;
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	.easing-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.easing-name {
		font-weight: 600;
		font-size: 0.95rem;
		color: #0f172a;
	}

	.easing-code {
		font-family: 'DM Mono', monospace;
		font-size: 0.7rem;
		background: #f1f5f9;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		color: #475569;
	}

	.easing-curve {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.curve-svg {
		width: 80px;
		height: 80px;
		color: #0ea5e9;
	}

	.easing-use {
		font-size: 0.8rem;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	/* Duration Scale */
	.duration-scale {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.duration-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.duration-row.primary-duration {
		background: linear-gradient(to right, #f0f9ff, transparent);
		margin: 0 -1rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
	}

	.duration-bar {
		width: var(--width);
		height: 8px;
		background: linear-gradient(to right, #0ea5e9, #38bdf8);
		border-radius: 4px;
		min-width: 60px;
		animation: -global-durationPulse 2s ease-in-out infinite;
		animation-delay: calc(var(--dur) * 5);
	}

	@keyframes -global-durationPulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.duration-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.duration-value {
		font-family: 'DM Mono', monospace;
		font-size: 0.85rem;
		font-weight: 600;
		color: #0f172a;
		min-width: 50px;
	}

	.duration-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #0ea5e9;
		min-width: 70px;
	}

	.duration-desc {
		font-size: 0.8rem;
		color: #64748b;
	}

	/* Demo Blocks */
	.demo-block {
		margin-bottom: 2rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
	}

	.demo-block h4 {
		font-size: 0.85rem;
		font-weight: 600;
		color: #0f172a;
		margin: 0;
	}

	.demo-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.retrigger-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.65rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: #64748b;
		cursor: pointer;
		transition: all 100ms cubic-bezier(0, 0, 0.2, 1);
	}

	.retrigger-btn:hover {
		background: #f1f5f9;
		border-color: #cbd5e1;
		color: #0f172a;
	}

	.retrigger-btn:active {
		transform: scale(0.97);
	}

	.retrigger-btn svg {
		width: 14px;
		height: 14px;
	}

	/* Button Demo */
	.button-demo {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.demo-btn {
		padding: 0.6rem 1.25rem;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
		transition:
			background 100ms cubic-bezier(0, 0, 0.2, 1),
			transform 100ms cubic-bezier(0, 0, 0.2, 1),
			box-shadow 150ms cubic-bezier(0, 0, 0.2, 1);
	}

	.demo-btn.primary {
		background: #0ea5e9;
		color: white;
		border: none;
		box-shadow: 0 2px 4px rgba(14, 165, 233, 0.3);
	}

	.demo-btn.primary:hover {
		background: #0284c7;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(14, 165, 233, 0.3);
	}

	.demo-btn.primary:active {
		transform: scale(0.98);
		box-shadow: none;
	}

	.demo-btn.secondary {
		background: white;
		color: #0f172a;
		border: 1px solid #e2e8f0;
	}

	.demo-btn.secondary:hover {
		background: #f8fafc;
		border-color: #cbd5e1;
		transform: translateY(-1px);
	}

	.demo-btn.secondary:active {
		transform: scale(0.98);
	}

	.demo-btn.ghost {
		background: transparent;
		color: #64748b;
		border: none;
	}

	.demo-btn.ghost:hover {
		background: #f1f5f9;
		color: #0f172a;
	}

	.demo-btn.ghost:active {
		transform: scale(0.98);
	}

	.demo-spec {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1rem;
	}

	.demo-spec code {
		display: block;
		font-family: 'DM Mono', monospace;
		font-size: 0.75rem;
		color: #475569;
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	.demo-spec ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.8rem;
		color: #64748b;
	}

	.demo-spec li {
		margin-bottom: 0.25rem;
	}

	/* Modal Demo */
	.modal-demo {
		margin-bottom: 1.5rem;
	}

	.modal-preview {
		position: relative;
		height: 180px;
		background: #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.modal-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(15, 23, 42, 0.5);
		animation: -global-backdropFade 200ms cubic-bezier(0, 0, 0.2, 1) forwards;
	}

	@keyframes -global-backdropFade {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 200px;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		animation: -global-modalEntry 200ms cubic-bezier(0, 0, 0.2, 1) forwards;
	}

	@keyframes -global-modalEntry {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.modal-header {
		padding: 0.75rem 1rem;
		font-size: 0.85rem;
		font-weight: 600;
		border-bottom: 1px solid #e2e8f0;
	}

	.modal-body {
		height: 60px;
		background: #f8fafc;
	}

	/* Task Bar Demo */
	.taskbar-demo {
		margin-bottom: 1.5rem;
	}

	.task-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.task-label {
		font-size: 0.8rem;
		color: #64748b;
		width: 100px;
	}

	.task-track {
		flex: 1;
		height: 28px;
		background: #e2e8f0;
		border-radius: 6px;
		position: relative;
	}

	.task-bar-demo {
		position: absolute;
		left: 10%;
		top: 4px;
		width: 40%;
		height: 20px;
		background: #0ea5e9;
		border-radius: 4px;
		cursor: grab;
		animation: -global-taskDrag 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.task-bar-demo.offset {
		left: 25%;
		width: 35%;
		opacity: 0.7;
		animation-delay: 0.4s;
	}

	@keyframes -global-taskDrag {
		0% { transform: translateX(0); }
		35% { transform: translateX(80px); }
		100% { transform: translateX(50px); }
	}

	/* Stagger Demo */
	.stagger-demo {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.stagger-item {
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 0.85rem;
		color: #0f172a;
		animation: -global-staggerIn 200ms cubic-bezier(0, 0, 0.2, 1) backwards;
		animation-delay: calc(var(--i) * 50ms);
	}

	@keyframes -global-staggerIn {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Loading Demo */
	.loading-demo {
		display: flex;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.loader-example {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.loader-example span {
		font-size: 0.75rem;
		color: #64748b;
	}

	.loader-bar {
		width: 100px;
		height: 6px;
		background: #e2e8f0;
		border-radius: 3px;
		overflow: hidden;
		position: relative;
	}

	.loader-bar::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 60%;
		background: #0ea5e9;
		border-radius: 3px;
		animation: -global-progressGrow 2s linear infinite;
	}

	@keyframes -global-progressGrow {
		0% { width: 0; }
		100% { width: 100%; }
	}

	.loader-pulse {
		width: 100px;
		height: 32px;
		background: #e2e8f0;
		border-radius: 6px;
		animation: -global-pulse 1.5s ease-in-out infinite;
	}

	@keyframes -global-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	.loader-spinner {
		width: 24px;
		height: 24px;
		border: 3px solid #e2e8f0;
		border-top-color: #0ea5e9;
		border-radius: 50%;
		animation: -global-spin 1s linear infinite;
	}

	@keyframes -global-spin {
		to { transform: rotate(360deg); }
	}

	/* Reduced Motion Block */
	.reduced-motion-block {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.reduced-motion-code {
		background: #0f172a;
		border-radius: 12px;
		padding: 1.25rem;
		overflow: auto;
	}

	.reduced-motion-code pre {
		margin: 0;
	}

	.reduced-motion-code code {
		font-family: 'DM Mono', monospace;
		font-size: 0.75rem;
		color: #e2e8f0;
		line-height: 1.6;
	}

	.reduced-motion-notes {
		background: #fef3c7;
		border: 1px solid #fcd34d;
		border-radius: 12px;
		padding: 1.25rem;
	}

	.reduced-motion-notes h4 {
		font-size: 0.85rem;
		font-weight: 600;
		color: #92400e;
		margin: 0 0 0.75rem;
	}

	.reduced-motion-notes ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.8rem;
		color: #78350f;
	}

	.reduced-motion-notes li {
		margin-bottom: 0.35rem;
	}

	/* CSS Variables Block */
	.css-vars-block {
		background: #0f172a;
		border-radius: 12px;
		padding: 1.5rem;
		overflow: auto;
	}

	.css-vars-block pre {
		margin: 0;
	}

	.css-vars-block code {
		font-family: 'DM Mono', monospace;
		font-size: 0.8rem;
		color: #e2e8f0;
		line-height: 1.7;
	}
</style>
