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

    // --- AUTHENTICATION LOGIC ---
    const GAS_URL = "https://script.google.com/macros/s/AKfycby1gwyVKoW1Q8pYk9TtQfZhNxyLD_GBtsaxlw72Vi8EydYeZX8tJRUytwp0bxBgKd3UKA/exec";

    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');
    const authForm = document.getElementById('auth-form');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const userProfile = document.getElementById('user-profile');
    const navUsername = document.getElementById('nav-username');
    const navUserscore = document.getElementById('nav-userscore');
    const logoutBtn = document.getElementById('logout-btn');

    let currentAuthAction = 'login'; // 'login' or 'register'

    // Check Login State on Load
    function checkLoginState() {
        const storedUser = localStorage.getItem('zeroTouchHubUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            authBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            navUsername.innerText = user.username;
            navUserscore.innerText = user.score || 0;
        } else {
            authBtn.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    // Modal Controls
    if (authBtn) authBtn.addEventListener('click', () => {
        authModal.style.display = 'flex';
        resetAuthMessages();
    });

    if (closeModal) closeModal.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentAuthAction = e.target.getAttribute('data-tab');

            document.getElementById('modal-title').innerText = currentAuthAction === 'login' ? 'Access Hub' : 'Join Hub';
            document.getElementById('modal-subtitle').innerText = currentAuthAction === 'login' ? 'Login to sync your high scores' : 'Register to start saving your progress';
            document.getElementById('submit-btn-text').innerText = currentAuthAction === 'login' ? 'Start Playing' : 'Create Account';

            resetAuthMessages();
        });
    });

    function showAuthMessage(type, text) {
        const errorDiv = document.getElementById('auth-error');
        const successDiv = document.getElementById('auth-success');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (type === 'error') {
            errorDiv.innerText = text;
            errorDiv.style.display = 'block';
        } else {
            successDiv.innerText = text;
            successDiv.style.display = 'block';
        }
    }

    function resetAuthMessages() {
        document.getElementById('auth-error').style.display = 'none';
        document.getElementById('auth-success').style.display = 'none';
    }

    // Handle Form Submit
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();

            if (!usernameInput || !passwordInput) return;

            // UI Loading State
            const submitBtn = document.getElementById('submit-auth-btn');
            const btnText = document.getElementById('submit-btn-text');
            const spinner = document.getElementById('submit-spinner');

            submitBtn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'block';
            resetAuthMessages();

            try {
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoids CORS preflight
                    body: JSON.stringify({
                        action: currentAuthAction,
                        username: usernameInput,
                        password: passwordInput,
                        game: "Hub"
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showAuthMessage('success', result.message);

                    // If login successful, save state
                    if (currentAuthAction === 'login') {
                        localStorage.setItem('zeroTouchHubUser', JSON.stringify({
                            username: result.username || usernameInput,
                            score: result.score || 0,
                            password: passwordInput // Optional: keep for auto-updating scores later
                        }));

                        setTimeout(() => {
                            authModal.style.display = 'none';
                            checkLoginState();
                            authForm.reset();
                        }, 1000);
                    } else {
                        // Registration success -> Switch to login tab automatically
                        setTimeout(() => {
                            document.querySelector('[data-tab="login"]').click();
                            document.getElementById('username').value = usernameInput; // Pre-fill
                        }, 1500);
                    }
                } else {
                    showAuthMessage('error', result.message || "Failed to authenticate.");
                }
            } catch (error) {
                console.error("Auth Error:", error);
                showAuthMessage('error', "Network error. Make sure your script URL is correct and deployed to 'Anyone'.");
            } finally {
                // Reset Button UI
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                spinner.style.display = 'none';
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('zeroTouchHubUser');
            checkLoginState();
        });
    }

    // Initialize loading
    checkLoginState();
    loadGames();
});
