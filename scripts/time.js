function measureLoadTime() {
    const startLoadTime = new Date().getTime();

    window.addEventListener("load", function () {
        const durationElement = document.querySelector(".time__duration");

        if (durationElement) {
            const loadTime = new Date().getTime() - startLoadTime;
            durationElement.textContent = loadTime + " мс";
        }
    });
}

measureLoadTime();