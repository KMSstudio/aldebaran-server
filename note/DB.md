## Database

**wholesale**

    id* 도매자의 id
    pw 도매자의 password
    address 주소
    phoneNumber 전화번호
    name 도매처 이름. 소매자에게 표시될 이름
    code 도매처 코드. product와 option, link는 code를 중심으로 생성됨

**retailer**

    id* 소매자의 id
    pw 도매자의 password
    address 주소
    phoneNumber 전화번호
    name 소매처 이름. 소매자에게 표시될 이름
    code 소매처 코드. order는 code를 중심으로 생성됨
    connShop 접속한 회사
        [
            { xcode: "xcode1", name: "wholesale1" },
            { xcode: 'xcode2", name: "wholesale2" },
        ]


**order**

    wholesale* 도매처 코드
    id* 주문id
    retail 소매자 코드
    date 주문일시
    ip 주문자 아이피
    status 주문처리 상태
    content 주문내역
        [
            { code: "AAJB0001", name: "상추", cnt:20 },
            { code: "AAJB0023", name: "감자", cnt:20 , opt: [ "특" ] },
        ]
    price 주문가격
    wholesaleName 도매처 이름
    retailName 소매자 이름

**prod**

    code* 도매처 코드  
    id* 상품 id  
    minCnt 최소주문수량
    name 상품명
    opt 옵션 코드배열,
        [ 'AAJB0020', 'AAJB0031' ]
    price 단가
    unitCnt 주문수량단위

**opt**

    code* 도매처 코드
    id* 옵션 id
    name 옵션명
    minSelect 최소선택수량
    maxSelect 최대선택수량
    content 옵션내용
        [
            { nm: "차갑게", ad: "500" }
            { nm: "뜨겁게", ad: "0" }
        ]
        