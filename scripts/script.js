document.addEventListener("DOMContentLoaded", function () {
    burgerMenu();
    activePage();
    updateTokens();
});

function burgerMenu() {
    const burger = document.querySelector(".menu-burger");
    const overlay = document.querySelector(".menu-overlay");

    if (burger) {
        burger.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    if (overlay) {
        overlay.addEventListener("click", function () {
            document.body.classList.remove("menu-open");
        });
    }
}

function activePage() {
    let currentPageName = document.location.href;
    const menuLinks = document.querySelectorAll('.navigation__link');
    if (menuLinks) {
        menuLinks.forEach(function (link) {
            if (link.href == currentPageName) {
                link.classList.add('navigation__link_active');
            }
        });
    }
}

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function decodeJWT(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function updateTokens() {
    const accessToken = getCookie('accessToken');
    const refreshToken = getCookie('refreshToken');

    if (accessToken) {
        updateLink();
    } else {
        if (refreshToken) {
            updateLink();
            fetch('https://backend-7p4e.onrender.com/auth/get-new-access-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: refreshToken })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка обновления токена');
                    }
                    return response.json();
                })
                .then(data => {
                    document.cookie = `accessToken=${data.accessToken}; max-age=${5 * 60}; path=/`;
                })
                .catch(error => {
                    console.error("Ошибка обновления токена:", error);
                });
        }
    }
}

function updateLink() {
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    if (storedUserDetails) {
        const loginLink = document.querySelector('.navigation__link[href*="registration.html"]');

        if (loginLink) {
            loginLink.textContent = storedUserDetails.username;
            loginLink.href = document.location.href.includes('index.html') ? './pages/profile.html' : '../pages/profile.html';
        }
    }
}
