$(document).ready(function() {
    $("#search").on("keyup", function() {
        let search = $(this).val().trim();

        if (search.length > 0) {
            // Use getMusics() instead of fetching from JSON file
            const musicData = getMusics();
            
            let results = {
                users: [], // Assuming you still want to keep user results
                music: []
            };

            // Filter music data based on the search input
            results.music = musicData.filter(music => 
                music.title.toLowerCase().includes(search.toLowerCase()) ||
                music.artist_name.toLowerCase().includes(search.toLowerCase())
            );

            let suggestionList = "";
            
            // Add a container with improved styling
            suggestionList += '<div class="suggestion-container">';
            
            // Music results section with improved styling
            if (results.music && results.music.length > 0) {
                suggestionList += '<div class="suggestion-category">';
                suggestionList += '<h6 class="suggestion-header">Music</h6>';
                suggestionList += '<ul class="suggestion-list">';
                
                // Keep the play function
                suggestionList += `
                <script> 
                function playMusic(music) {
                    const musicElement = document.getElementById(music);
                    const musicData = JSON.parse(musicElement.dataset.src);
                    const musicJson = {
                        id: musicData.id,
                        user_id: 12, // Ganti dengan user_id yang sesuai jika ada
                        title: musicData.title,
                        description: musicData.description || "",
                        category_id: 73, // Ganti dengan category_id yang sesuai jika ada
                        audio: musicData.audio,
                        cover_img: musicData.cover_img,
                        created_at: musicData.created_at,
                        updated_at: musicData.updated_at,
                        favorite_count: 1, // Ganti dengan favorite_count yang sesuai jika ada
                        artist: {
                            name: musicData.artist_name,
                            avatar: "path/to/avatar" // Ganti dengan path avatar yang sesuai jika ada
                        },
                        is_favorite: false // Ganti dengan status favorit yang sesuai jika ada
                    };
                    
                    loadMusicPlayer(musicJson, 0, true);
                }
                </script>`;
                
                results.music.forEach(music => {
                    const formattedDate = new Date(music.created_at).toLocaleDateString();
                    
                    suggestionList += `
                    <li class="suggestion-item music-item" id="${music.audio}" 
                                onclick='playMusic("${music.audio}")' 
                                data-src='${JSON.stringify(music)}'>
                        <div class="item-content">
                            <img src="${music.cover_img ? "src/cover_image/" + music.cover_img : "assets/images/default-cover.png"}" 
                                 alt="${music.title}" class="cover-img-suggestion"/>
                            <div class="music-info">
                                <span class="item-name">${music.title}</span>
                                <span class="artist-name">by ${music.artist_name}</span>
                            </div>
                        </div>
                    </li>`;
                });
                
                suggestionList += '</ul></div>';
            }
            
            suggestionList += '</div>'; // Close suggestion-container
            
            // Display results or no results message with improved styling
            if (results.music.length > 0) {
                $("#suggestions").html(suggestionList).show();
            } else {
                $("#suggestions").html(`
                    <div class="suggestion-container empty-results">
                        <div class="no-results">
                            <i class="fa fa-search"></i>
                            <p>No results found for "${search}"</p>
                        </div>
                    </div>
                `).show();
            }
        } else {
            $("#suggestions").hide();
        }
    });

    // Click on suggestion to fill input
    $(document).on("click", ".suggestion-item .item-name", function() {
        $("#search").val($(this).text().trim());
        $("#suggestions").hide();
    });

    // Hide suggestions when clicking outside
    $(document).on("click", function(e) {
        if (!$(e.target).closest("#search, #suggestions").length) {
            $("#suggestions").hide();
        }
    });
});