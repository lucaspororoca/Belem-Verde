const searchLocation = localStorage.getItem('location');
        const searchPrice = Number(localStorage.getItem('price'));
        const searchCapacity = Number(localStorage.getItem('capacity'));

        // Filter hotels based on search criteria
        const filteredHotels = hotels.filter(hotel => {
            return hotel.location.toLowerCase() === searchLocation.toLowerCase() &&
                   hotel.price <= searchPrice &&
                   hotel.capacity >= searchCapacity;
        });

        // Display the results
        const resultsDiv = document.getElementById('results');
        if (filteredHotels.length > 0) {
            filteredHotels.forEach(hotel => {
                const hotelDiv = document.createElement('div');
                hotelDiv.innerHTML = `
                    <h2>${hotel.name}</h2>
                    <p><strong>Description:</strong> ${hotel.description}</p>
                    <p><strong>Price:</strong> $${hotel.price} per night</p>
                    <p><strong>Location:</strong> ${hotel.location}</p>
                    <p><strong>Capacity:</strong> ${hotel.capacity} people</p>
                    <hr>
                `;
                resultsDiv.appendChild(hotelDiv);
            });
        } else {
            resultsDiv.innerHTML = '<p>No hotels found matching your criteria.</p>';
        }