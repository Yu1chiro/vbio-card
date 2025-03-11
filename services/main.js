document.addEventListener('DOMContentLoaded', () => {
    const portfolioButton = document.getElementById('portfolio');
    const experienceButton = document.getElementById('experience');
    const blogsitesButton = document.getElementById('blogsites');
    
    const portfolioElement = document.getElementById('portfolio-element');
    const experienceElement = document.getElementById('experience-element');
    const blogsitesElement = document.getElementById('blogsites-element');
    
    // Menyembunyikan semua elemen saat halaman dimuat
    if (portfolioElement) portfolioElement.classList.add('hidden');
    if (experienceElement) experienceElement.classList.add('hidden');
    if (blogsitesElement) blogsitesElement.classList.add('hidden');
    
    // Memastikan semua elemen memiliki kelas transisi yang diperlukan
    const allElements = [portfolioElement, experienceElement, blogsitesElement];
    allElements.forEach(element => {
        if (element) {
            element.classList.add('transition', 'duration-500', 'ease-in-out');
        }
    });
    
    function showElement(element) {
        if (!element) return;
        
        // Pastikan elemen tersembunyi sebelum menampilkan
        element.classList.remove('hidden');
        element.classList.add('opacity-0', 'translate-y-10');
        
        // Tunggu sedikit waktu untuk DOM update
        setTimeout(() => {
            element.classList.remove('opacity-0', 'translate-y-10');
            element.classList.add('opacity-100', 'translate-y-0');
            
            // Perbaikan scroll agar proporsional dan presisi
            setTimeout(() => {
                // Hitung posisi elemen relatif terhadap halaman
                const rect = element.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Tentukan offset untuk membuat scroll lebih proporsional
                const offset = 80; // Sesuaikan nilai ini berdasarkan header atau elemen lain yang mungkin menutupi konten
                
                // Posisi yang dituju dengan memperhitungkan offset
                const targetPosition = rect.top + scrollTop - offset;
                
                // Gunakan animasi scroll yang halus
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 100); // Sedikit delay untuk memastikan transisi sudah dimulai
        }, 10);
    }
    
    // Fungsi untuk menyembunyikan elemen dengan animasi halus
    function hideElement(element) {
        if (!element) return;
        if (element.classList.contains('hidden')) return;
        
        element.classList.add('opacity-0', 'translate-y-10');
        element.classList.remove('opacity-100', 'translate-y-0');
        
        setTimeout(() => {
            element.classList.add('hidden');
        }, 500); // Sesuaikan dengan durasi transisi
    }
    
    // Fungsi untuk menyembunyikan semua elemen kecuali yang ditentukan
    function hideAllExcept(exceptElement) {
        allElements.forEach(element => {
            if (element && element !== exceptElement) {
                hideElement(element);
            }
        });
    }
    
    // Event listener untuk tombol portfolio
    if (portfolioButton) {
        portfolioButton.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah perilaku default tautan
            hideAllExcept(portfolioElement);
            showElement(portfolioElement);
        });
    }
    
    // Event listener untuk tombol experience
    if (experienceButton) {
        experienceButton.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah perilaku default tautan
            hideAllExcept(experienceElement);
            showElement(experienceElement);
        });
    }
    
    // Event listener untuk tombol blogsites
    if (blogsitesButton) {
        blogsitesButton.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah perilaku default tautan
            hideAllExcept(blogsitesElement);
            showElement(blogsitesElement);
        });
    }
});
// Fetching blog
let lastPostDate = null;
let checkInterval = 30000; // Check every 30 seconds
let lastFetchTimestamp = 0;

async function fetchMediumFeed(isInitialLoad = false) {
    const statusElement = document.getElementById('refresh-status');
    
    // Gunakan rss2json dengan parameter yang tepat
    const apiKey = 'dntozscfz9dleyhyamqx2scvqea3d2fyrbvm9flm'; // Ganti dengan API key Anda
    const mediumUrl = encodeURIComponent('https://medium.com/feed/@takumiharu25');
    const currentTime = Date.now();
    
    // Tambahkan parameter nocache untuk memastikan konten selalu fresh
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${mediumUrl}&api_key=${apiKey}&timestamp=${currentTime}&nocache=${new Date().getTime()}`;
    
    try {
        const timeSinceLastFetch = currentTime - lastFetchTimestamp;
        if (timeSinceLastFetch < 2000) {
            await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastFetch));
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        lastFetchTimestamp = Date.now();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            const posts = data.items;
            
            // Log semua post untuk debugging
            console.log('Fetched posts:', posts);
            
            const latestPost = posts[0];
            const latestPostDate = new Date(latestPost.pubDate);
            
            // Log latest post info
            console.log('Latest post:', {
                title: latestPost.title,
                date: latestPostDate,
                currentLastPostDate: lastPostDate
            });
            
            const isNewContent = !lastPostDate || latestPostDate > lastPostDate;
            
            if (isNewContent || isInitialLoad) {
                console.log('Updating content...');
                if (statusElement) {
                    statusElement.textContent = isInitialLoad ? 
                        `Last updated: ${new Date().toLocaleTimeString()}` : 
                        'New articles found! Updating...';
                }
                
                lastPostDate = latestPostDate;
                
                const postsContainer = document.getElementById('medium-posts');
                if (postsContainer) {
                    if (isInitialLoad) {
                        postsContainer.innerHTML = '';
                    }
                    
                    posts.slice(0, 6).forEach((post) => {
                        const existingPost = document.querySelector(`[data-post-id="${post.guid}"]`);
                        if (!existingPost) {
                            // Coba dapatkan gambar dari berbagai sumber
                            let imageUrl = post.thumbnail;
                            if (!imageUrl || imageUrl === '') {
                                // Coba ekstrak dari konten
                                const imgRegex = /<img[^>]+src="([^">]+)"/;
                                const match = post.description.match(imgRegex) || post.content.match(imgRegex);
                                imageUrl = match ? match[1] : 'https://via.placeholder.com/800x400?text=No+Image+Available';
                            }

                            // Buat excerpt yang lebih bersih dan batasi hingga 5 kalimat
                            const cleanText = (post.description || post.content)
                                .replace(/<[^>]*>/g, '');
                                
                            const sentences = cleanText.split(/[.!?]+/).filter(sentence => sentence.trim() !== '');
                            const limitedSentences = sentences.slice(0, 2);
                            const excerpt = limitedSentences.join('. ').trim() + (limitedSentences.length < sentences.length ? '...' : '');

                            const postCard = document.createElement('div');
                            postCard.className = 'text-center';
                            postCard.setAttribute('data-post-id', post.guid);
                            postCard.setAttribute('data-pub-date', post.pubDate);
                            
                            postCard.innerHTML = `
                                <div class="shadow-card bg-blue-500 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 backdrop-saturate-150 backdrop-contrast-100 rounded-2xl p-6 max-w-xl w-full">
                                    <!-- Kotak Gambar -->
                                    <div class="rounded-lg shadow-md overflow-hidden min-w-[300px] min-h-[200px]">
                                        <img 
                                            src="${imageUrl}" 
                                            alt="${post.title}"
                                            onerror="this.onerror=null; this.src='https://via.placeholder.com/800x400?text=No+Image+Available';"
                                            class="w-full h-[250px] object-cover"
                                        >
                                    </div>
                                    <!-- Teks di Luar Gambar -->
                                    <div class="mt-4 text-white font-montserrat">
                                        <h3 class="text-lg text-start font-montserrat mb-2 text-shadow">${post.title}</h3>
                                        <p class="text-sm font-normal">
                                            ${new Date(post.pubDate).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p class="mt-2 font-montserrat text-sm text-start">${excerpt}</p>
                                        <div class="mt-4">
                                            <a href="${post.link}" class="inline-block shadow-lg hover:from-purple-600 hover:to-blue-700 px-4 py-2 bg-gradient-to-r from-blue-800 to-green-500 font-semibold   text-white rounded-lg " target="_blank">
                                                Read More
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `;

                            postsContainer.appendChild(postCard);
                        }
                    });

                    const allPosts = postsContainer.querySelectorAll('.text-center');
                    if (allPosts.length > 6) {
                        Array.from(allPosts)
                            .slice(6)
                            .forEach(post => post.remove());
                    }
                }

                if (!isInitialLoad && statusElement) {
                    setTimeout(() => {
                        statusElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
                        statusElement.style.color = 'white';
                    }, 2000);
                }
            }
        } else {
            console.warn('Invalid or empty response from RSS feed:', data);
        }
    } catch (error) {
        console.error('Error fetching Medium feed:', error);
        if (statusElement) {
            statusElement.textContent = `Error updating feed: ${error.message}. Retrying...`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initial load started');
    
    // Create status element if it doesn't exist
    if (!document.getElementById('refresh-status')) {
        const blogsitesElement = document.getElementById('blogsites-element');
        if (blogsitesElement) {
            const statusElement = document.createElement('div');
            statusElement.id = 'refresh-status';
            statusElement.className = 'text-center text-gray-600 my-4';
            statusElement.textContent = 'Loading...';
            blogsitesElement.prepend(statusElement);
        }
    }
    
    fetchMediumFeed(true);
    
    setInterval(() => {
        console.log('Checking for new posts...');
        fetchMediumFeed(false);
    }, checkInterval);
}); 
