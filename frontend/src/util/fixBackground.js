// Function to change background size "cover" to
// either "100vw auto" (100 percent of viewport
// width and automatic height)
// or "auto 100vh" (automatic width and 100
// percent of viewport height).
const bgImageRatio = 2704 / 1521;

function fixBackgroundSizeCover() {
    const windowSizeRatio = window.innerWidth / window.innerHeight;
  
    if (bgImageRatio > windowSizeRatio) {
      document.body.style.backgroundSize = 'auto 100vh';
    } else {
      document.body.style.backgroundSize = '100vw auto';
    }
};

// Execute the fix function once upon load
fixBackgroundSizeCover();
  
// Execute the fix function everytime on window resize
window.addEventListener('resize', fixBackgroundSizeCover);