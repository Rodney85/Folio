/**
 * Car Database Service
 * Integrates with CarQueryAPI for international vehicle data
 * Provides caching and fallback for custom entries
 */

// API Base URL
const CAR_API_BASE = 'https://www.carqueryapi.com/api/0.3/';

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Types
export interface CarMake {
    make_id: string;
    make_display: string;
    make_country?: string;
}

export interface CarModel {
    model_name: string;
    model_make_id: string;
}

export interface CarTrim {
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_engine_cc?: string;
    model_engine_cyl?: string;
    model_engine_type?: string;
    model_engine_fuel?: string;
    model_transmission_type?: string;
    model_drive?: string;
    model_body?: string;
    model_doors?: string;
    model_weight_kg?: string;
    model_power_ps?: string;
    model_torque_nm?: string;
}

// Cache structure
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class CarDatabaseCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if cache is expired
        if (Date.now() - entry.timestamp > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    clear(): void {
        this.cache.clear();
    }
}

const cache = new CarDatabaseCache();

/**
 * Fetch from CarQueryAPI with error handling
 */
async function fetchCarAPI<T>(params: Record<string, string>): Promise<T | null> {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${CAR_API_BASE}?${queryString}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`CarQueryAPI error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error('CarQueryAPI fetch error:', error);
        return null;
    }
}

/**
 * Get available years (1941 - current year + 1)
 */
export async function getYears(): Promise<string[]> {
    const cacheKey = 'years';
    const cached = cache.get<string[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetchCarAPI<{ Years: string[] }>({ cmd: 'getYears' });
        if (response && response.Years) {
            cache.set(cacheKey, response.Years);
            return response.Years;
        }
    } catch (error) {
        console.error('Error fetching years:', error);
    }

    // Fallback: generate years manually
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let year = currentYear + 1; year >= 1941; year--) {
        years.push(year.toString());
    }
    return years;
}

/**
 * Get car makes, optionally filtered by year
 */
export async function getMakes(year?: string): Promise<CarMake[]> {
    const cacheKey = `makes_${year || 'all'}`;
    const cached = cache.get<CarMake[]>(cacheKey);
    if (cached) return cached;

    try {
        const params: Record<string, string> = { cmd: 'getMakes' };
        if (year) params.year = year;

        const response = await fetchCarAPI<{ Makes: CarMake[] }>(params);
        if (response && response.Makes) {
            cache.set(cacheKey, response.Makes);
            return response.Makes;
        }
    } catch (error) {
        console.error('Error fetching makes:', error);
    }

    return [];
}

/**
 * Get models for a specific make, optionally filtered by year
 */
export async function getModels(makeId: string, year?: string): Promise<CarModel[]> {
    const cacheKey = `models_${makeId}_${year || 'all'}`;
    const cached = cache.get<CarModel[]>(cacheKey);
    if (cached) return cached;

    try {
        const params: Record<string, string> = {
            cmd: 'getModels',
            make: makeId
        };
        if (year) params.year = year;

        const response = await fetchCarAPI<{ Models: CarModel[] }>(params);
        if (response && response.Models) {
            cache.set(cacheKey, response.Models);
            return response.Models;
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }

    return [];
}

/**
 * Get trim/spec details for a specific make, model, and year
 */
export async function getTrims(makeId: string, model: string, year: string): Promise<CarTrim[]> {
    const cacheKey = `trims_${makeId}_${model}_${year}`;
    const cached = cache.get<CarTrim[]>(cacheKey);
    if (cached) return cached;

    try {
        const params: Record<string, string> = {
            cmd: 'getTrims',
            make: makeId,
            model: model,
            year: year
        };

        const response = await fetchCarAPI<{ Trims: CarTrim[] }>(params);
        if (response && response.Trims) {
            cache.set(cacheKey, response.Trims);
            return response.Trims;
        }
    } catch (error) {
        console.error('Error fetching trims:', error);
    }

    return [];
}

/**
 * Search makes by name (for autocomplete)
 */
export async function searchMakes(query: string, year?: string): Promise<CarMake[]> {
    const makes = await getMakes(year);
    const lowerQuery = query.toLowerCase();

    return makes.filter(make =>
        make.make_display.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Search models by name (for autocomplete)
 */
export async function searchModels(makeId: string, query: string, year?: string): Promise<CarModel[]> {
    const models = await getModels(makeId, year);
    const lowerQuery = query.toLowerCase();

    return models.filter(model =>
        model.model_name.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Convert trim data to simplified engine format
 */
export function formatEngine(trim: CarTrim): string {
    const parts: string[] = [];

    if (trim.model_engine_cc) {
        const liters = (parseInt(trim.model_engine_cc) / 1000).toFixed(1);
        parts.push(`${liters}L`);
    }

    if (trim.model_engine_type) {
        parts.push(trim.model_engine_type);
    }

    if (trim.model_engine_cyl) {
        parts.push(`${trim.model_engine_cyl}-cyl`);
    }

    return parts.join(' ') || 'Unknown';
}

/**
 * Convert power from PS to HP
 */
export function formatHorsepower(trim: CarTrim): string {
    if (!trim.model_power_ps) return '';

    const ps = parseInt(trim.model_power_ps);
    const hp = Math.round(ps * 0.9863); // PS to HP conversion
    return `${hp} HP`;
}

/**
 * Convert torque from Nm to lb-ft
 */
export function formatTorque(trim: CarTrim): string {
    if (!trim.model_torque_nm) return '';

    const nm = parseInt(trim.model_torque_nm);
    const lbft = Math.round(nm * 0.7376); // Nm to lb-ft conversion
    return `${lbft} lb-ft`;
}

/**
 * Format transmission type
 */
export function formatTransmission(trim: CarTrim): string {
    return trim.model_transmission_type || '';
}

/**
 * Format drivetrain
 */
export function formatDrivetrain(trim: CarTrim): string {
    const drive = trim.model_drive || '';

    // Map CarQueryAPI drive types to our format
    const driveMap: Record<string, string> = {
        'Front': 'FWD',
        'Rear': 'RWD',
        'AWD': 'AWD',
        '4WD': '4WD'
    };

    return driveMap[drive] || drive;
}

/**
 * Format body style
 */
export function formatBodyStyle(trim: CarTrim): string {
    return trim.model_body || '';
}

/**
 * Clear all cache
 */
export function clearCache(): void {
    cache.clear();
}

/**
 * Get popular makes (most common brands)
 */
export const POPULAR_MAKES = [
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Nissan',
    'Volkswagen',
    'Porsche',
    'Ferrari',
    'Lamborghini',
    'McLaren',
    'Tesla'
];

/**
 * Sort makes with popular brands first
 */
export function sortMakesWithPopularFirst(makes: CarMake[]): CarMake[] {
    const popular: CarMake[] = [];
    const others: CarMake[] = [];

    makes.forEach(make => {
        if (POPULAR_MAKES.includes(make.make_display)) {
            popular.push(make);
        } else {
            others.push(make);
        }
    });

    // Sort popular by the order in POPULAR_MAKES
    popular.sort((a, b) => {
        const aIndex = POPULAR_MAKES.indexOf(a.make_display);
        const bIndex = POPULAR_MAKES.indexOf(b.make_display);
        return aIndex - bIndex;
    });

    // Sort others alphabetically
    others.sort((a, b) => a.make_display.localeCompare(b.make_display));

    return [...popular, ...others];
}
