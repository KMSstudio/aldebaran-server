document.addEventListener('DOMContentLoaded', function() {
    const updateButton = document.getElementById('updateButton');
    const createButton = document.getElementById('createButton');
    const resultMessage = document.getElementById('resultMessage');

    updateButton.addEventListener('click', async function() {
        const code = document.getElementById('optCode').value;
        const name = document.getElementById('optName').value;
        const minSelect = document.getElementById('minSelect').value;
        const maxSelect = document.getElementById('maxSelect').value;
        const content = document.getElementById('content').value.split(',').map(item => {
            const [nm, ad] = item.split(':');
            return { nm, ad: Number(ad) };
        });

        if (!code || !name) {
            resultMessage.textContent = '옵션코드와 옵션명을 입력하세요.';
            resultMessage.className = 'result-message error';
            return;
        }

        try {
            const response = await fetch(`/option/update/${code}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, minSelect, maxSelect, content })
            });

            const result = await response.json();
            if (result.success) {
                resultMessage.textContent = '옵션이 성공적으로 업데이트되었습니다.';
                resultMessage.className = 'result-message success';
            } else {
                resultMessage.textContent = `업데이트 실패: ${result.message}`;
                resultMessage.className = 'result-message error';
            }
        } catch (error) {
            console.error('Error updating option:', error);
            resultMessage.textContent = '업데이트 중 오류가 발생했습니다.';
            resultMessage.className = 'result-message error';
        }
    });

    createButton.addEventListener('click', async function() {
        const name = document.getElementById('optName').value;
        const minSelect = document.getElementById('minSelect').value;
        const maxSelect = document.getElementById('maxSelect').value;
        const content = document.getElementById('content').value.split(',').map(item => {
            const [nm, ad] = item.split(':');
            return { nm, ad: Number(ad) };
        });

        if (!name || !content.length) {
            resultMessage.textContent = '옵션명과 옵션내용을 입력하세요.';
            resultMessage.className = 'result-message error';
            return;
        }

        try {
            const response = await fetch('/option/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, minSelect, maxSelect, content })
            });

            const result = await response.json();
            if (result.success) {
                resultMessage.textContent = '옵션이 성공적으로 생성되었습니다.';
                resultMessage.className = 'result-message success';
            } else {
                resultMessage.textContent = `생성 실패: ${result.message}`;
                resultMessage.className = 'result-message error';
            }
        } catch (error) {
            console.error('Error creating option:', error);
            resultMessage.textContent = '생성 중 오류가 발생했습니다.';
            resultMessage.className = 'result-message error';
        }
    });
});
