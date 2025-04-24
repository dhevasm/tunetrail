function loadMusicPlayer(musicData, resumeTime = 0, shouldPlay = false) {
    // Create or update single object to store all data
    let playerState = JSON.parse(localStorage.getItem("musicPlayerState") || "{}");
    
    // Update object with new data
    playerState.musicData = musicData;
    playerState.currentTime = resumeTime;
    playerState.isPlaying = shouldPlay;
    
    // Maintain other settings if they exist
    if (!playerState.hasOwnProperty("volume")) playerState.volume = 1;
    if (!playerState.hasOwnProperty("isLoop")) playerState.isLoop = false;
    
    // Save the object back to localStorage
    localStorage.setItem("musicPlayerState", JSON.stringify(playerState));

    // Remove existing player if present
    const existingPlayer = document.getElementById("musicPlayer");
    if (existingPlayer) existingPlayer.remove();

    // Create player container with ID for easier reference
    const playerContainer = document.createElement("div");
    playerContainer.id = "musicPlayer";
    
    const playerHTML = `
    <audio id="backgroundMusic" style="display:none;">
        <source src="src/music/${musicData.audio}" type="audio/mp3">
    </audio>
    
    <!-- Fullscreen overlay view -->
    <div id="fullscreenView" class="fullscreen-view">
        <img src="src/cover_image/${musicData.cover_img}" alt="Album Art" class="fullscreen-cover">
        <h2 class="fullscreen-title">${musicData.title}</h2>
        <a href="#" class="fullscreen-artist">${musicData.artist.name}</a>
        
        <div class="fullscreen-controls">
            <div class="fullscreen-progress">
                <span id="fsCurrentTime" class="time-display">0:00</span>
                <input type="range" id="fsProgressBar" min="0" max="100" value="0" class="progress-slider" oninput="seekAudio('fs')">
                <span id="fsDuration" class="time-display">0:00</span>
            </div>
            
            <div class="player-buttons fullscreen-buttons">
                <button onclick="toggleLoop()" class="player-btn">
                    <i id="fsLoopBtn" class="fas fa-redo"></i>
                </button>
                
                <button onclick="togglePlay()" class="player-btn play-button">
                    <span id="fsPlayIcon"><i class="fas fa-play-circle"></i></span>
                    <span id="fsPauseIcon" style="display:none"><i class="fas fa-pause-circle"></i></span>
                </button>
                
                <button onclick="toggleFavorite()" class="player-btn">
                    <i id="fsFavoriteBtn" class="far fa-heart"></i>
                </button>
            </div>
        </div>
        
        <button id="closeFullscreenBtn" class="close-fullscreen-btn">
            <i class="fas fa-times"></i>
        </button>
    </div>
    
    <!-- Regular player controls -->
    <div id="musicControls" class="music-controls">
        <div id="minimizedView" class="minimized-view" onclick="expandPlayer()">
            <div class="minimized-content">
                <div class="minimized-info">
                    <img src="src/cover_image/${musicData.cover_img}" alt="Album Art" class="minimized-cover">
                    <a href="#" class="minimized-text">${musicData.title} - ${musicData.artist.name}</a>
                </div>
                <button onclick="expandPlayer(event)" class="player-btn">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
        
        <div id="expandedView" class="expanded-view">
            <!-- Media info section -->
            <div class="media-info">
                <img id="albumArt" src="src/cover_image/${musicData.cover_img}" alt="Album Art" class="album-cover">
                <div class="track-info">
                    <span id="musicTitle" class="music-title">${musicData.title}</span>
                    <a href="#" id="musicArtist" class="music-artist">${musicData.artist.name}</a>
                </div>
                
                <div class="control-group">
                    <button id="addToPlaylistBtn" class="player-btn" type="button" data-bs-toggle="modal" data-bs-target="#addToPlaylistModal" onclick="document.querySelectorAll('.addPlaylistLink').forEach(el => {
                        let href = el.getAttribute('href');
                        let music_id_index = href.indexOf('music_id=');
                        if (music_id_index > -1) {
                            href = href.substring(0, music_id_index);
                        }
                        el.setAttribute('href', href + 'music_id=${musicData.id}');
                    });">
                        <i class="fas fa-plus"></i>
                    </button> 
                    <button id="loopBtn" onclick="toggleLoop()" class="player-btn">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button id="favoriteBtn" onclick="toggleFavorite()" class="player-btn">
                        <i class="far fa-heart"></i>
                    </button>
                    <button id="playPauseBtn" onclick="togglePlay()" class="player-btn play-pause-btn">
                        <span id="playIcon"><i class="fas fa-play"></i></span>
                        <span id="pauseIcon" style="display:none"><i class="fas fa-pause"></i></span>
                    </button>
                    <button onclick="setCurrentMusicToEnd()" class="player-btn">
                        <i class="fas fa-forward"></i>
                    </button>
                </div>
                
                <div class="player-buttons" id="player-right">
                    <div class="volume-control">
                        <i class="fas fa-volume-up"></i>
                        <input type="range" id="volumeControl" min="0" max="1" step="0.01" value="1" class="volume-slider" oninput="changeVolume()">
                    </div>
                    
                    <button id="fullscreenBtn" onclick="enterFullscreenMode()" class="player-btn">
                        <i class="fas fa-expand"></i>
                    </button>
                    
                    <button id="minimizeBtn" onclick="minimizePlayer()" class="player-btn">
                        <i class="fas fa-compress"></i>
                    </button>
                </div>
            </div>
            
            <!-- Progress bar section -->
            <div class="progress-section">
                <span id="currentTime" class="time-display">0:00</span>
                <input type="range" id="progressBar" min="0" max="100" value="0" class="progress-slider" oninput="seekAudio()">
                <span id="duration" class="time-display">0:00</span>
            </div>
        </div>
    </div>
    `;

    playerContainer.innerHTML = playerHTML;
    document.getElementById("music-player-container").appendChild(playerContainer);

    // Add responsive CSS
    const responsiveStyle = document.createElement("style");
    responsiveStyle.textContent = `
        /* Base styles for the music player */
        .music-controls {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(0, 0, 0, 0.95);
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
            z-index: 1000;
            border-top: 2px solid #333;
            transition: all 0.3s ease;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
        }

        .fullscreen-buttons .play-button {
            font-size: 36px;
            color: white; 
        }

        /* Expanded View Styles */
        .expanded-view {
            display: flex;
            width: 100%;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .media-info {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 12px;
            justify-content: space-between;
        }
        
        .album-cover {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            margin-right: 12px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            object-fit: cover;
        }
        
        .track-info {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
            margin-right: 10px;
        }
        
        .music-title {
            font-size: 16px;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #fff;
        }
        
        .music-artist {
            font-size: 12px;
            color: #ccc;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-decoration: none;
        }
        
        .control-group {
            display: flex;
            align-items: center;
            margin-right: 20px;
        }
        
        .player-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin: 0 6px;
            flex-shrink: 0;
            outline: none;
            padding: 5px;
            transition: all 0.2s ease;
        }
        
        .player-btn:active {
            transform: scale(0.95);
        }
        
        .play-pause-btn {
            font-size: 20px;
        }
        
        .player-buttons {
            display: flex;
            align-items: center;
            margin-left: auto;
        }
        
        .volume-control {
            display: flex;
            align-items: center;
            margin: 0 10px;
        }
        
        /* Progress Bar Styles */
        .progress-section {
            display: flex;
            align-items: center;
            width: 100%;
        }
        
        .time-display {
            font-size: 12px;
            margin: 0 5px;
            flex-shrink: 0;
            min-width: 32px;
            color: #bbb;
        }
        
        .progress-slider {
            flex-grow: 1;
            height: 5px;
            -webkit-appearance: none;
            border-radius: 5px;
            background: #444;
            outline: none;
            transition: background 0.2s;
        }
        
        .progress-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #1db954;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .progress-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #1db954;
            cursor: pointer;
        }
        
        .progress-slider:hover {
            background: #555;
        }
        
        .progress-slider:hover::-webkit-slider-thumb {
            transform: scale(1.2);
        }
        
        /* Volume slider */
        .volume-slider {
            width: 60px;
            height: 4px;
            -webkit-appearance: none;
            border-radius: 3px;
            background: #555;
            outline: none;
            margin-left: 5px;
        }
        
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #1db954;
            cursor: pointer;
        }
        
        .volume-slider::-moz-range-thumb {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #1db954;
            cursor: pointer;
        }
        
        /* Minimized View */
        .minimized-view {
            display: none;
            width: 100%;
            cursor: pointer;
        }
        
        .minimized-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }
        
        .minimized-info {
            display: flex;
            align-items: center;
            max-width: 85%;
            overflow: hidden;
        }
        
        .minimized-cover {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            margin-right: 10px;
            flex-shrink: 0;
            object-fit: cover;
        }
        
        .minimized-text {
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-decoration: none;
            color: white;
        }
        
        /* Fullscreen View */
        .fullscreen-view {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, #000, #111);
            z-index: 2000;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        
        .fullscreen-cover {
            max-width: 90%;
            max-height: 40%;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            object-fit: cover;
        }
        
        .fullscreen-title {
            color: white;
            font-size: clamp(18px, 5vw, 28px);
            margin-top: 20px;
            font-weight: bold;
        }
        
        .fullscreen-artist {
            color: #ccc;
            font-size: clamp(14px, 4vw, 18px);
            margin-top: 8px;
            text-decoration: none;
        }
        
        .fullscreen-controls {
            position: absolute;
            bottom: 50px;
            width: 90%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .fullscreen-progress {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 25px;
        }
        
        .fullscreen-buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
        }
        
        .fullscreen-buttons .player-btn {
            margin: 0 20px;
            font-size: 20px;
        }
        
        .fullscreen-buttons .play-button {
            font-size: 36px;
        }
        
        .close-fullscreen-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 24px;
            padding: 10px;
            z-index: 10;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .music-controls {
                padding: 12px;
            }
           
            #player-right{
                display: none;
            }

            .control-group {
                margin-left: auto;
                margin-right: 0;
            }
            
            .player-buttons {
                margin-top: 10px;
                width: 100%;
                justify-content: space-between;
            }
            
            .volume-control {
                display: none;
            }
            
            .album-cover {
                width: 42px;
                height: 42px;
            }
            
            .track-info {
                max-width: 40%;
            }
        }
        
        @media (max-width: 480px) {
            .media-info {
                margin-bottom: 8px;
            }
            
            .music-title {
                font-size: 14px;
            }
            
            .music-artist {
                font-size: 11px;
            }
            
            .album-cover {
                width: 36px;
                height: 36px;
                margin-right: 8px;
            }
            
            .player-btn {
                margin: 0 4px;
            }
            
            .track-info {
                max-width: 35%;
            }
            
            .fullscreen-buttons .player-btn {
                margin: 0 15px;
            }
        }
    `;
    document.head.appendChild(responsiveStyle);

    

    // Get all DOM elements after adding to document
    const audio = document.getElementById("backgroundMusic");
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    const fsPlayIcon = document.getElementById("fsPlayIcon");
    const fsPauseIcon = document.getElementById("fsPauseIcon");
    const progressBar = document.getElementById("progressBar");
    const fsProgressBar = document.getElementById("fsProgressBar");
    const currentTimeDisplay = document.getElementById("currentTime");
    const fsCurrentTimeDisplay = document.getElementById("fsCurrentTime");
    const durationDisplay = document.getElementById("duration");
    const fsDurationDisplay = document.getElementById("fsDuration");
    const volumeControl = document.getElementById("volumeControl");
    const favoriteBtn = document.getElementById("favoriteBtn");
    const fsFavoriteBtn = document.getElementById("fsFavoriteBtn");
    const loopBtn = document.getElementById("loopBtn");
    const fsLoopBtn = document.getElementById("fsLoopBtn");
    const musicControls = document.getElementById("musicControls");
    const fullscreenView = document.getElementById("fullscreenView");
    const closeFullscreenBtn = document.getElementById("closeFullscreenBtn");
    
    // Handle track ended event
    audio.addEventListener("ended", () => {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState") || "{}");
    
        // If loop is enabled, don't use queue
        if (playerState.isLoop) {
            return;
        }
        
        // Try to play from queue first
        if (!playNextFromQueue()) {
            // If queue is empty and music is playing, play a random song
            if (playerState.isPlaying) {
                playRandomSong();
            }
        }
    });

    window.setCurrentMusicToEnd = function() {
        audio.currentTime = audio.duration;
    }


    // Add to queue function
   
    window.playNextFromQueue = function() {
        let musicQueue = JSON.parse(localStorage.getItem("musicQueue") || "[]");
        
        if (musicQueue.length > 0) {
            // Get the first song from queue
            const nextSong = musicQueue.shift();
            
            // Update the queue in localStorage
            localStorage.setItem("musicQueue", JSON.stringify(musicQueue));
            
            // Play the song
            loadMusicPlayer(nextSong, 0, true);
            
            return true;
        }
        
        return false; // No songs in queue
    };
    
    // Function to play a random song from available music cards
    window.playRandomSong = function() {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState") || "{}");
        let currentMusicId = playerState.musicData ? playerState.musicData.id : null;
        
        // Get all music cards
        const musicCards = document.querySelectorAll(".play-music-class");
        
        // Filter out the currently playing song
        const availableCards = Array.from(musicCards).filter(card => {
            const cardData = JSON.parse(card.dataset.src);
            return cardData.id !== currentMusicId;
        });
        
        // Only proceed if there are other music cards available
        if (availableCards.length > 0) {
            // Get a random index
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            
            // Simulate click on the random music card
            availableCards[randomIndex].click();
        }else{
            audio.pause();
            playerState.isPlaying = false;
            updatePlayPauseButton(false);
        }
    };
    
    // Add event listener for close button
    closeFullscreenBtn.addEventListener("click", function() {
        exitFullscreen();
    });
    
    // Initialize state
    let isMinimized = false;
    let isFullscreenMode = false;
    
    function updateFavoriteButton() {
        // Get current music ID
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState") || "{}");
        if (!playerState.musicData) return;
        
        const currentMusicId = playerState.musicData.id;
        
        // Get favorites list
        let favorites = JSON.parse(localStorage.getItem("musicFavorites") || "[]");
        
        // Check if current music is favorite
        const isFavorite = favorites.some(item => item.id === currentMusicId);
        
        // Update UI accordingly
        if (isFavorite) {
            favoriteBtn.innerHTML = '<i class="fas fa-heart" style="color: #1db954;"></i>';
            fsFavoriteBtn.className = "fas fa-heart";
            fsFavoriteBtn.style.color = "#1db954";
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            fsFavoriteBtn.className = "far fa-heart";
            fsFavoriteBtn.style.color = "";
        }
    }
    
    // Update favorite button display
    updateFavoriteButton();

    function updatePlayPauseButton(playing) {
        playIcon.style.display = playing && !audio.paused ? "none" : "inline";
        pauseIcon.style.display = playing && !audio.paused ? "inline" : "none";
        fsPlayIcon.style.display = playing && !audio.paused ? "none" : "inline";
        fsPauseIcon.style.display = playing && !audio.paused ? "inline" : "none";
    }
    
    // Handle orientation changes for responsive adjustments
    window.addEventListener('resize', function() {
        if (isFullscreenMode) {
            // Adjust fullscreen layout if needed
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Adjust for portrait vs landscape
            if (viewportHeight < viewportWidth) {
                // Landscape orientation
                fullscreenView.querySelector('img').style.maxHeight = '35%';
            } else {
                // Portrait orientation
                fullscreenView.querySelector('img').style.maxHeight = '40%';
            }
        }
    });
    
    // Enter custom fullscreen mode (not browser fullscreen)
    window.enterFullscreenMode = function() {
        fullscreenView.style.display = "flex";
        isFullscreenMode = true;
        document.body.style.overflow = "hidden"; // Prevent scrolling
        
        // Trigger resize handler to adjust layout
        window.dispatchEvent(new Event('resize'));
    };
    
    // Exit from custom fullscreen mode
    window.exitFullscreen = function() {
        fullscreenView.style.display = "none";
        isFullscreenMode = false;
        document.body.style.overflow = ""; // Restore scrolling
    };
    
    // Toggle loop
    window.toggleLoop = function() {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState"));
        playerState.isLoop = !playerState.isLoop;
        localStorage.setItem("musicPlayerState", JSON.stringify(playerState));
        
        audio.loop = playerState.isLoop;
        
        if (audio.loop) {
            loopBtn.innerHTML = '<i class="fas fa-redo" style="color: #1db954;"></i>';

            fsLoopBtn.className = "fas fa-redo";
            fsLoopBtn.style.color = "#1db954";
        } else {
            loopBtn.innerHTML = '<i class="fas fa-redo"></i>';
            fsLoopBtn.className = "fas fa-redo";
            fsLoopBtn.style.color = "";
        }
    };
    
    // Toggle favorite
    window.toggleFavorite = function() {
        // Get current player state
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState") || "{}");
        
        // Get current music data
        const musicData = playerState.musicData;
        if (!musicData) return;
        
        // Get favorites from localStorage
        let favorites = JSON.parse(localStorage.getItem("musicFavorites") || "[]");
        
        // Check if this music is already in favorites
        const isFavorite = favorites.some(item => item.id === musicData.id);
        
        if (isFavorite) {
            // Remove from favorites
            favorites = favorites.filter(item => item.id !== musicData.id);
            
            // Update favorite status in player state
            playerState.musicData.is_favorite = false;
            
            // Update UI
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            fsFavoriteBtn.className = "far fa-heart";
            
            // Show notification
            // showNotification(`Removed "${musicData.title}" from favorites`);
        } else {
            // Add to favorites
            favorites.push(musicData);
            
            // Update favorite status in player state
            playerState.musicData.is_favorite = true;
            
            // Update UI
            favoriteBtn.innerHTML = '<i class="fas fa-heart" style="color: #1db954;"></i>';
            fsFavoriteBtn.className = "fas fa-heart";
            fsFavoriteBtn.style.color = "#1db954";
            
            // Show notification
            // showNotification(`Added "${musicData.title}" to favorites`);
        }
        
        // Save updated favorites and player state
        localStorage.setItem("musicFavorites", JSON.stringify(favorites));
        localStorage.setItem("musicPlayerState", JSON.stringify(playerState));

        
        // Refresh page to apply changes
        setTimeout(() => window.location.reload(), 100);
    };
    
    // Minimize player
    window.minimizePlayer = function() {
        document.getElementById("expandedView").style.display = "none";
        document.getElementById("minimizedView").style.display = "block";
        musicControls.style.padding = "8px 15px";
        isMinimized = true;
    };
    
    // Expand player
    window.expandPlayer = function(event) {
        if (event) event.stopPropagation();
        document.getElementById("expandedView").style.display = "flex";
        document.getElementById("minimizedView").style.display = "none";
        musicControls.style.padding = "15px";
        isMinimized = false;
    };
    
    // Change volume
    window.changeVolume = function() {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState"));
        playerState.volume = volumeControl.value;
        localStorage.setItem("musicPlayerState", JSON.stringify(playerState));
        
        audio.volume = volumeControl.value;
    };

    window.togglePlay = function() {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState"));
        
        if (audio.paused) {
            audio.play();
            playerState.isPlaying = true;
            updatePlayPauseButton(true);
        } else {
            audio.pause();
            playerState.isPlaying = false;
            updatePlayPauseButton(false);
        }
        
        localStorage.setItem("musicPlayerState", JSON.stringify(playerState));
    };

    window.seekAudio = function(context = '') {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState"));
        
        if (context === 'fs') {
            audio.currentTime = (fsProgressBar.value / 100) * audio.duration;
        } else {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
        
        playerState.currentTime = audio.currentTime;
        localStorage.setItem("musicPlayerState", JSON.stringify(playerState));
    };

    // Add touch events for better mobile experience
    progressBar.addEventListener("touchstart", function(e) {
        // Prevent default to avoid scrolling when adjusting
        e.preventDefault();
    });
    
    fsProgressBar.addEventListener("touchstart", function(e) {
        e.preventDefault();
    });

    audio.addEventListener("timeupdate", () => {
        let playerState = JSON.parse(localStorage.getItem("musicPlayerState"));
        playerState.currentTime = audio.currentTime;
        localStorage.setItem("musicPlayerState", JSON.stringify(playerState));
        
        // Update both progress bars
        if (audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            fsProgressBar.value = (audio.currentTime / audio.duration) * 100;
        }
        
        // Update both time displays
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        fsCurrentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
        durationDisplay.textContent = formatTime(audio.duration);
        fsDurationDisplay.textContent = formatTime(audio.duration);
        
        if (resumeTime > 0) {
            audio.currentTime = resumeTime;
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }
    
    // Restore saved settings
    audio.volume = playerState.volume || 1;
    volumeControl.value = audio.volume;
    
    audio.loop = playerState.isLoop || false;
    if (audio.loop) {
        loopBtn.innerHTML = '<i class="fas fa-redo" style="color: #1db954;"></i>';
        fsLoopBtn.className = "fas fa-redo";
        fsLoopBtn.style.color = "#1db954";
    }

    if (shouldPlay) {
        audio.play().catch(e => {
            console.log("Autoplay prevented:", e);
            // Handle autoplay restrictions
        });
        updatePlayPauseButton(true);
    } else {
        updatePlayPauseButton(false);
    }
    
    // Handle keyboard events for fullscreen mode
    document.addEventListener('keydown', function(event) {
        if (isFullscreenMode && event.key === "Escape") {
            exitFullscreen();
        }
    });
    
    // Add swipe detection for mobile devices in fullscreen mode
    let touchStartY = 0;
    let touchEndY = 0;
    
    fullscreenView.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    fullscreenView.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        // Detect downward swipe to exit fullscreen
        if (touchEndY - touchStartY > 100) {
            exitFullscreen();
        }
    }
}

window.addEventListener("DOMContentLoaded", function() {

    
    // Set up click handlers for all music cards
    setTimeout(() => {
        document.querySelectorAll(".play-music-class").forEach(card => {
            card.addEventListener("click", function() {
                const musicData = JSON.parse(this.dataset.src);
                loadMusicPlayer(musicData, 0, true);
            });
        });
        
        // Load last played music from saved player state
        const playerState = JSON.parse(localStorage.getItem("musicPlayerState") || "{}");
    
        if (playerState.musicData) {
            loadMusicPlayer(
                playerState.musicData, 
                playerState.currentTime || 0, 
                playerState.isPlaying || false
            );
        }
    }, 200);
});

function addToQueue(musicData) {
    let musicQueue = JSON.parse(localStorage.getItem("musicQueue") || "[]");
    
    // Add the music to queue
    musicQueue.push(musicData);
    
    localStorage.setItem("musicQueue", JSON.stringify(musicQueue));
    
    showNotification(`Added "${musicData.title}" to queue`);
};

function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "queue-notification";
    notification.textContent = message;
    
    notification.style.position = "fixed";
    notification.style.bottom = "80px";
    notification.style.right = "20px";
    notification.style.backgroundColor = "rgba(29, 185, 84, 0.9)";
    notification.style.color = "white";
    notification.style.padding = "10px 15px";
    notification.style.borderRadius = "4px";
    notification.style.zIndex = "2000";
    notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    notification.style.transition = "opacity 0.3s ease";
    
    // Get the stack of notifications
    const notificationStack = document.querySelectorAll(".queue-notification");
    
    // Add new notification below the existing ones
    if (notificationStack.length > 0) {
        notification.style.bottom = `${parseInt(notificationStack[notificationStack.length - 1].style.bottom) - 50}px`;
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

