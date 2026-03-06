import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/utils/storage';
import type { ComicView } from '../../lib/api/commics/adapters/comic';

interface Props {
    comic: ComicView;
}

export const BookmarkButton: React.FC<Props> = ({ comic }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        setIsBookmarked(storage.isBookmarked(comic.slug));
    }, [comic.slug]);

    const toggle = () => {
        const next = storage.toggleBookmark({
            id: comic.id,
            slug: comic.slug,
            title: comic.title,
            coverImage: comic.coverImage,
        });
        setIsBookmarked(next);
    };

    return (
        <button
            onClick={toggle}
            className={`px-4 py-3 rounded-lg font-black transition-all uppercase text-sm flex items-center gap-2 ${isBookmarked
                    ? 'bg-yellow-600 text-white'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
        >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            {isBookmarked ? 'Đã theo dõi' : 'Theo dõi'}
        </button>
    );
};
