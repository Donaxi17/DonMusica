/**
 * Utility functions for creating URL-friendly slugs from artist names
 */

/**
 * Converts a string to a URL-friendly slug
 * Examples:
 * - "Paulo Londra" -> "paulo-londra"
 * - "Karol G" -> "karol-g"
 * - "El Ñejo" -> "el-nejo"
 * - "Ozúna" -> "ozuna"
 */
export function slugify(text: string): string {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .trim()
        // Remove accents/diacritics
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove special characters except hyphens
        .replace(/[^\w\-]+/g, '')
        // Replace multiple hyphens with single hyphen
        .replace(/\-\-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Checks if a route parameter is a Firebase ID or a slug
 * Firebase IDs are typically 20+ alphanumeric characters
 */
export function isFirebaseId(param: string): boolean {
    if (!param) return false;
    // Firebase IDs are usually 20+ chars and contain mixed case
    return param.length >= 15 && /[A-Z]/.test(param) && /[a-z]/.test(param);
}

/**
 * Creates a combined slug-id format for maximum SEO while maintaining ID integrity
 * Example: "paulo-londra-ZTjZneqZhzC3s16Ae5xY"
 */
export function createSlugWithId(name: string, id: string): string {
    const slug = slugify(name);
    return `${slug}-${id}`;
}

/**
 * Extracts the ID from a combined slug-id string
 * Example: "paulo-londra-ZTjZneqZhzC3s16Ae5xY" -> "ZTjZneqZhzC3s16Ae5xY"
 */
export function extractIdFromSlug(slugWithId: string): string | null {
    if (!slugWithId) return null;

    // If it's already a Firebase ID, return it
    if (isFirebaseId(slugWithId)) {
        return slugWithId;
    }

    // Try to extract ID from the end (after last hyphen with 15+ chars)
    const parts = slugWithId.split('-');
    const lastPart = parts[parts.length - 1];

    if (lastPart && isFirebaseId(lastPart)) {
        return lastPart;
    }

    return null;
}
