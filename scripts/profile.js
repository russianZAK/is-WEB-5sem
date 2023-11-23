document.addEventListener("DOMContentLoaded", function () {
    logout();
    showUserDetails();
});

function updateLink() {
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    console.log(storedUserDetails)
    if (storedUserDetails) {
        const loginLink = document.querySelector('.navigation__link[href="profile.html"]');

        if (loginLink) {
            loginLink.textContent = storedUserDetails.username;
        }
    }
}

function logout(){
    const logoutButton = document.querySelector('.profile__logout-btn');

    logoutButton.addEventListener('click', function () {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure";
        localStorage.removeItem('userDetails');

        window.location.href = "../index.html";
    });
}

function showUserDetails() {
    const storedUserDetails = localStorage.getItem('userDetails');
    let accessToken = getCookie('accessToken');

    if (storedUserDetails) {
        const userDetails = JSON.parse(storedUserDetails);
        displayUserDetails(userDetails);
        if (accessToken) {
            fetchIsAdmin(userDetails.username, accessToken);
        }
    } else {
        if (accessToken) {
            let decodedToken = decodeJWT(accessToken);
            let username = decodedToken.sub;
            fetchUserDetails(username, accessToken);
            fetchIsAdmin(username, accessToken);
        }
    }
}

function decodeJWT(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function fetchIsAdmin(usernameOrEmail, token) {
    fetch("https://backend-7p4e.onrender.com/user/check-is-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ usernameOrEmail })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status >= 400 && response.status < 500) {
                throw new Error("Ошибка в запросе от клиента");
            } else if (response.status >= 500) {
                throw new Error("Произошла внутренняя ошибка сервера");
            } else {
                throw new Error("⚠ Что-то пошло не так");
            }
        })
        .then(data => {
            const editBtn = document.querySelector('.profile__edit-btn');

            if (data.admin) {
                editBtn.style.display = 'block';
            } else {
                editBtn.style.display = 'none';
            }

            editBtn.addEventListener('click', function () {
                window.location.href = "../pages/dashboard.html";
            });
        })
        .catch((error) => {
            const errorBanner = document.querySelector(".error-banner.profile");
            errorBanner.textContent = error.message;
            errorBanner.style.display = "block";
        });
}


function fetchUserDetails(usernameOrEmail, token) {
    fetch("https://backend-7p4e.onrender.com/user/get-user-by-username-or-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ usernameOrEmail })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status >= 400 && response.status < 500) {
                throw new Error("Ошибка в запросе от клиента");
            } else if (response.status >= 500) {
                throw new Error("Произошла внутренняя ошибка сервера");
            } else {
                throw new Error("⚠ Что-то пошло не так");
            }
        })
        .then(data => {
            const simplifiedUserDetails = {
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                birthDate: data.birthDate,
                gender: data.gender,
                country: data.country,
                region: data.region,
                city: data.city,
                town: data.town
            };

            displayUserDetails(simplifiedUserDetails);
            localStorage.setItem('userDetails', JSON.stringify(simplifiedUserDetails));
            updateLink();
        })
        .catch((error) => {
            const errorBanner = document.querySelector(".error-banner.profile");
            errorBanner.textContent = error.message;
            errorBanner.style.display = "block";
        });

}

function displayUserDetails(data) {
    document.getElementById("username-text").textContent = data.username;
    document.getElementById("email-text").textContent = data.email;
    document.getElementById("phone-number-text").textContent = data.phoneNumber;
    document.getElementById("birth-date-text").textContent = data.birthDate;
    document.getElementById("gender-text").textContent = data.gender === "MALE" ? "Муж." : data.gender === "FEMALE" ? "Жен." : "Не указано";
    document.getElementById("country-text").textContent = data.country;
    document.getElementById("region-text").textContent = data.region;
    document.getElementById("city-text").textContent = data.city === null ? "Не указано" : data.city;
    document.getElementById("town-text").textContent = data.town === null ? "Не указано" : data.town;

    const genderText = document.getElementById('gender-text').textContent.trim();
    const avatarImage = document.querySelector('.profile__avatar');

    if (genderText === "Муж.") {
        avatarImage.src = "../images/man.svg";
    } else if (genderText === "Жен.") {
        avatarImage.src = "../images/woman.svg";
    } else {
        avatarImage.src = "../images/anonymous.svg";
    }
}