# Aldebaran
For backend
Andebaran project made by ms. Kang

## Concept

쇼핑몰에 각 매장별 (배민 도매 ver)
shop List가 있음. 단, shop List는 private이고 shop마다 링크(QR)이 따로 있음.
접속 링크를 타면 매장이 팔고 있는 리스트가 뜸
그 중 몇 가지 골라서 결제

## Page

**aldebaran admin page**  
로그에 주문목록 (주문자 ip)  
에러 목록  
 
**admin**
도매상 DB 있어야 함. + 도매상 admin
메뉴 업로드 (단일, 대량)
메뉴 커스터마이징 페이지가 필요함. (사진, 상품설명)

**shop**
도매상에게 주문 넣고 결제하기

## DB

table 도매상
주소, 전화번호
table 주문
도매상, 주문자, 주문ip, 주문내역, 금액
table 소매상
