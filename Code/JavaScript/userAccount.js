// Function to display the login form
function openLoginForm() {
    document.getElementById("login").style.display = "block";
}

// Function to close the login form
function closeLoginForm() {
    document.getElementById("login").style.display = "none";
}

// Function to display the sign-up form
function openSignUpForm() {
    document.getElementById("signup").style.display = "block";
}

// Function to close the sign-up form
function closeSignUpForm() {
    document.getElementById("signup").style.display = "none";
}

// Function to validate an email using a regular expression
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to check if a password is valid (at least 8 characters)
function isValidPassword(password) {
    return password.length >= 8;
}

// Function to check if a user is logged in
function checkUserLoggedIn() {
    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Get the currently logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        console.log("User is already logged in:", loggedInUser);
        document.getElementById("playButton").classList.remove("disabled");
    } else {
        console.log("No user is logged in.");
        document.getElementById("playButton").classList.add("disabled");
    }
}

// Call the checkUserLoggedIn function when the page loads
window.onload = function () {
    checkUserLoggedIn();
};

// Clear loggedInUser on page refresh
window.onbeforeunload = function () {
    localStorage.removeItem("loggedInUser");
};

// Call the checkUserLoggedIn function when the page loads (this code appears twice)
window.onload = function () {
    checkUserLoggedIn();
};

// Function to handle the login process
function handleLogin() {
    const email = document.getElementsByName("email")[0].value;
    const password = document.getElementsByName("psw")[0].value;

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the user exists
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        console.log("User logged in:", user);
        alert("Login successful");
        closeLoginForm();

        // Set the currently logged-in user in localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // Enable the "Play" button
        document.getElementById("playButton").classList.remove("disabled");
    } else {
        alert("Invalid email or password");

        // Add a class to visually disable the "Play" button
        document.getElementById("playButton").classList.add("disabled");
    }

    // Returning false to prevent form submission
    return false;
}

// Function to handle the sign-up process
function handleSignUp() {
    const name = document.getElementsByName("name")[0].value;
    const username = document.getElementsByName("username")[0].value;
    const email = document.getElementsByName("email")[1].value;
    const password = document.getElementsByName("psw")[1].value;

    // Validate email and password
    if (!isValidEmail(email) || !isValidPassword(password)) {
        alert("Invalid email or password format, should be > 8");
        return false; // Prevent form submission
    }

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the username or email is already taken
    const existingUser = users.find(u => u.username === username || u.email === email);

    if (existingUser) {
        alert("Username or email already taken");
    } else {
        // Add the new user to the array with an initial high score of 0
        const newUser = { name, username, email, password, highScore: 0 };
        users.push(newUser);

        // Save the updated users array back to localStorage
        localStorage.setItem("users", JSON.stringify(users));

        alert("Sign up successful");
        closeSignUpForm();
    }

    return false; // Prevent form submission
}
