import "./Tooltip.css";
import { FaRegQuestionCircle } from "react-icons/fa";
import { useRef } from "react";

function Tooltip({ message }) {
    let tooltip = useRef(null);

    const handleMouseEnter = (event) => {
        if (tooltip.current !== null) return;  //already exists

        tooltip.current = document.createElement("div");
        tooltip.current.textContent = message;
        tooltip.current.style.position = "fixed";
        
        let rect = event.target.getBoundingClientRect();

        tooltip.current.style.left = rect.right + 5 + "px";
        tooltip.current.style.top = rect.top + 5 + "px";

        tooltip.current.style.padding = "1rem";
        tooltip.current.style.backgroundColor = "black";
        tooltip.current.style.color = "white";

        tooltip.current.style.maxWidth = "15rem";

        document.body.append(tooltip.current);
    };

    const handleMouseLeave = () => {
        if (tooltip.current) {
            tooltip.current.remove();
            tooltip.current = null;
        }
    };

    return(
        <span className="tooltip" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <FaRegQuestionCircle style={{verticalAlign: "middle"}} />
        </span>
    )
}

export default Tooltip;