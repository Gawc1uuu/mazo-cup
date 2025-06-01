import React from 'react';

// Make sure your About.css is imported in a parent component or globally,
// or import it here if this component is used elsewhere and needs its styles.
// import './About.css'; // Or a more specific Tile.css if you prefer

const Tile = ({ title, value, iconSrc, layoutType, iconAlt }: any) => {
    const altText = iconAlt || title || 'icon'; // Provide a fallback for alt text

    return (
        <div className="about-tile" data-layout={layoutType}>
            <div className="tile-header">
                {(layoutType === 'right' || layoutType === 'left') && iconSrc && (
                    <img src={iconSrc} alt={altText} />
                )}
                <p>{title}</p>
            </div>

            {layoutType === 'middle' && iconSrc && (
                <div className="tile-icon-area">
                    <img src={iconSrc} alt={altText} />
                </div>
            )}

            <div className="tile-content">
                <p>{value}</p>
            </div>
        </div>
    );
};

export default Tile;