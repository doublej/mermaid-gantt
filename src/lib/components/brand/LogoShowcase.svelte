<script lang="ts">
	import Logo1Bars from './Logo1-Bars.svelte';
	import Logo2Flow from './Logo2-Flow.svelte';
	import Logo3Wave from './Logo3-Wave.svelte';
	import Logo4Bracket from './Logo4-Bracket.svelte';
	import Logo5Grid from './Logo5-Grid.svelte';
</script>

<div class="showcase">
	<div class="logo-grid">
		<div class="logo-card">
			<div class="logo-display">
				<Logo1Bars size={48} />
			</div>
			<div class="logo-info">
				<h3>1. Stacked Bars</h3>
				<p>Three offset bars. Pure Gantt.</p>
			</div>
			<div class="sizes">
				<Logo1Bars size={16} />
				<Logo1Bars size={24} />
				<Logo1Bars size={32} />
				<Logo1Bars size={48} />
			</div>
		</div>

		<div class="logo-card">
			<div class="logo-display">
				<Logo2Flow size={48} />
			</div>
			<div class="logo-info">
				<h3>2. Connected Flow</h3>
				<p>Task dependencies. Flowchart DNA.</p>
			</div>
			<div class="sizes">
				<Logo2Flow size={16} />
				<Logo2Flow size={24} />
				<Logo2Flow size={32} />
				<Logo2Flow size={48} />
			</div>
		</div>

		<div class="logo-card">
			<div class="logo-display">
				<Logo3Wave size={48} />
			</div>
			<div class="logo-info">
				<h3>3. Wave Bars</h3>
				<p>Mermaid nod. Organic flow.</p>
			</div>
			<div class="sizes">
				<Logo3Wave size={16} />
				<Logo3Wave size={24} />
				<Logo3Wave size={32} />
				<Logo3Wave size={48} />
			</div>
		</div>

		<div class="logo-card">
			<div class="logo-display">
				<Logo4Bracket size={48} />
			</div>
			<div class="logo-info">
				<h3>4. Code Bracket</h3>
				<p>Syntax-first. Developer tool.</p>
			</div>
			<div class="sizes">
				<Logo4Bracket size={16} />
				<Logo4Bracket size={24} />
				<Logo4Bracket size={32} />
				<Logo4Bracket size={48} />
			</div>
		</div>

		<div class="logo-card">
			<div class="logo-display">
				<Logo5Grid size={48} />
			</div>
			<div class="logo-info">
				<h3>5. Timeline Grid</h3>
				<p>Chart interface. Structured.</p>
			</div>
			<div class="sizes">
				<Logo5Grid size={16} />
				<Logo5Grid size={24} />
				<Logo5Grid size={32} />
				<Logo5Grid size={48} />
			</div>
		</div>
	</div>

	<!-- Dark/Light comparison -->
	<div class="theme-comparison">
		<div class="theme-row light">
			<Logo1Bars size={32} />
			<Logo2Flow size={32} />
			<Logo3Wave size={32} />
			<Logo4Bracket size={32} />
			<Logo5Grid size={32} />
		</div>
		<div class="theme-row dark">
			<Logo1Bars size={32} />
			<Logo2Flow size={32} />
			<Logo3Wave size={32} />
			<Logo4Bracket size={32} />
			<Logo5Grid size={32} />
		</div>
	</div>
</div>

<style>
	.showcase {
		padding: 2rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.logo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.logo-card {
		border: 1px solid oklch(0.8 0 0);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.logo-display {
		display: flex;
		justify-content: center;
		padding: 1.5rem;
		background: oklch(0.97 0 0);
		border-radius: 8px;
		color: oklch(0.25 0 0);
	}

	.logo-info h3 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.logo-info p {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: oklch(0.5 0 0);
	}

	.sizes {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-top: 0.5rem;
		border-top: 1px solid oklch(0.9 0 0);
		color: oklch(0.4 0 0);
	}

	.theme-comparison {
		display: flex;
		flex-direction: column;
		gap: 0;
		border-radius: 12px;
		overflow: hidden;
	}

	.theme-row {
		display: flex;
		justify-content: center;
		gap: 2rem;
		padding: 2rem;
	}

	.theme-row.light {
		background: oklch(0.98 0 0);
		color: oklch(0.2 0 0);
	}

	.theme-row.dark {
		background: oklch(0.15 0 0);
		color: oklch(0.95 0 0);
	}
</style>
