import React from 'react';
import { useState } from 'react';

const Tooltip = ({ text, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="tooltip-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {isHovered && (
                <div className="tooltip-content">
                    <p>{text}</p>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
