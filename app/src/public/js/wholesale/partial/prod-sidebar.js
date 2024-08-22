document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.delete-all').addEventListener('click', resetProducts);
});

function resetProducts() {
    if (confirm("정말로 모든 제품을 삭제하시겠습니까?")) {
        fetch('/product/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('모든 제품이 성공적으로 삭제되었습니다.');
                location.reload();
            } else {
                alert('제품 삭제에 실패했습니다: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error resetting products:', error);
            alert('서버 오류로 인해 제품 삭제에 실패했습니다.');
        });
    }
}