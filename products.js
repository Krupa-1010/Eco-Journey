document.addEventListener("DOMContentLoaded", function() {
    let products = [];

    // Fetch products data
    let http = new XMLHttpRequest();
    http.open('GET', 'products.json', true);
    http.send();
    http.onload = function() {
        if (this.readyState === 4 && this.status === 200) {
            products = JSON.parse(this.responseText);
            // Do not display products initially
            const swiper = new Swiper('.swiper', {
                direction: 'horizontal',
                loop: true,
                pagination: {
                  el: '.swiper-pagination',
                },
                navigation: {
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                },
                scrollbar: {
                  el: '.swiper-scrollbar',
                },
                spaceBetween: 0,
                effect: 'cube',
                speed: 5000,
                autoplay: {
                    delay: 3000,
                },
            });
        }
    };

    // Display products function
    function displayProducts(filteredProducts) {
        let output = "";
        for (let item of filteredProducts) {
            output += `
                <div class="product" data-category="${item.category}">
                    <img src="${item.image}" alt="${item.title}">
                    <p class="title">${item.title}</p>
                    <p class="description">${item.description}</p>
                    <p class="price">
                        <span>₹${item.price}</span> 
                    </p>
                    <p class="cart" onclick="location.href='${item.link}';">Buy Now <i class="bx bx-cart-alt"></i></p>
                </div>
            `;
        }
        document.querySelector(".products").innerHTML = output;
    }

    // Filter products based on category image click
    window.filterCategory = function(category) {
        const filteredProducts = products.filter(product => product.category.toLowerCase() === category.toLowerCase());
        displayProducts(filteredProducts);
    };
});


