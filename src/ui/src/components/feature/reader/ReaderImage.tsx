import React, { useState, useEffect, useRef } from 'react';

interface ReaderImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
    page?: number;
}

/**
 * ReaderImage - A component that hides the real image SRC in the static HTML 
 * to prevent simple bots from crawling the content, while providing lazy-loading
 * for human users.
 */
export const ReaderImage: React.FC<ReaderImageProps> = ({
    src,
    alt,
    className = "w-full h-auto block",
    aspectRatio,
    page
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '400px' } // Load early before scrolling into view
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={imgRef}
            className="w-full relative bg-zinc-900 overflow-hidden"
            style={{
                aspectRatio: aspectRatio || 'auto',
                contentVisibility: 'auto'
            }}
            data-page={page}
        >
            {isVisible ? (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                // Placeholder or empty div to keep the space
                <div className="w-full h-full animate-pulse bg-zinc-800" />
            )}

            {!isLoaded && isVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="absolute bottom-2 right-4 text-[10px] text-zinc-700 font-bold uppercase tracking-widest pointer-events-none">
                Page {page}
            </div>
        </div>
    );
};
