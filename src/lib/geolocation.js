/**
 * @typedef {{ lat: number, lon: number }} GeoPoint
 * @typedef {{
 *   name?: string,
 *   rank?: number,
 *   tagline?: string,
 *   neighborhood?: string,
 *   price_tier?: number,
 *   latitude?: number,
 *   longitude?: number,
 *   lat?: number,
 *   lng?: number,
 *   lon?: number
 * }} RestaurantLike
 */

/**
 * @param {GeoPoint} from
 * @param {GeoPoint} to
 * @returns {number}
 */
export function haversineDistanceMeters(from, to) {
	const lat1 = Number(from.lat);
	const lon1 = Number(from.lon);
	const lat2 = Number(to.lat);
	const lon2 = Number(to.lon);

	if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
		return Number.POSITIVE_INFINITY;
	}

	const toRadians = /** @param {number} value */ (value) => (value * Math.PI) / 180;
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

	return 2 * 6371000 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @param {RestaurantLike[]} restaurants
 * @param {{ lat: number, lon: number }} center
 * @param {number} [maxDistanceMeters=500]
 * @returns {RestaurantLike[]}
 */
export function filterRestaurantsWithinRadius(restaurants, center, maxDistanceMeters = 500) {
	if (!Array.isArray(restaurants) || !center) {
		return [];
	}

	const centerLat = Number(center.lat);
	const centerLon = Number(center.lon);

	if (![centerLat, centerLon].every(Number.isFinite)) {
		return [];
	}

	return restaurants.filter((restaurant) => {
		const latitude = Number(restaurant.latitude ?? restaurant.lat);
		const longitude = Number(restaurant.longitude ?? restaurant.lng ?? restaurant.lon);

		if (![latitude, longitude].every(Number.isFinite)) {
			return false;
		}

		const distance = haversineDistanceMeters(
			{ lat: centerLat, lon: centerLon },
			{ lat: latitude, lon: longitude }
		);

		return distance <= maxDistanceMeters;
	});
}
