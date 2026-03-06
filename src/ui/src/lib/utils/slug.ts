export function slugify(text: string): string {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Separate accents from characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '-')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
