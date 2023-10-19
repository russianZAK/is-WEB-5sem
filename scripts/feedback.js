const imagesSource = './images/star.svg';
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function () {
    loadReviews();

    deleteReviewListener();

    feedbackFormListener();

    paginationListener();

    updateReviewsVisibility();
});

function paginationListener() {
    const prevBtn = document.querySelector('.pagination_prev-page');
    const nextBtn = document.querySelector('.pagination_next-page');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                updateReviewsVisibility();
            }
        });
        
        nextBtn.addEventListener('click', function () {
            const totalReviews = document.querySelectorAll('.feedback-content__item').length;
            if (currentPage * 6 < totalReviews) {
                currentPage++;
                updateReviewsVisibility();
            }
        });
    }
}

function updateReviewsVisibility() {
    const reviews = document.querySelectorAll('.feedback-content__item');
    const prevBtn = document.querySelector('.pagination_prev-page');
    const nextBtn = document.querySelector('.pagination_next-page');

    if (! reviews) return;
    
    const totalReviews = reviews.length;

    reviews.forEach((review, index) => {
        if (index >= (currentPage - 1) * 6 && index < currentPage * 6) {
            review.style.display = 'grid';
        } else {
            review.style.display = 'none';
        }
    });

    if (currentPage === 1) {
        prevBtn.classList.add('pagination_prev-page_disabled');
    } else {
        prevBtn.classList.remove('pagination_prev-page_disabled');
    }

    if (currentPage * 6 >= totalReviews) {
        nextBtn.classList.add('pagination_next-page_disabled');
    } else {
        nextBtn.classList.remove('pagination_next-page_disabled');
    }
}

function feedbackFormListener(){
    const feedbackForm = document.querySelector('.feedback__form');

    if (feedbackForm){
        feedbackForm.addEventListener('submit', function (event) {
            event.preventDefault();
    
            const username = document.getElementById('username').value;
            const rating = document.getElementById('rating').value;
            const review = document.getElementById('review').value;
    
            addReview(username, rating, review);
    
            saveReview(username, rating, review);
    
            feedbackForm.reset();
        });
    }
}

function deleteReviewListener(){
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('feedback-content__delete')) {
            const listItem = event.target.closest('.feedback-content__item');
            const username = listItem.querySelector('.feedback-content__subtitle').innerText;
            deleteReviewFromLocalStorage(username);
            listItem.remove();
            
            const totalReviews = document.querySelectorAll('.feedback-content__item').length;
            if ((currentPage - 1) * 6 === totalReviews) {
                currentPage = Math.max(1, currentPage - 1);
            }
            updateReviewsVisibility();
        }
    });
}

function addReview(username, rating, review) {
    const reviewsList = document.querySelector('.feedback-content__list');
    const listItem = document.createElement('li');
    listItem.classList.add('feedback-content__item');
    let starsHtml = '';

    for (let i = 0; i < rating; i++) {
        starsHtml += `<img src="${imagesSource}" alt="star" class="feedback-content__img">`;
    }

    listItem.innerHTML = `
        <div class="feedback-content__icons">${starsHtml}</div>
        <h3 class="feedback-content__subtitle">${username}</h3>
        <p class="feedback-content__text">${review}</p>
        <span class="feedback-content__delete">&#10005;</span>
    `;

    if (reviewsList){
        reviewsList.insertBefore(listItem, reviewsList.firstChild);
    }

    currentPage = 1;
    updateReviewsVisibility();
}

function saveReview(username, rating, review) {
    let reviews = localStorage.getItem('reviews');
    if (!reviews) {
        reviews = [];
    } else {
        reviews = JSON.parse(reviews);
    }
    reviews.push({ username, rating, review });
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

function loadReviews() {
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
        const reviews = JSON.parse(storedReviews);
        for (let review of reviews) {
            addReview(review.username, review.rating, review.review);
        }
    }
}

function deleteReviewFromLocalStorage(usernameToDelete) {
    const reviews = JSON.parse(localStorage.getItem('reviews'));
    const updatedReviews = reviews.filter(review => review.username !== usernameToDelete);
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
}