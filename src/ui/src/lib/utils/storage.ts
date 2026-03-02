const MAX_ITEMS = 500;

export interface StorageItem {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    updatedAt: number;
    chapterId?: string;
    chapterNumber?: string;
}

export const KEYS = {
    HISTORY: 'commics_history',
    BOOKMARKS: 'commics_bookmarks',
};

function getItems(key: string): StorageItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error(`Error reading from localStorage key "${key}":`, e);
        return [];
    }
}

function saveItems(key: string, items: StorageItem[]) {
    if (typeof window === 'undefined') return;
    try {
        // Eviction Strategy: Pop oldest items if limit exceeded
        const sliced = items.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_ITEMS);
        localStorage.setItem(key, JSON.stringify(sliced));
    } catch (e) {
        console.error(`Error saving to localStorage key "${key}":`, e);
    }
}

export const storage = {
    getHistory: () => getItems(KEYS.HISTORY),
    getBookmarks: () => getItems(KEYS.BOOKMARKS),

    addHistory: (item: Omit<StorageItem, 'updatedAt'>) => {
        const items = getItems(KEYS.HISTORY);
        const filtered = items.filter(i => i.slug !== item.slug);
        saveItems(KEYS.HISTORY, [{ ...item, updatedAt: Date.now() }, ...filtered]);
    },

    toggleBookmark: (item: Omit<StorageItem, 'updatedAt'>) => {
        const items = getItems(KEYS.BOOKMARKS);
        const exists = items.find(i => i.slug === item.slug);
        if (exists) {
            saveItems(KEYS.BOOKMARKS, items.filter(i => i.slug !== item.slug));
            return false; // Removed
        } else {
            saveItems(KEYS.BOOKMARKS, [{ ...item, updatedAt: Date.now() }, ...items]);
            return true; // Added
        }
    },

    isBookmarked: (slug: string) => {
        return getItems(KEYS.BOOKMARKS).some(i => i.slug === slug);
    }
};
