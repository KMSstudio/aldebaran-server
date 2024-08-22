document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        id: document.getElementById('id').value,
        pw: document.getElementById('pw').value,
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        phoneNumber: document.getElementById('phoneNumber').value
    };

    try {
        const response = await fetch('/retail/regist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (result.success) {
            // 회원가입 성공 시, 메시지 표시
            messageDiv.textContent = '회원가입에 성공했습니다!';
            messageDiv.className = 'message success';
        } else {
            // 회원가입 실패 시, 메시지 표시
            messageDiv.textContent = `회원가입 실패: ${result.message}`;
            messageDiv.className = 'message error';
        }
    } catch (error) {
        document.getElementById('message').textContent = '회원가입 중 오류가 발생했습니다.';
        document.getElementById('message').className = 'message error';
    }
});
