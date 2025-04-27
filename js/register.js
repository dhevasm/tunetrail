document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // supaya form tidak reload halaman

        // Ambil data dari input
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("password_confirm").value;

        if(password !== passwordConfirm) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }

        const userData = {
            name: name,
            email: email,
            password: password,
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        alert("Data berhasil diregistrasi!");
        window.location.href = "login.html";
    });
});
