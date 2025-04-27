function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const passwordIcon = document.getElementById(inputId + "-icon");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordIcon.classList.remove("fa-eye-slash");
        passwordIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        passwordIcon.classList.remove("fa-eye");
        passwordIcon.classList.add("fa-eye-slash");
    }
}