const form = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-msg');
let isLogin = true;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLogin ? '/login' : '/signup';
    try {
        const res = await fetch('https://legendary-tribble-7vvqrjjg5v42pw6r-5000.app.github.dev' + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            if (isLogin) {
                localStorage.setItem('token', data.access_token);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.style.color = 'green';
                errorMsg.textContent = 'Signup successful! Please login.';
                setTimeout(() => toggleForm(), 1000);
            }
        } else {
            errorMsg.textContent = data.msg || 'Error occurred';
        }
    } catch (err) {
        errorMsg.textContent = 'Server error';
    }
});

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForm();
});

function toggleForm() {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    submitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
    toggleLink.textContent = isLogin ? 'Sign up' : 'Login';
    document.getElementById('toggle-msg').innerHTML = isLogin ? "Don't have an account? <a href='#' id='toggle-link'>Sign up</a>" : "Already have an account? <a href='#' id='toggle-link'>Login</a>";
    errorMsg.textContent = '';
    document.getElementById('toggle-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForm();
    });
}
