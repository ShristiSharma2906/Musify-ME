document.addEventListener('DOMContentLoaded', function() {
    // Handle Sign Up Button Click
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            console.log("Signup clicked");
            window.location.href = 'signup.html'; 
        });
    } else {
        console.error("Element with ID 'signupBtn' not found.");
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            console.log("Login clicked");
            window.location.href = 'login.html'; 
        });
    } else {
        console.error("Element with ID 'loginBtn' not found.");
    }

    // Handle Sign Up Form Submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const gender = document.getElementById('gender').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            if (!firstName || !lastName || !email || !password) {
                alert('Please fill in all required fields.');
                return;
            }
            console.log('Sign Up Form Data:', { firstName, lastName, gender, email, password });

            // Redirect to a confirmation page or other page
            window.location.href = 'index.html'; 
        });
    } else {
        console.error("Sign up form with ID 'signupForm' not found.");
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

          
            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;
            if (!loginEmail || !loginPassword) {
                alert('Please fill in all required fields.');
                return;
            }
            console.log('Login Form Data:', { loginEmail, loginPassword });

            // Redirect to a confirmation page or other page
            window.location.href = 'index.html'; 
        });
    } else {
        console.error("Login form with ID 'loginForm' not found.");
    }
});
