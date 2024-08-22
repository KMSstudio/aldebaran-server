document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        id: document.getElementById('id').value,
        pw: document.getElementById('pw').value
    };

    try {
        const response = await fetch('/retail/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (result.success) {
            // 로그인 성공 시, 리다이렉션
            window.location.href = '/retail/main';
        } else {
            // 로그인 실패 시, 메시지 표시
            messageDiv.textContent = `로그인 실패: ${result.message}`;
            messageDiv.className = 'message error';
        }
    } catch (error) {
        document.getElementById('message').textContent = '로그인 중 오류가 발생했습니다.';
        document.getElementById('message').className = 'message error';
    }
});
