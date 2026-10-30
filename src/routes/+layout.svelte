<script>
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import 'leaflet/dist/leaflet.css';
	import '#lib/style.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	/** @type {HTMLDivElement | null} */
	let mapContainer = null;
	/** @type {import('leaflet').Map | null} */
	let map = null;
	/** @type {import('leaflet').Marker | null} */
	let selectedLocationMarker = null;
	/** @type {Array<import('leaflet').Marker>} */
	let restaurantMarkers = [];
	/** @type {import('leaflet').Circle | null} */
	let searchRadiusCircle = null;

	onMount(() => {
		if (!mapContainer) return undefined;

		let isCancelled = false;

		(async () => {
			const leaflet = await import('leaflet');
			const L = leaflet.default;

			if (isCancelled || !mapContainer) return;

			map = L.map(mapContainer).setView([51.505, -0.09], 13);

			selectedLocationMarker = L.marker([51.505, -0.09], {
				icon: L.divIcon({
					className: 'search-location-pin',
					html: '<span></span>',
					iconSize: [18, 18],
					iconAnchor: [9, 9]
				})
			}).addTo(map);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors'
			}).addTo(map);

			const syncSelectedLocation = (/** @type {Event} */ event) => {
				if (!map) return;

				const customEvent = /** @type {CustomEvent<{ lat: number, lon: number } | null>} */ (event);
				const location = customEvent.detail;
				if (!location) {
					if (selectedLocationMarker) {
						selectedLocationMarker.remove();
						selectedLocationMarker = null;
					}
					if (searchRadiusCircle) {
						searchRadiusCircle.remove();
						searchRadiusCircle = null;
					}
					map.setView([51.505, -0.09], 13);
					return;
				}

				const point = [Number(location.lat), Number(location.lon)];

				if (selectedLocationMarker) {
					selectedLocationMarker.remove();
				}
				if (searchRadiusCircle) {
					searchRadiusCircle.remove();
					searchRadiusCircle = null;
				}

				selectedLocationMarker = L.marker(point, {
					icon: L.divIcon({
						className: 'search-location-pin',
						html: '<span></span>',
						iconSize: [18, 18],
						iconAnchor: [9, 9]
					})
				}).addTo(map);

				searchRadiusCircle = L.circle(point, {
					radius: 500,
					color: '#1d4ed8',
					weight: 2,
					fillColor: '#93c5fd',
					fillOpacity: 0.18
				}).addTo(map);

				map.setView(point, 15);
			};

			const syncRestaurantMarkers = (/** @type {Event} */ event) => {
				if (!map) return;

				for (const marker of restaurantMarkers) {
					marker.remove();
				}

				restaurantMarkers = [];

				const customEvent =
					/** @type {CustomEvent<Array<{ latitude: number, longitude: number, rank?: number, name?: string, tagline?: string, neighborhood?: string }>>} */ (
						event
					);
				const restaurants = customEvent.detail ?? [];
				restaurantMarkers = restaurants.map((restaurant, index) => {
					const rank = restaurant.rank ?? 1;
					const offsetLat = index * 0.0012;
					const marker = L.marker([restaurant.latitude + offsetLat, restaurant.longitude], {
						icon: L.divIcon({
							className: 'restaurant-pin',
							html: `<span>${rank}</span>`,
							iconSize: [30, 30],
							iconAnchor: [15, 30]
						})
					}).addTo(map);

					const popupContent = [
						`<strong>${restaurant.name ?? 'Restaurant'}</strong>`,
						restaurant.tagline ? `<div>${restaurant.tagline}</div>` : '',
						restaurant.neighborhood ? `<div>${restaurant.neighborhood}</div>` : ''
					]
						.filter(Boolean)
						.join('');

					marker.bindPopup(popupContent);
					return marker;
				});
			};

			window.addEventListener('map:location', syncSelectedLocation);
			window.addEventListener('map:restaurants', syncRestaurantMarkers);

			window.dispatchEvent(new CustomEvent('map:restaurants', { detail: [] }));
		})();

		return () => {
			isCancelled = true;
			if (selectedLocationMarker) {
				selectedLocationMarker.remove();
				selectedLocationMarker = null;
			}
			if (searchRadiusCircle) {
				searchRadiusCircle.remove();
				searchRadiusCircle = null;
			}
			for (const marker of restaurantMarkers) {
				marker.remove();
			}
			restaurantMarkers = [];
			if (map) {
				map.remove();
				map = null;
			}
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<div bind:this={mapContainer} class="map"></div>
	{@render children()}
</div>

<style>
	:global(body) {
		margin: 0;
		height: 100vh;
		font-family: sans-serif;
	}

	:global(.search-location-pin) {
		background: #1d4ed8;
		border-radius: 50%;
		border: 3px solid #fff;
		box-shadow: 0 8px 20px rgba(29, 78, 216, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font: bold 12px sans-serif;
	}

	:global(.search-location-pin span) {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #fff;
	}

	:global(.restaurant-pin) {
		background: #2d5a3d;
		border-radius: 50% 50% 50% 0;
		box-shadow: 0 0 0 5px rgba(222, 205, 170, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-45deg);
		color: #fff;
		font: bold 12px sans-serif;
	}

	:global(.restaurant-pin span) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transform: rotate(45deg);
	}

	.app-shell {
		position: relative;
		height: 100vh;
		width: 100%;
	}

	.map {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
	}
</style>
