document.addEventListener("DOMContentLoaded", function() {
    burgerMenu();
    activePage();
});

function burgerMenu(){
    const burger = document.querySelector(".menu-burger");
    const overlay = document.querySelector(".menu-overlay");

    if (burger) {
        burger.addEventListener("click", function() {
            document.body.classList.toggle("menu-open");
        });
    }

    if (overlay) {
        overlay.addEventListener("click", function() {
            document.body.classList.remove("menu-open");
        });
    }
}

function activePage(){
    let currentPageName = document.location.href;
    const menuLinks = document.querySelectorAll('.navigation__link');
    if (menuLinks){
        menuLinks.forEach(function(link) {
            if (link.href == currentPageName) {
                link.classList.add('navigation__link_active');
            }
        });
    }
}

