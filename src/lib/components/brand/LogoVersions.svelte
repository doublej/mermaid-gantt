<script lang="ts">
	import LogoV1 from './Logo-Pro.svelte';
	import LogoV2 from './Logo-V2.svelte';
	import LogoV3 from './Logo-V3.svelte';

	let rotateDemo = $state(false);
</script>

<div class="showcase">
	<h1>Mermaid Gantt — Logo Versions</h1>

	<div class="versions">
		<!-- V1 -->
		<div class="version-card">
			<div class="logo-display">
				<LogoV1 size={64} />
			</div>
			<div class="info">
				<h2>V1: Gantt Flow</h2>
				<p>Stacked bars with anchor node. Golden ratio proportions. Classic Gantt visualization.</p>
			</div>
			<div class="sizes">
				<LogoV1 size={16} />
				<LogoV1 size={24} />
				<LogoV1 size={32} />
				<LogoV1 size={48} />
			</div>
		</div>

		<!-- V2 -->
		<div class="version-card">
			<div class="logo-display dual">
				<div class="dual-item">
					<LogoV2 size={64} />
					<span>Normal</span>
				</div>
				<div class="dual-arrow">→</div>
				<div class="dual-item">
					<LogoV2 size={64} rotate />
					<span>Rotated = M</span>
				</div>
			</div>
			<div class="info">
				<h2>V2: Gantt M</h2>
				<p>Rotates 90° to form letter "M" for Mermaid. Dual-meaning mark.</p>
			</div>
			<div class="sizes">
				<LogoV2 size={16} />
				<LogoV2 size={24} />
				<LogoV2 size={32} />
				<LogoV2 size={48} />
			</div>
		</div>

		<!-- V3 -->
		<div class="version-card">
			<div class="logo-display">
				<LogoV3 size={64} />
			</div>
			<div class="info">
				<h2>V3: Gantt Sea</h2>
				<p>Bars rising from wave baseline. Mermaid/sea theme integrated into structure.</p>
			</div>
			<div class="sizes">
				<LogoV3 size={16} />
				<LogoV3 size={24} />
				<LogoV3 size={32} />
				<LogoV3 size={48} />
			</div>
		</div>
	</div>

	<!-- Theme comparison -->
	<section class="themes">
		<h3>Theme Contexts</h3>
		<div class="theme-grid">
			<div class="theme-row light">
				<LogoV1 size={32} />
				<LogoV2 size={32} />
				<LogoV3 size={32} />
			</div>
			<div class="theme-row dark">
				<LogoV1 size={32} />
				<LogoV2 size={32} />
				<LogoV3 size={32} />
			</div>
		</div>
	</section>

	<!-- Animation demo for V2 -->
	<section class="animation">
		<h3>V2 Rotation Animation</h3>
		<div class="animation-demo">
			<label class="toggle">
				<input type="checkbox" bind:checked={rotateDemo} />
				<span>Toggle rotation</span>
			</label>
			<div class="animation-box">
				<LogoV2 size={96} rotate={rotateDemo} />
			</div>
		</div>
	</section>
</div>

<style>
	.showcase {
		font-family: system-ui, -apple-system, sans-serif;
		padding: 3rem;
		max-width: 1000px;
		margin: 0 auto;
		color: #1e293b;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 2rem;
		letter-spacing: -0.02em;
	}

	h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
	}

	h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
		margin-bottom: 1rem;
	}

	p {
		font-size: 0.85rem;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	.versions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.version-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.logo-display {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 8px;
		min-height: 100px;
	}

	.logo-display.dual {
		gap: 1rem;
	}

	.dual-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.dual-item span {
		font-size: 0.65rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.dual-arrow {
		color: #cbd5e1;
		font-size: 1.25rem;
	}

	.info {
		padding: 0.5rem 0;
	}

	.sizes {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #f1f5f9;
	}

	/* Themes */
	.themes {
		margin-bottom: 3rem;
	}

	.theme-grid {
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		overflow: hidden;
	}

	.theme-row {
		display: flex;
		justify-content: center;
		gap: 3rem;
		padding: 2rem;
	}

	.theme-row.light {
		background: #ffffff;
		color: #1e293b;
		border: 1px solid #e2e8f0;
		border-bottom: none;
		border-radius: 12px 12px 0 0;
	}

	.theme-row.dark {
		background: #0f172a;
		color: #f8fafc;
		border-radius: 0 0 12px 12px;
	}

	/* Animation */
	.animation-demo {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 12px;
	}

	.animation-box {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		font-size: 0.85rem;
		color: #475569;
	}

	.toggle input {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: #3b82f6;
	}
</style>
