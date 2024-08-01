const apiKey = '5ae2e3f221c38a28845f05b6c88f4770eeb6a1dcb56d9ac62ec50e6d'; // Replace with your OpenTripMap API key
const unsplashAccessKey = 'RrUgg_ydbuTvmGb_qo3Kp7hYGMPfVNBYgoDP2I1GywE'; // Replace with your Unsplash Access Key

const imageCache = {};

const topRecommendations = [
    { name: 'Munnar', imageUrl: 'images/mu1.jpeg', id: '123', lat: 10.0889, lon: 77.0595, description: 'Munnar is a town in the Western Ghats mountain range in India’s Kerala state. A hill station and former resort for the British Raj elite, it is surrounded by rolling hills dotted with tea plantations established in the late 19th century. Eravikulam National Park, a habitat for the endangered mountain goat Nilgiri tahr, is home to the Lakkam Waterfalls, hiking trails and 2,695m-tall Anamudi Peak.', rating: 4 },
    { name: 'Khangchendzonga National Park', imageUrl: 'images/Khangchendzonga-National-Park-Sikkim.jpg', id: '456', lat: 27.6672, lon: 88.3246, description: 'Khangchendzonga National Park covers almost 30% of the total land area of Sikkim in northeast India. It was given the status of a UNESCO World Heritage Site list in 2016. Its natural beauty escapes the description of words, while its landscape is marked by lakes, glaciers, rivers, valleys, plains, and caves.The park is home to a variety of mammal species, some of which include snow leopards, musk deer.red pandas, and Himalayan blue sheep.', rating: 5 },
    { name: 'Lahaul Spiti', imageUrl: 'images/Lahaul-Spiti-Himachal-Prad.jpg', id: '789', lat: 32.6192, lon: 77.3784, description: 'One of the best places for ecotourism in India is Lahaul Spiti in Himachal Pradesh. Its mostly craggy terrain and extreme climate, where temperatures are known to fall beyond minus 30 ° C, provide very few opportunities to earn a livelihood.However, there are a few organizations that are enthusiastic in their endeavor to save the ecosystem through the encouragement of sustainable tourism in this region.Adventure here means trekking through the Pin Parvati Pass, biking through difficult Himalayan trails.', rating: 4 },
    { name: 'Kanha National Park', imageUrl: 'images/Kanha-National-Park-Madhya.jpg', id: '754', lat: 22.2995, lon: 80.5864, description: 'If you are planning a tour to India, then make it a point to visit Kanha National Park in Madhya Pradesh.  In this region, the Royal Bengal Tiger is found in large numbers. The park is renowned for saving the Barasingha from extinction, besides enjoying the reputation of being one of the best-managed parks in Asia. Besides these, it’s also a part of Project Tiger.The park is home to over 350 species of birds along with various kinds of flora. A safari in this park is a wonderful experience as you get to explore meadows, huge plateaus, and valleys.', rating: 5 },
];
function displayTopRecommendations() {
    const container = document.getElementById('top-recommendations');
    container.innerHTML = '';

    topRecommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-card';

        item.innerHTML = `
            <img src="${rec.imageUrl}" alt="${rec.name}">
            <h3>${rec.name}</h3>
            <div class="star-rating">
                ${getStarRating(rec.rating)}
            </div>
            <button class="see-more-button" onclick="openDetailsTab('${rec.id}', '${rec.name}', ${rec.lat}, ${rec.lon}, '${rec.imageUrl}', '${rec.description}')">See More</button>
        `;

        container.appendChild(item);
    });
}

function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star">&#9733;</span>'; // Filled star
        } else {
            stars += '<span class="star">&#9734;</span>'; // Empty star
        }
    }
    return stars;
}

function searchDestinations() {
    const query = document.getElementById('search-input').value;
    const url = `https://api.opentripmap.com/0.1/en/places/geoname?name=${query}&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.lat && data.lon) {
                document.getElementById('top-recommendations').style.display = 'none'; // Hide top recommendations
                fetchRecommendations(data.lat, data.lon);
            } else {
                document.getElementById('results-container').innerHTML = '<p>No results found</p>';
            }
        });
}

function fetchRecommendations(lat, lon) {
    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lat=${lat}&lon=${lon}&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const results = data.features;
            results.sort((a, b) => (b.properties.rate || 0) - (a.properties.rate || 0)); // Sort by rate in descending order
            displayResults(results);
        });
}

function fetchImages(query) {
    if (imageCache[query]) {
        return Promise.resolve(imageCache[query]);
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashAccessKey}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                const imageUrl = data.results[0].urls.small;
                imageCache[query] = imageUrl;
                return imageUrl;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            return null;
        });
}

function displayResults(results) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';

    const fetchImagePromises = results.map(result =>
        fetchImages(result.properties.name).then(imageUrl => ({ ...result, imageUrl }))
    );

    Promise.all(fetchImagePromises).then(resultsWithImages => {
        resultsWithImages.forEach(result => {
            if (result.imageUrl) {
                const item = document.createElement('div');
                item.className = 'result-item';

                item.innerHTML = `
                    <img src="${result.imageUrl}" alt="${result.properties.name}">
                    <h2>${result.properties.name}</h2>
                    <p>${cleanKinds(result.properties.kinds)}</p>
                `;

                item.onclick = () => openDetailsTab(result.id, result.properties.name, result.geometry.coordinates[1], result.geometry.coordinates[0], result.imageUrl);
                container.appendChild(item);
            }
        });
    });
}

function cleanKinds(kinds) {
    const excludedKinds = ['other', 'unclassified_objects'];
    return kinds.split(',').filter(kind => !excludedKinds.includes(kind)).join(', ');
}

function fetchDescription(id) {
    const url = `https://api.opentripmap.com/0.1/en/places/xid/${id}?apikey=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => data.wikipedia_extracts ? data.wikipedia_extracts.text : 'Description not available')
        .catch(error => {
            console.error('Error fetching description:', error);
            return 'Description not available';
        });
}

function openDetailsTab(id, name, lat, lon, imageUrl, description) {
    fetchDescription(id).then(apiDescription => {
        // If the manual description is provided, use it; otherwise, use the API description.
        const finalDescription = description ? description : apiDescription;

        document.getElementById('details-container').style.display = 'block';

        document.getElementById('place-details').innerHTML = `
            <div id="content">
                <div style="flex: 1; padding: 10px;">
                    <img src="${imageUrl}" alt="${name}">
                </div>
                <div id="writings" style="flex: 2; padding: 16px;">
                    <h2>${name}</h2>
                    <p>${finalDescription}</p>
                    <p>Latitude: ${lat}</p>
                    <p>Longitude: ${lon}</p>
                </div>
            </div>
             <h1>Location</h1>
             <h2 class="subhead">Find Your Path: How to Get There</h2>
            <div id="map"></div>
            <div id="reviews">
                <h1>Reviews</h1>
                <h2 class="subhead">Hear from Fellow Eco-Travellers Who Made a Difference</h2>
                <div class="review">
                    <img src="images/person1.jpg"  alt="User 1">
                    <div class="review-ctn">
                        <strong>User 1</strong>
                         <small>Posted on 2024-07-01 | 5:06 pm <i class="fa-solid fa-thumbs-up"></i></small>
                        <p>Great place! I had a wonderful time.</p>
                       
                    </div>
                </div>
                <div class="review">
                    <img src="images/person2.jpg"alt="User 2">
                    <div class="review-ctn">
                        <strong>User 2</strong>
                         <small>Posted on 2024-07-02 | 11:40 pm <i class="fa-solid fa-thumbs-up"></i></small>
                         <p>Very nice location, will visit again!</p>
                       
                    </div>
                </div>
            </div>
            <div id="review-form">
                <h2>Leave a Reply</h3>
                <h3>Your email address will not be published. Required fields are marked</h3>
                <div class="input-area">
                <input type="text" placeholder="    Full Name*" id="full-name" name="full-name" required>
                <input type="email" placeholder="   Your Email*" id="email" name="email" required>
                </div>
                <textarea id="comment" placeholder=" Comment* " name="comment" rows="4" required></textarea>
                <button onclick="submitReview()">Add Comment</button>
            </div>
        `;

        initializeMap(lat, lon);

        document.getElementById('details-container').scrollIntoView({ behavior: 'smooth' });
    });
}

function initializeMap(lat, lon) {
    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map);
}

function submitReview() {
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const comment = document.getElementById('comment').value;
    
    // Add functionality to handle the review submission
    console.log(`Review submitted by ${fullName} (${email}): ${comment}`);
}

// Initialize the top recommendations on page load
document.addEventListener('DOMContentLoaded', displayTopRecommendations);

// Add search button event listener
document.getElementById('searchButton').onclick = searchDestinations;
