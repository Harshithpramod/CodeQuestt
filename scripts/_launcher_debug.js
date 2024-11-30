$(document).ready(function() {
    try {
        // Get level from URL parameter, default to null if not found
        var startLevel = getParameterByName('lvl') ? parseInt(getParameterByName('lvl')) : null;

        console.log("Starting game initialization...");
        console.log("Start level:", startLevel);

        // Ensure the Game class exists
        if (typeof Game !== 'function') {
            throw new Error("Game class is not defined. Ensure the script defining it is included.");
        }

        // Initialize the game
        window.game = new Game(true, startLevel);

        // Ensure the _initialize method exists and runs
        if (typeof window.game._initialize !== 'function') {
            throw new Error("_initialize method is not defined in Game class.");
        }

        window.game._initialize();

        // Placeholder for game evaluation
        window.eval = {};

        console.log("Game initialized successfully.");
    } catch (error) {
        console.error("Error during game initialization:", error.message);
    }
});

// Function to get URL parameters
function getParameterByName(name, url = window.location.href) {
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
