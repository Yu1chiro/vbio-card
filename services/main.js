document.addEventListener('DOMContentLoaded', () => {
    // Mengambil tombol dan elemen
    const portfolioButton = document.getElementById('portfolio');
    const musicButton = document.getElementById('music');
    const portfolioElement = document.getElementById('portfolio-element');
    const musicElement = document.getElementById('music-element');

    // Fungsi untuk menampilkan elemen dengan animasi halus dan kondisional scroll
    function showElement(element) {
        // Menghapus kelas hidden dan menambahkan animasi
        element.classList.remove('hidden');
        element.classList.add('transition', 'duration-500', 'ease-in-out', 'opacity-0', 'translate-y-10');
        
        // Sedikit timeout untuk memastikan transisi berjalan
        setTimeout(() => {
            element.classList.remove('opacity-0', 'translate-y-10');
            element.classList.add('opacity-100', 'translate-y-0');
            
            // Cek lebar layar sebelum melakukan scroll
            if (window.matchMedia('(max-width: 768px)').matches) {
                // Opsi scroll yang sangat halus
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 10);
    }

    // Fungsi untuk menyembunyikan elemen dengan animasi halus
    function hideElement(element) {
        element.classList.add('opacity-0', 'translate-y-10');
        
        setTimeout(() => {
            element.classList.add('hidden');
            element.classList.remove('opacity-100', 'translate-y-0');
        }, 500);
    }

    // Event listener untuk tombol portfolio
    portfolioButton.addEventListener('click', () => {
        // Sembunyikan elemen musik
        hideElement(musicElement);
        
        // Tampilkan elemen portfolio
        showElement(portfolioElement);
    });

    // Event listener untuk tombol musik
    musicButton.addEventListener('click', () => {
        // Sembunyikan elemen portfolio
        hideElement(portfolioElement);
        
        // Tampilkan elemen musik
        showElement(musicElement);
    });
});