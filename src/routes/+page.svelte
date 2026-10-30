<script>
	import Croix from '#lib/assets/croix.svg';
	import Loupe from '#lib/assets/loupe.svg';
	import Reload from '#lib/assets/reload.svg';
	import RestauRow from '#lib/components/RestaurantRow.svelte';
	import MapPanel from '../lib/components/MapPanel.svelte';
	import RestauSideBar from '#lib/components/RestaurantSidebar.svelte';
	import ImgBart from '../lib/assets/imgBart.jpg';
	import { filterRestaurantsWithinRadius } from '#lib/geolocation.js';

	let asideOpen = $state(true);
	let { data } = $props();
	// console.log(data);

	let addressInput = $state('');
	let radiusMeters = 500;
	let selectedLocation = $state(null);
	let activeTab = $state('ranked');
	let selectedTag = $state('All');
	let hasUserInteracted = $state(false);

	// Toutes les données restaurants envoyées par le serveur.
	let allRestaurants = $derived(data.all ?? []);

	// Liste des restaurants classés.
	let rankedRestaurants = $derived(
		allRestaurants.filter((restaurant) => restaurant.list_status === 'ranked')
	);

	// On construit les boutons de tag de façon dynamique.
	// 1) on parcourt tous les restaurants
	// 2) on lit chaque champ all_tags
	// 3) on sépare la chaîne en plusieurs tags
	// 4) on enlève les doublons
	// 5) on ajoute "all" pour le bouton reset visuel
	let tagButtons = $derived([
		'All',
		...new Set(
			allRestaurants.flatMap((restaurant) => {
				const listOfTags = String(restaurant.all_tags ?? '')
					.split(',')
					.map((tag) => tag.trim())
					.filter(Boolean);
				return listOfTags;
			})
		)
	]);

	// console.log(tagButtons);

	let wantToTryRestaurants = $derived(
		allRestaurants.filter(
			(restaurant) =>
				restaurant.list_status === 'want_to_try'
		)
	);
	let visibleRestaurants = $derived(
		activeTab === 'ranked' ? rankedRestaurants : wantToTryRestaurants
	);

	// console.log(visibleRestaurants);

	let filteredVisibleRestaurants = $derived(
		selectedLocation
			? filterRestaurantsWithinRadius(visibleRestaurants, selectedLocation, radiusMeters)
			: visibleRestaurants
	);

	let restaurantTags = $derived(
		selectedTag == 'All'
			? filteredVisibleRestaurants
			: filteredVisibleRestaurants.filter((restau) =>
					(restau.all_tags ?? '')
						.split(',')
						.map((t) => t.trim())
						.includes(selectedTag)
			  )
	);

	function getMapRestaurantsForCurrentState() {
		if (selectedLocation) {
			return filterRestaurantsWithinRadius(restaurantTags, selectedLocation, radiusMeters);
		}

		if (!hasUserInteracted) {
			return [];
		}

		const filteredByTab =
			activeTab === 'ranked' ? rankedRestaurants : wantToTryRestaurants;

		const baseRestaurants =
			selectedTag === 'All'
				? filteredByTab
				: filteredByTab.filter((restaurant) =>
						(restaurant.all_tags ?? '')
							.split(',')
							.map((tag) => tag.trim())
							.includes(selectedTag)
			  );

		return baseRestaurants.slice(0, 9);
	}

	function refreshMapRestaurants() {
		emitMapEvent('map:restaurants', getMapRestaurantsForCurrentState());
	}

	$effect(() => {
		refreshMapRestaurants();
	});

	/** @param {'ranked' | 'want_to_try'} tab */
	function setRestaurantTab(tab) {
		activeTab = tab;
		hasUserInteracted = true;
		refreshMapRestaurants();
	}

	/** @param {'all' | string} tag */
	function setActiveTag(tag) {
		selectedTag = tag;
		hasUserInteracted = true;
		refreshMapRestaurants();
	}

	function resetToDefault() {
		addressInput = '';
		selectedLocation = null;
		activeTab = 'ranked';
		selectedTag = 'All';
		hasUserInteracted = false;
		emitMapEvent('map:location', null);
		emitMapEvent('map:restaurants', []);
	}

	function asideClose() {
		asideOpen = false;
	}

	function emitMapEvent(eventName, detail) {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent(eventName, { detail }));
		}
	}

	/** @param {Event & { currentTarget: HTMLFormElement }} event */
	async function handleAddressSearch(event) {
		event.preventDefault();
		const query = addressInput.trim();

		if (!query) {
			return;
		}

		hasUserInteracted = true;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
				{
					headers: {
						Accept: 'application/json'
					}
				}
			);

			if (!response.ok) {
				throw new Error('Address lookup failed');
			}

			const results = await response.json();
			const match = results[0];

			if (!match) {
				emitMapEvent('map:restaurants', []);
				selectedLocation = null;
				return;
			}

			selectedLocation = {
				lat: Number(match.lat),
				lon: Number(match.lon),
				displayName: match.display_name
			};

			setRestaurantTab(activeTab);
			emitMapEvent('map:location', selectedLocation);
			refreshMapRestaurants();
		} catch (error) {
			console.error('Unable to resolve the address:', error);
		}
	}
</script>

{#if asideOpen}
	<aside>
		<div>
			<div>
				<h2>Tastemap.</h2>
				<button type="button" aria-label="Close sidebar" onclick={asideClose}>
					<img src={Croix} alt="" />
				</button>
			</div>
			<span>
				<p>
					{selectedLocation ? selectedLocation.displayName : 'London'} · {radiusMeters}m radius ·
					{data.all?.length ?? 0} places
				</p>
			</span>
			<h1>Your top tables</h1>
			<p>Ranked head-to-head, so your #3 really is better than your #4 — no five-star mush.</p>
			<div class="divMapPanel">
				<MapPanel
					click={() => setRestaurantTab('ranked')}
					text="Ranked"
					nombre={rankedRestaurants.length}
					isChoose={activeTab === 'ranked'}
				></MapPanel>
				<MapPanel
					click={() => setRestaurantTab('want_to_try')}
					text="Want to try"
					nombre={wantToTryRestaurants.length}
					isChoose={activeTab === 'want_to_try'}
				></MapPanel>
			</div>
			<div class="divAllBtn">
				{#each tagButtons as tag}
					<RestauRow
						onclick={() => setActiveTag(tag)}
						text={tag === 'all' ? 'All' : tag}
						isChoose={selectedTag === tag}
					/>
				{/each}
			</div>
			<div class="divAllRestau">
				{#each restaurantTags as r}
					<RestauSideBar
						numero={r.rank}
						titre={r.name}
						tagline={r.tagline}
						neighborhood={r.neighborhood}
						image={ImgBart}
						nivDePrix={r.price_tier}
						isTopPick={r.rank == 1}
						thumbTone="warm"
					/>
				{/each}
			</div>
		</div>
		<p class="pBottom">Tap any table to inspect notes, dishes & coordinates.</p>
	</aside>
{/if}

<form onsubmit={handleAddressSearch}>
	<label>
		<img src={Loupe} alt="loupe" />
		<input bind:value={addressInput} type="text" placeholder="Redchurch St, Shoreditch, London" />
	</label>
	<div class="divRadius">
		<p>{radiusMeters}m radius</p>
		<button type="button" aria-label="Reset to default" onclick={resetToDefault}>
			<img src={Reload} alt="reload" />
		</button>
	</div>
</form>

<style>
	aside {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 1;
		height: 100vh;
		width: 22vw;
		padding: 24px;
		background: #fafaf7;
		border-right: 1px solid #e4e5de;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
	}

	aside > div {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	aside > div > div {
		display: flex;
		justify-content: space-between;
	}

	.pBottom {
		font-weight: 400;
		font-style: Regular;
		font-size: 12px;
		text-align: center;
		background-color: #f6f6f2;
		border-top: 1px solid #e4e5de;
	}

	aside button {
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	aside img {
		width: 20px;
		height: 20px;
	}

	aside span {
		display: block;
		margin-top: 32px;
	}

	aside h1 {
		margin-top: 24px;
	}

	aside h1 + p {
		margin-top: 8px;
	}

	aside p {
		color: #5e625b;
	}

	.divMapPanel {
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 1rem;
	}

	.divAllBtn {
		display: flex;
		align-items: center;
		gap: 6px;
		border-width: 1px 0;
		border-style: solid;
		border-color: #edede8;
		padding: 14px 0;
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		scrollbar-width: none;
	}

	.divAllRestau {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		align-items: stretch;
		padding: 4px 0;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
		gap: 4px;
	}

	form {
		position: absolute;
		top: 12px;
		left: 45%;
		display: flex;
		align-items: center;
		padding: 10px 16px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(20, 20, 20, 0.06);
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		min-width: 0;
	}

	label img {
		width: 16px;
		height: 16px;
		opacity: 0.75;
	}

	input {
		border: none;
		outline: none;
		background: transparent;
		font-size: 0.9rem;
		color: #1d1d1d;
		min-width: 0;
		width: min(18rem, 42vw);
	}

	input::placeholder {
		color: rgba(23, 23, 23, 0.75);
	}

	form p {
		margin: 0;
		font-weight: 600;
		font-size: 0.7rem;
		color: #373a36;
		white-space: nowrap;
	}

	.divRadius {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding-left: 0.75rem;
		border-left: 1px solid rgba(31, 31, 31, 0.08);
	}

	button {
		border: none;
		background: transparent;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	button img {
		width: 15px;
		height: 15px;
		opacity: 0.8;
	}
</style>
