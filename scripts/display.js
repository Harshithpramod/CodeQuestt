ROT.Display.create = function(game, opts) {
    opts.fontFamily = '"droid sans mono", Courier, "Courier New", monospace';
    const display = new ROT.Display(opts);
    display.game = game;
    return display;
};

ROT.Display.prototype.errors = [];

ROT.Display.prototype.setupEventHandlers = function() {
    const display = this;
    const game = this.game;

    const keys = {
        37: 'left', 38: 'up', 39: 'right', 40: 'down', // Arrow keys
        65: 'left', 68: 'right', 72: 'left', 74: 'down', 75: 'up', 76: 'right', // WASD/HJKL
        81: 'funcPhone', 82: 'rest', 83: 'down', 87: 'up', // Q/R/S/W
        98: 'down', 100: 'left', 101: 'rest', 102: 'right', 104: 'up' // Numpad
    };

    const container = this.getContainer();
    if (!container) throw new Error("Display container not found!");

    // Add `contentEditable` for key events
    container.setAttribute("contentEditable", "true");

    container.addEventListener("keydown", function(e) {
        if (display._intro) {
            game._start();
            display._intro = false;
        } else if (keys[e.keyCode] && game.map.getPlayer()) {
            game.map.getPlayer().move(keys[e.keyCode], true);
        }
        e.preventDefault();
    });

    container.addEventListener("click", function() {
        container.classList.add('focus');
        document.querySelector('.CodeMirror').classList.remove('focus');

        document.getElementById('helpPane').style.display = 'none';
        document.getElementById('menuPane').style.display = 'none';
    });
};

// Example adjustment for `drawObject`
ROT.Display.prototype.drawObject = function(map, x, y, object) {
    if (!object) return;
    const type = object.type || 'empty';
    const definition = map._getObjectDefinition(type) || this.savedDefinitions?.[type] || {};
    const symbol = definition.symbol || '?';
    const color = object.color || definition.color || "#fff";
    const bgColor = object.bgColor || "#000";

    this.draw(x, y, symbol, color, bgColor);
};

// Safeguard against undefined grid or player
ROT.Display.prototype.drawAll = function(map) {
    const game = this.game;
    const width = game._dimensions.width;
    const height = game._dimensions.height;

    const grid = Array.from({ length: width }, () =>
        Array.from({ length: height }, () => ({ type: 'empty', bgColor: 'black' }))
    );

    const staticObjects = map._getGrid();
    if (!staticObjects) throw new Error("Static objects grid is undefined!");

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            grid[x][y] = { type: staticObjects[x][y]?.type, bgColor: staticObjects[x][y]?.bgColor || 'black' };
        }
    }

    const dynamicObjects = map.getDynamicObjects();
    if (Array.isArray(dynamicObjects)) {
        for (const obj of dynamicObjects) {
            grid[obj.getX()]?.[obj.getY()] = {
                type: obj.getType(),
                bgColor: map._getGrid()?.[obj.getX()]?.[obj.getY()]?.bgColor || 'black'
            };
        }
    }

    const player = map.getPlayer();
    if (player) {
        grid[player.getX()]?.[player.getY()] = {
            type: 'player',
            color: player.getColor(),
            bgColor: map._getGrid()?.[player.getX()]?.[player.getY()]?.bgColor || 'black'
        };
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            this.drawObject(map, x, y, grid[x][y]);
        }
    }

    // Render errors, if any
    if (Array.isArray(this.errors) && this.errors.length > 0) {
        this.errors.forEach((err, idx) => {
            const y = game._dimensions.height - this.errors.length + idx;
            this.drawText(0, y, err);
        });
    }

    this.grid = grid; // Save grid
};
