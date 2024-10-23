document.getElementById('searchForm').addEventListener('submit', function(event) {
    const location = document.getElementById('location').value;
    const price = document.getElementById('price').value;
    const capacity = document.getElementById('capacity').value;

    localStorage.setItem('location', location);
    localStorage.setItem('price', price);
    localStorage.setItem('capacity', capacity);
});