document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); 

        const emailInput = document.getElementById("email").value;
        const passwordInput = document.getElementById("password").value;

        const storedUser = JSON.parse(localStorage.getItem('userData'));

        if (!storedUser) {
            alert("Belum ada akun yang terdaftar. Silakan register dulu.");
            return;
        }

        if (emailInput === storedUser.email && passwordInput === storedUser.password) {
           
            localStorage.setItem('loggedInUser', JSON.stringify(storedUser));

            alert("Login berhasil! Selamat datang, " + storedUser.name + "!");

          
            window.location.href = "index.html";
        } else {
            alert("Email atau password salah. Coba lagi.");
        }
    });
});
