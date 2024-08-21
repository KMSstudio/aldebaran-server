Order content json
{
    content: [
        { code: "GV293", name: "상추", cnt: 2 }
        { code: "GV295", name: "고추", cnt: 1, option: [ "특" ] }
    ],
    price: 23000,
}

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

**order구성**
[
    {
        code:
        name:
        cnt:
        opt: []
    }
]

2001, missing argument
2002, id가 이미 존재함
2003, 부적절한 pw
2004, invalid argument
2100, internal server error
2101, env.AWS_WHOLESALE_USER에 문제가 있음
2102, env.AWS_SESSION_TABLE에 문제가 있음
2103, env.AWS_ORDER_LIST에 문제가 있음
2104, env.AWS_PRODUCT_LIST에 문제가 있음
2201, user id가 존재하지 않음
2202, user pw가 일치하지 않음
2203, session이 존재하지 않음
2204, 만료된 session
2205, order id가 존재하지 않음
2206, order가 이미 접수됨