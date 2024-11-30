$(document).ready(function() {
    try {
        // Ensure the Game class exists
        if (typeof Game !== 'function') {
            throw new Error("Game class is not defined. Ensure the script defining it is included.");
        }

        // Initialize the game
        const game = new Game();
        if (typeof game._initialize !== 'function') {
            throw new Error("_initialize method is not defined in the Game class.");
        }

        game._initialize();

        // Placeholder for custom eval logic
        window.eval = {};

        console.log("Game initialized successfully.");
    } catch (error) {
        console.error("Error during initialization:", error.message);
    }
});

// Prevent default behavior for Ctrl+R and F5
$(document).on('keydown', function(e) {
    // F5 or Ctrl+R
    if (e.which === 116 || (e.which === 82 && e.ctrlKey)) {
        console.log("Prevented refresh");
        e.preventDefault(); // Stop default browser behavior
        return false; // Block event propagation
    }
});
