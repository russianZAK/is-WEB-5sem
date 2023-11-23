const GEONAMES_API_USERNAME = 'russianzak';

document.addEventListener('DOMContentLoaded', function () {
    geonamesFetching();
    registrationOrLogin();
});

function registrationOrLogin() {
    let regBtn = document.querySelector('.toggler__btn--active');
    let authBtn = document.querySelector('.toggler__btn:not(.toggler__btn--active)');
    let regForm = document.querySelector('.registration');
    let authForm = document.querySelector('.authorization');

    regBtn.addEventListener('click', function () {
        if (!this.classList.contains('toggler__btn--active')) {
            this.classList.add('toggler__btn--active');
            authBtn.classList.remove('toggler__btn--active');
            authForm.style.display = 'none';
            regForm.style.display = 'grid';
        }
    });

    authBtn.addEventListener('click', function () {
        if (!this.classList.contains('toggler__btn--active')) {
            this.classList.add('toggler__btn--active');
            regBtn.classList.remove('toggler__btn--active');
            regForm.style.display = 'none';
            authForm.style.display = 'grid';
        }
    });

    const registrationForm = document.querySelector(".registration-form");
    const authorizationForm = document.querySelector(".authorization-form");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const usernameError = document.getElementById("username-error");
    const emailError = document.getElementById("email-error");

    usernameInput.addEventListener("input", function () {
        usernameInput.classList.remove("error-border");
        usernameError.textContent = "";
        usernameError.classList.remove("show");
    });

    emailInput.addEventListener("input", function () {
        emailInput.classList.remove("error-border");
        emailError.textContent = "";
        emailError.classList.remove("show");
    });

    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("username");
        const emailInput = document.getElementById("email");
        const usernameError = document.getElementById("username-error");
        const emailError = document.getElementById("email-error");

        checkUsernameExists(usernameInput.value)
            .then((usernameExists) => {
                if (usernameExists) {
                    throw { field: 'username', message: "Имя пользователя уже существует" };
                }
                return checkEmailExists(emailInput.value);
            })
            .then((emailExists) => {
                if (emailExists) {
                    throw { field: 'email', message: "Email уже существует" };
                }
                return Promise.all([
                    fetchNameByGeoId(document.getElementById("country").value),
                    fetchNameByGeoId(document.getElementById("region").value),
                    fetchNameByGeoId(document.getElementById("city").value),
                    fetchNameByGeoId(document.getElementById("town").value)
                ]);
            }).then(([countryName, regionName, cityName, townName]) => {
                const userData = {
                    email: emailInput.value,
                    username: usernameInput.value,
                    password: document.getElementById("password").value,
                    phoneNumber: document.getElementById("phone-number").value,
                    birthDate: document.getElementById("birth-date").value,
                    gender: document.querySelector('.registration-form__radio:checked').value,
                    country: countryName,
                    region: regionName,
                    city: cityName || null,
                    town: townName || null
                };

                return registerUser(userData);
            })
            .then(tokens => {
                document.cookie = `accessToken=${tokens.accessToken}; max-age=${5 * 60}; path=/`;
                document.cookie = `refreshToken=${tokens.refreshToken}; max-age=${30 * 24 * 60 * 60}; path=/`;
                window.location.href = "profile.html";
            })
            .catch(error => {
                if (error.field === 'username') {
                    usernameInput.classList.add("error-border");
                    usernameError.textContent = error.message;
                    usernameError.classList.add("show");
                } else if (error.field === 'email') {
                    emailInput.classList.add("error-border");
                    emailError.textContent = error.message;
                    emailError.classList.add("show");
                } else {
                    const errorBanner = document.querySelector(".error-banner.registration");
                    errorBanner.textContent = error.message;
                    errorBanner.style.display = "block";
                }
            });
    });

    authorizationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("auth-username");
        const passwordInput = document.getElementById("auth-password");

        const loginData = {
            usernameOrEmail: usernameInput.value,
            password: passwordInput.value,
        };

        loginUser(loginData)
            .then(tokens => {
                document.cookie = `accessToken=${tokens.accessToken}; max-age=${5 * 60}; path=/`;
                document.cookie = `refreshToken=${tokens.refreshToken}; max-age=${30 * 24 * 60 * 60}; path=/`;
                window.location.href = "profile.html";
            })
            .catch(error => {
                const errorBanner = document.querySelector(".error-banner.authorization");
                errorBanner.textContent = error.message;
                errorBanner.style.display = "block";
            });
    });
}


function geonamesFetching() {
    const countrySelect = document.getElementById('country');
    const regionSelect = document.getElementById('region');
    const citySelect = document.getElementById('city');
    const townSelect = document.getElementById('town');

    fetchCountries().then(countries => {
        countrySelect.innerHTML = countries.map(country => `<option value="${country.geonameId}">${country.countryName}</option>`).join('');
    });

    countrySelect.addEventListener('change', () => {
        const countryCode = countrySelect.value;
        fetchRegions(countryCode).then(regions => {
            regionSelect.innerHTML = regions.map(region => `<option value="${region.geonameId}">${region.name}</option>`).join('');
        });
    });

    regionSelect.addEventListener('change', () => {
        const regionId = regionSelect.value;
        fetchCities(regionId).then(cities => {
            citySelect.innerHTML = cities.map(city => `<option value="${city.geonameId}">${city.name}</option>`).join('');
        });
    });

    citySelect.addEventListener('change', () => {
        const cityId = citySelect.value;
        fetchTowns(cityId).then(towns => {
            townSelect.innerHTML = towns.map(town => `<option value="${town.geonameId}">${town.name}</option>`).join('');
            if (towns.length === 0) {
                townSelect.parentElement.style.display = 'none';
            } else {
                townSelect.parentElement.style.display = 'block';
            }
        });
    });
}


function fetchNameByGeoId(geonameId) {
    return fetch(`http://api.geonames.org/getJSON?geonameId=${geonameId}&lang=ru&username=${GEONAMES_API_USERNAME}`)
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
        .then(data => data.name)
        .catch(error => {
            const errorBanner = document.querySelector(".error-banner.registration");
            errorBanner.textContent = error.message;
            errorBanner.style.display = "block";
        });
}

function fetchCountries() {
    return fetch(`http://api.geonames.org/countryInfoJSON?lang=ru&username=${GEONAMES_API_USERNAME}`)
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
        .then(data => data.geonames);
}

function fetchRegions(countryCode) {
    return fetch(`http://api.geonames.org/childrenJSON?geonameId=${countryCode}&lang=ru&username=${GEONAMES_API_USERNAME}`)
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
        .then(data => data.geonames);
}

function fetchCities(regionId) {
    return fetch(`http://api.geonames.org/childrenJSON?geonameId=${regionId}&lang=ru&username=${GEONAMES_API_USERNAME}`)
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
            return data.geonames;
        });
}

function fetchTowns(cityId) {
    return fetch(`http://api.geonames.org/childrenJSON?geonameId=${cityId}&lang=ru&username=${GEONAMES_API_USERNAME}`)
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
            return data.geonames;
        });
}

function loginUser(loginData) {
    return fetch("https://backend-7p4e.onrender.com/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    }).then(response => {
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
}

function checkUsernameExists(username) {
    return fetch(`https://backend-7p4e.onrender.com/user/check-username-exists/${username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else if (response.status >= 400 && response.status < 500) {
            throw new Error("Ошибка в запросе от клиента");
        } else if (response.status >= 500) {
            throw new Error("Произошла внутренняя ошибка сервера");
        } else {
            throw new Error("⚠ Что-то пошло не так");
        }
    }).then((data) => data.exists);
}

function checkEmailExists(email) {
    return fetch(`https://backend-7p4e.onrender.com/user/check-email-exists/${email}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else if (response.status >= 400 && response.status < 500) {
            throw new Error("Ошибка в запросе от клиента");
        } else if (response.status >= 500) {
            throw new Error("Произошла внутренняя ошибка сервера");
        } else {
            throw new Error("⚠ Что-то пошло не так");
        }
    }).then((data) => data.exists);
}

function registerUser(userData) {
    return fetch("https://backend-7p4e.onrender.com/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    }).then(response => {
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
}