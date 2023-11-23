let currentPage = 1;
const profilesPerPage = 6;
let prevBtn, nextBtn;

document.addEventListener("DOMContentLoaded", function () {
    fetchUserData();

    paginationListener();
});

function fetchUserData() {
    showPreloader();
    const accessToken = getCookie('accessToken');

    if (accessToken) {
        fetch('https://backend-7p4e.onrender.com/user/get-all-users', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
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
                generateProfiles(data);
                showProfiles(currentPage);
                hidePreloader();
            })
            .catch((error) => {
                const errorBanner = document.querySelector(".error-banner.dashboard");
                errorBanner.textContent = error.message;
                errorBanner.style.display = "block";
                hidePreloader();
            });
    } else {
        hidePreloader();
    }
}

function generateProfiles(users) {
    const profilesContainer = document.querySelector('.article__section.profiles');
    const template = document.getElementById('profile-template');
    profilesContainer.innerHTML = '';
    users.forEach(user => {
        const clone = document.importNode(template.content, true);
        const profile = clone.querySelector('.profile');
        clone.querySelector('#username-text').textContent = user.username;
        clone.querySelector('#email-text').textContent = user.email;
        clone.querySelector('#phone-number-text').textContent = user.phoneNumber;
        clone.querySelector('#birth-date-text').textContent = user.birthDate;
        const genderText = user.gender === "MALE" ? "Муж." : user.gender === "FEMALE" ? "Жен." : "Не указали";
        clone.querySelector('#gender-text').textContent = genderText;

        profilesContainer.appendChild(profile);
    });

    updateAvatars();

    showProfiles(currentPage);
}

function paginationListener() {
    prevBtn = document.querySelector('.pagination_prev-page');
    nextBtn = document.querySelector('.pagination_next-page');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                showProfiles(currentPage);
            }
        });

        nextBtn.addEventListener('click', function () {
            const totalProfiles = document.querySelectorAll('.profile').length;
            const maxPage = Math.ceil(totalProfiles / profilesPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                showProfiles(currentPage);
            }
        });
    }
}

function showProfiles(page) {
    const profiles = document.querySelectorAll('.profile');
    profiles.forEach((profile, index) => {
        if (index >= (page - 1) * profilesPerPage && index < page * profilesPerPage) {
            profile.style.display = 'grid';
        } else {
            profile.style.display = 'none';
        }

        if (currentPage === 1) {
            prevBtn.classList.add('pagination_prev-page_disabled');
        } else {
            prevBtn.classList.remove('pagination_prev-page_disabled');
        }

        const totalProfiles = document.querySelectorAll('.profile').length;
        if (currentPage * profilesPerPage >= totalProfiles) {
            nextBtn.classList.add('pagination_next-page_disabled');
        } else {
            nextBtn.classList.remove('pagination_next-page_disabled');
        }
    });
}

function updateAvatars() {
    const genderTextElements = document.querySelectorAll('.profile__text[id="gender-text"]');

    genderTextElements.forEach(genderTextElement => {

        const profileElement = genderTextElement.closest('.profile');

        const avatarImage = profileElement.querySelector('.profile__avatar');

        const genderText = genderTextElement.textContent.trim();
        if (genderText === "Муж.") {
            avatarImage.src = "../images/man.svg";
        } else if (genderText === "Жен.") {
            avatarImage.src = "../images/woman.svg";
        } else {
            avatarImage.src = "../images/anonymous.svg";

        }
    });
}

function showPreloader() {
    const preloader = document.querySelector('.preloader');
    preloader.style.display = 'block';
}

function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    preloader.style.display = 'none';
}