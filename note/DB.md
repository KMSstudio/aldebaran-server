## Database

**wholesale**

    id* 도매자의 id
    pw 도매자의 password
    address 주소
    phoneNumber 전화번호
    name 도매처 이름. 소매자에게 표시될 이름
    code 도매처 코드. product와 option, link는 code를 중심으로 생성됨

**order**

    wholesale* 도매처 코드
    id* 주문id
    retail 소매자 코드
    date 주문일시
    ip 주문자 아이피
    status 주문처리 상태
    content 주문내역
    price 주문가격
    wholesaleName 도매처 이름
    retailName 소매자 이름