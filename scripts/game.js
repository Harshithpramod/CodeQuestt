function Game(debugMode, startLevel) {
    /* Private properties */
    let __currentCode = '';
    let __commands = [];
    let __playerCodeRunning = false;

    /* Public properties */
    this._dimensions = { width: 50, height: 25 };
    this._levelFileNames = []; // Placeholder for level file names
    this._bonusLevels = []; // Placeholder for bonus levels
    this._mod = ''; // Placeholder for mod identifier
    this._viewableScripts = [
        'codeEditor.js', 'display.js', 'dynamicObject.js', 'game.js', 'inventory.js',
        'map.js', 'objects.js', 'player.js', 'reference.js', 'sound.js', 'ui.js',
        'util.js', 'validate.js'
    ];
    this._editableScripts = ['map.js', 'objects.js', 'player.js'];
    this._resetTimeout = null;
    this._currentLevel = 0;
    this._currentFile = null;
    this._currentBonusLevel = null;
    this._levelReached = 1;
    this._displayedChapters = [];
    this._playerPrototype = Player;
    this._nextBonusLevel = null;

    /* Private getters */
    const getLocalKey = (key) => (this._mod ? `${this._mod}.` : '') + key;

    /* Initialization */
    this._initialize = function () {
        try {
            // Get the last level reached from localStorage
            this._levelReached = parseInt(localStorage.getItem(getLocalKey('levelReached'))) || 1;

            // Fix corrupted levelReached values
            if (this._levelReached > this._levelFileNames.length) {
                for (let l = 1; l <= this._levelFileNames.length; l++) {
                    if (!localStorage[getLocalKey(`level${l}.lastGoodState`)]) {
                        this._levelReached = l - 1;
                        break;
                    }
                }
            }

            // Initialize essential components
            this.sound = new Sound(debugMode ? 'local' : 'cloudfront');
            this.display = ROT.Display.create(this, {
                width: this._dimensions.width,
                height: this._dimensions.height,
                fontSize: 20
            });
            this.display.setupEventHandlers();
            $('#screen').append(this.display.getContainer());
            this.editor = new CodeEditor('editor', 600, 500, this);
            this.map = new Map(this.display, this);
            this.objects = this.getListOfObjects();

            // Enable controls
            this.enableShortcutKeys();
            this.enableButtons();
            this.setUpNotepad();

            // Load help commands from localStorage
            if (localStorage.getItem(getLocalKey('helpCommands'))) {
                __commands = localStorage.getItem(getLocalKey('helpCommands')).split(';');
            }

            // Debug mode adjustments
            if (debugMode) {
                this._debugMode = true;
                this._levelReached = 999;
                __commands = Object.keys(this.reference);
                this.sound.toggleSound(); // Mute sound by default in debug mode
            }

            // Start the game
            if (startLevel) {
                this._currentLevel = startLevel - 1;
                this._getLevel(startLevel, debugMode);
            } else if (!debugMode && this._levelReached !== 1) {
                this._getLevel(Math.min(this._levelReached, 21));
            } else {
                this._intro();
            }
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    };

    /* Level management */
    this._getLevel = function (levelNum, isResetting = false, movingToNextLevel = false) {
        try {
            if (levelNum > this._levelFileNames.length) return;

            // Update progress
            this._levelReached = Math.max(levelNum, this._levelReached);
            if (!debugMode) {
                localStorage.setItem(getLocalKey('levelReached'), this._levelReached);
            }

            // Load level code
            const fileName = this._levelFileNames[levelNum - 1];
            const levelCode = this._levels[`levels/${fileName}`];

            // Save editor state and move to the next level if needed
            if (movingToNextLevel) {
                this.editor.saveGoodState();
                this.editor.createGist();
            }

            this._currentLevel = levelNum;
            this._currentBonusLevel = null;
            this._currentFile = null;
            this.editor.loadCode(levelCode);

            // Start level
            this._evalLevelCode();
        } catch (error) {
            console.error('Error loading level:', error);
        }
    };

    this._evalLevelCode = function (allCode = null, playerCode = null) {
        try {
            if (!allCode) {
                allCode = this.editor.getCode();
                playerCode = this.editor.getPlayerCode();
            }

            // Validate and execute level code
            const validatedStartLevel = this.validate(allCode, playerCode);
            if (validatedStartLevel) {
                this.map._reset();
                this.map = new Map(this.display, this);
                validatedStartLevel(this.map);

                this.display.fadeIn(this.map, 100, () => {
                    this.map.refresh();
                });

                this.map._ready();
            } else {
                console.error('Level code validation failed');
            }
        } catch (error) {
            console.error('Error evaluating level code:', error);
        }
    };

    /* Initialization call */
    this._initialize();
}
