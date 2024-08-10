document.addEventListener("DOMContentLoaded", () => {
    console.log("Entry page loaded");

    // Additional JavaScript functionality for animations or interactions
    const btn = document.querySelector('.btn');
    btn.addEventListener('click', () => {
        btn.textContent = "Loading...";
        setTimeout(() => {
            window.location.href = "pages/login.html";
        }, 1000); // simulate a loading time before redirect
    });
});
