document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        id: document.getElementById('id').value,
        pw: document.getElementById('pw').value
    };

    try {
        const response = await fetch('/wholesale/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (result.success) {
            // login success
            sessionStorage.setItem('session', result.session);
            window.location.href = '/wholesale/home';
        } else {
            // login fail
            messageDiv.textContent = `로그인 실패: ${result.message}`;
            messageDiv.className = 'message error';
        }
    } catch (error) {
        document.getElementById('message').textContent = '로그인 중 오류가 발생했습니다.';
        document.getElementById('message').className = 'message error';
    }
});
