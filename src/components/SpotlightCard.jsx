import { useRef } from "react";
import "./SpotlightCard.css";

function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(110, 180, 120, 0.18)",
}) {
    const cardRef = useRef(null);

    function handleMouseMove(event) {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }

    return (
        <div
            ref={cardRef}
            className={`card-spotlight ${className}`}
            onMouseMove={handleMouseMove}
            style={{ "--spotlight-color": spotlightColor }}
        >
            {children}
        </div>
    );
}

export default SpotlightCard;