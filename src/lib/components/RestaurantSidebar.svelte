<script>
	let {
		numero,
		titre,
		tagline,
		neighborhood,
		nivDePrix = 1,
		isTopPick = false,
		image = '',
		thumbTone = 'warm'
	} = $props();

	const MAX_PRIX = 4;
	const actifs = $derived(Math.min(nivDePrix, MAX_PRIX));
</script>

<li class="restaurant-row" class:is-top={isTopPick}>
	<span class="rank">{numero}</span>

	<div class="thumb" data-tone={thumbTone} aria-hidden="true">
		<img src={image} alt="" loading="lazy" />
	</div>

	<div class="info">
		<span class="name">{titre}</span>
		<p class="pInfo">
			<span>{tagline}</span> ·
			<span>{neighborhood}</span>
		</p>
	</div>

	<div class="side">
		<span class="price" aria-label={`Niveau de prix ${actifs} sur ${MAX_PRIX}`}>
			<span>{'€'.repeat(actifs)}</span><span class="off">{'€'.repeat(MAX_PRIX - actifs)}</span>
		</span>
		{#if isTopPick}
			<span class="top-pick">TOP PICK</span>
		{/if}
	</div>
</li>

<style>
	.restaurant-row {
		--ink: #1b1b18;
		--muted: #6b6a64;
		--line: #e6e3da;
		--amber: #b0791f;

		display: grid;
		grid-template-columns: 1.75rem 3rem minmax(0, 1fr) auto;
		align-items: center;
		column-gap: 0.75rem;
		padding: 0.45rem 0.8rem;
		list-style: none;
		box-sizing: border-box;
		border-bottom: 1px solid var(--line);
		font-family: 'Inter', system-ui, sans-serif;
	}

	/* Ligne mise en avant : pastille pêche arrondie, sans trait de séparation */
	.restaurant-row.is-top {
		background: #fbebd7;
		border: 1px solid #f1d9b8;
		border-radius: 999px;
		padding-block: 0.7rem;
	}

	.rank {
		font-family: 'Source Serif 4', 'Newsreader', Georgia, serif;
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1;
		color: var(--ink);
		text-align: center;
	}

	.thumb {
		width: 3rem;
		height: 3rem;
		border-radius: 8px;
		overflow: hidden;
		background: linear-gradient(135deg, #d7b28f 0%, #7a4d2c 100%);
	}

	.thumb[data-tone='earth'] {
		background: linear-gradient(135deg, #d7c8b9 0%, #73675d 100%);
	}

	.thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.pInfo {
		font-size: 0.72rem;
		line-height: 1.25;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.name {
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.15;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.price {
		font-size: 0.85rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	.price .off {
		color: #cfcbc0;
	}

	.top-pick {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		line-height: 1;
		color: var(--amber);
	}
</style>
