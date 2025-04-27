document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // supaya form tidak reload halaman

        // Ambil data dari input
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("password_confirm").value;

        if (password !== passwordConfirm) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }

        // Ambil data users yang sudah ada
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Cek apakah email sudah pernah dipakai
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            alert("Email sudah terdaftar! Silakan gunakan email lain.");
            return;
        }

        // Buat data user baru
        const newUser = {
            name: name,
            email: email,
            password: password,
        };

        // Tambahkan user baru ke array
        users.push(newUser);

        // Simpan lagi ke localStorage
        localStorage.setItem('users', JSON.stringify(users));

        alert("Registrasi berhasil!");
        window.location.href = "login.html"; // Pindah ke halaman login
    });
});