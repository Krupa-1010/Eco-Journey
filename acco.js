document.addEventListener('DOMContentLoaded', function() {
    const accommodationsContainer = document.querySelector('#accommodations .row');
    const searchForm = document.getElementById('search-form');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    let accommodations = [];
    let filteredAccommodations = [];
    let currentPage = 1;
    const itemsPerPage = 6;

    // Fetch accommodations data
    fetch('accommodations.json')
        .then(response => response.json())
        .then(data => {
            accommodations = data;
            filteredAccommodations = accommodations; // Initialize with all data
            displayAccommodations();
        });

    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        filterAccommodations();
    });

    // Pagination buttons
    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayAccommodations();
        }
    });

    nextPageButton.addEventListener('click', function() {
        if (currentPage < Math.ceil(filteredAccommodations.length / itemsPerPage)) {
            currentPage++;
            displayAccommodations();
        }
    });

    // Display accommodations based on current page
    function displayAccommodations() {
        accommodationsContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedAccommodations = filteredAccommodations.slice(start, end);

        paginatedAccommodations.forEach(accommodation => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            card.innerHTML = `
                <div class="card">
                    <img src="${accommodation.image}" class="card-img-top card-img-custom" alt="${accommodation.name}">
                    <div class="card-body">
                        <h5 class="card-title">${accommodation.name}</h5>
                        <p class="card-text">${accommodation.description}</p>
                        <p>Price: ₹${accommodation.price} per day</p>
                        <p>Location: ${accommodation.location}</p>
                        <p>Rating: ${accommodation.rating} Stars</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.district + ', ' + accommodation.state)}" 
                           target="_blank" class="btn btn-secondary">Check on Map</a>
                    </div>
                </div>
            `;
            accommodationsContainer.appendChild(card);
        });

        // Disable prev/next buttons based on page number
        prevPageButton.classList.toggle('disabled', currentPage === 1);
        nextPageButton.classList.toggle('disabled', currentPage === Math.ceil(filteredAccommodations.length / itemsPerPage));
    }

    // Filter accommodations based on search and filters
    function filterAccommodations() {
        const location = document.getElementById('search-bar').value.toLowerCase();
        const priceRange = document.getElementById('price-range').value;
        const rating = document.getElementById('rating').value;

        filteredAccommodations = accommodations.filter(accommodation => {
            const matchesLocation = location === '' || accommodation.district.toLowerCase().includes(location) || accommodation.state.toLowerCase().includes(location);
            const matchesPrice = priceRange === 'all' || (priceRange === 'budget' && accommodation.price <= 4000) || (priceRange === 'mid-range' && accommodation.price > 1000);
            const matchesRating = rating === 'all' || accommodation.rating === parseInt(rating, 10);

            return matchesLocation && matchesPrice && matchesRating;
        });

        currentPage = 1; // Reset to the first page
        displayAccommodations();
    }
});
