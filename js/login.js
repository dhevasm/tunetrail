document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); 

        const emailInput = document.getElementById("email").value;
        const passwordInput = document.getElementById("password").value;

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.length === 0) {
            alert("Belum ada akun yang terdaftar. Silakan register dulu.");
            return;
        }

        // Cari user yang cocok
        const foundUser = users.find(user => user.email === emailInput && user.password === passwordInput);

        if (foundUser) {
            // Simpan user yang login ke localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(foundUser));

            alert("Login berhasil! Selamat datang, " + foundUser.name + "!");

            window.location.href = "index.html"; // Arahkan ke halaman utama
        } else {
            alert("Email atau password salah. Coba lagi.");
        }
    });
});
