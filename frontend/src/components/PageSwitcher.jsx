import "./PageSwitcher.css";

function PageSwitcher({currentPage, setCurrentPage, numberOfPages, scrollOnSwitchRef = null}) {
    if (!numberOfPages) return;

    const pageSwitchHandler = (switchTo) => {
        if (switchTo == currentPage || switchTo < 1 || switchTo > numberOfPages) return;

        setCurrentPage(switchTo);

        if (scrollOnSwitchRef) {
            setTimeout(() => {
                scrollOnSwitchRef.current.scrollIntoView({behavior: "smooth"});
            }, 250);
        }
    }

    const desiredNumberOfButtons = 5;
    let leftOffset = desiredNumberOfButtons/2, rightOffset = desiredNumberOfButtons/2;

    if (desiredNumberOfButtons % 2 == 1) { //odd
        leftOffset = Math.floor(leftOffset);
        rightOffset = Math.floor(rightOffset);
    }
    else {
        leftOffset -= 1;
    }


    let smallestPageVisible = Math.max(1, currentPage - leftOffset);
    let biggestPageVisible = Math.min(numberOfPages, currentPage + rightOffset);

    //try to reach the desired nr of buttons
    const numberOfVisibleButtons = biggestPageVisible - smallestPageVisible + 1;

    if (numberOfVisibleButtons < desiredNumberOfButtons) {
        const missingButtons = desiredNumberOfButtons - numberOfVisibleButtons;

        if (smallestPageVisible > 1) {
            smallestPageVisible = Math.max(1, smallestPageVisible - missingButtons);
        }
        else if (biggestPageVisible < numberOfPages) {
            biggestPageVisible = Math.min(numberOfPages, biggestPageVisible + missingButtons);
        }
    }


    let paginationButtons_left = [], paginationButtons_mid = [], paginationButtons_right = [];
    paginationButtons_left.push(<button key={"<<"} className="pagination-button" onClick={() => pageSwitchHandler(1)} disabled={currentPage === 1}>{"<<"}</button>);
    paginationButtons_left.push(<button key={"<"} className="pagination-button" onClick={() => pageSwitchHandler(currentPage-1)} disabled={currentPage === 1}>{"<"}</button>);

    for(let i = smallestPageVisible; i <= biggestPageVisible; i++) {
        const className = `pagination-button ${i === currentPage ? "active" : ""}`;
        paginationButtons_mid.push( <button key={i} className={className} onClick={() => pageSwitchHandler(i)} >{i}</button> );
    }

    paginationButtons_right.push(<button key={">"} className="pagination-button" onClick={() => pageSwitchHandler(currentPage+1)} disabled={currentPage === numberOfPages}>{">"}</button>);
    paginationButtons_right.push(<button key={">>"} className="pagination-button" onClick={() => pageSwitchHandler(numberOfPages)} disabled={currentPage === numberOfPages} >{">>"}</button>);

    return (
        <div className="pagination-container">
            <div className="prev">
                { paginationButtons_left }
            </div>
            <div className="pages">
                { paginationButtons_mid }
            </div>
            <div className="next">
                { paginationButtons_right }
            </div>
        </div>
    );
}

export default PageSwitcher;