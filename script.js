document.addEventListener("DOMContentLoaded", function() {
    const burger = document.querySelector(".menu-burger");
    const overlay = document.querySelector(".menu-overlay");

    if(burger) {
        burger.addEventListener("click", function() {
            document.body.classList.toggle("menu-open");
        });
    }

    if(overlay) {
        overlay.addEventListener("click", function() {
            document.body.classList.remove("menu-open");
        });
    }
});