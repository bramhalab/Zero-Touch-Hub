document.addEventListener('DOMContentLoaded', () => {
    // 1. Mouse movement effect for the Hero section
    const visual = document.querySelector('.hero-visual');
    const cover = document.querySelector('.game-cover');

    if (visual && cover) {
        visual.addEventListener('mousemove', (e) => {
            const rect = visual.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const moveX = (x / rect.width) * 40;

            cover.style.transform = `translateX(${moveX}px)`;
            cover.style.transition = 'none';
        });

        visual.addEventListener('mouseleave', () => {
            cover.style.transform = `translateX(0px)`;
            cover.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    }

    // Carousel variables
    let featuredGames = [];
    let currentFeaturedIndex = 0;
    let slideInterval;
    const SLIDE_DURATION = 5000; // 5 seconds

    // 2. Fetch and Load Games dynamically
    async function loadGames() {
        try {
            const response = await fetch('games.json');
            if (!response.ok) {
                throw new Error('Failed to load games.json');
            }

            const games = await response.json();

            if (games.length > 0) {
                // Find all featured games, or just use all if none are featured
                featuredGames = games.filter(g => g.featured);
                if (featuredGames.length === 0) featuredGames = games;

                updateFeaturedGame(featuredGames[currentFeaturedIndex]);
                startAutoSlide();

                // Populate the All Games grid
                populateGamesGrid(games);
            }
        } catch (error) {
            console.error("Error loading games:", error);
            document.getElementById('featured-title').innerHTML = "Error<br>Loading<span class='dot'>.</span>";
            document.getElementById('featured-desc').innerText = "Could not load games data. Check your JSON file.";
        }
    }

    function updateFeaturedGame(game) {
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');

        // Fade out
        heroContent.style.opacity = 0;
        heroVisual.style.opacity = 0;

        setTimeout(() => {
            // Split title into two lines for heroic effect
            const words = game.title.split(' ');
            let titleHtml = "";
            if (words.length > 1) {
                const firstPart = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                const secondPart = words.slice(Math.ceil(words.length / 2)).join(' ');
                titleHtml = `${firstPart.toUpperCase()}<br>${secondPart.toUpperCase()}<span class="dot">.</span>`;
            } else {
                titleHtml = `${game.title.toUpperCase()}<span class="dot">.</span>`;
            }

            document.getElementById('featured-title').innerHTML = titleHtml;
            document.getElementById('featured-desc').innerText = game.description;
            document.getElementById('featured-link').href = game.game_url;

            document.getElementById('featured-icon').style.backgroundImage = `url('${game.icon_url}')`;
            document.getElementById('featured-glow').style.backgroundImage = `url('${game.icon_url}')`;

            // Fade in
            heroContent.style.opacity = 1;
            heroVisual.style.opacity = 1;
        }, 500); // 500ms match CSS transition
    }

    function changeSlide(direction) {
        if (featuredGames.length <= 1) return;

        currentFeaturedIndex += direction;

        if (currentFeaturedIndex >= featuredGames.length) {
            currentFeaturedIndex = 0;
        } else if (currentFeaturedIndex < 0) {
            currentFeaturedIndex = featuredGames.length - 1;
        }

        updateFeaturedGame(featuredGames[currentFeaturedIndex]);
        resetAutoSlide();
    }

    function startAutoSlide() {
        if (featuredGames.length > 1) {
            slideInterval = setInterval(() => {
                changeSlide(1);
            }, SLIDE_DURATION);
        }
    }

    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    // Event Listeners for Arrows
    document.getElementById('hero-prev')?.addEventListener('click', () => changeSlide(-1));
    document.getElementById('hero-next')?.addEventListener('click', () => changeSlide(1));

    function populateGamesGrid(games) {
        const container = document.getElementById('categories-container');
        container.innerHTML = ''; // Clear loading text

        // Group games by category
        const categories = {};
        games.forEach(game => {
            const cat = game.category || 'Arcade';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(game);
        });

        // Generate HTML for each category
        for (const [categoryName, categoryGames] of Object.entries(categories)) {
            // Create Section Title
            const h2 = document.createElement('h2');
            h2.className = 'section-title';
            h2.textContent = categoryName;
            container.appendChild(h2);

            // Create Grid Container
            const grid = document.createElement('div');
            grid.className = 'games-grid';
            grid.style.marginBottom = '4rem';

            // Generate Cards
            categoryGames.forEach(game => {
                const url = game.game_url;
                const iconUrl = game.icon_url;
                const title = game.title;
                const desc = game.description;

                const shortDesc = desc.length > 50 ? desc.substring(0, 47) + '...' : desc;

                const cardHTML = `
                    <a href="${url}" class="mini-card">
                        <div class="mini-card-icon" style="background-image: url('${iconUrl}');"></div>
                        <div class="mini-card-info">
                            <h3>${title}</h3>
                            <p>${shortDesc}</p>
                        </div>
                    </a>
                `;
                grid.innerHTML += cardHTML;
            });

            // If it's the "Upcoming" or similar logic, we can append placeholders 
            // but for a clean look, we just append the generated grid.
            container.appendChild(grid);
        }

        // Add a general "Coming Soon" category at the end
        const upcomingH2 = document.createElement('h2');
        upcomingH2.className = 'section-title';
        upcomingH2.textContent = 'Coming Soon';
        container.appendChild(upcomingH2);

        const upcomingGrid = document.createElement('div');
        upcomingGrid.className = 'games-grid';
        upcomingGrid.innerHTML = `
            <a href="#" class="mini-card">
                <div class="mini-card-icon placeholder-icon"></div>
                <div class="mini-card-info">
                    <h3>Upcoming Title</h3>
                    <p>A new adventure is in development.</p>
                </div>
            </a>
        `;
        container.appendChild(upcomingGrid);
    }

    // Initialize loading
    loadGames();
});
