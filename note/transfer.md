## Data transfer - Render .ejs
**render shop (shop/code)**

    {
        wholesale: {
            id: ,
            code: ,
            name: ,
        },
        retail: {
            id: ,
            code: ,
            name: ,
        },
        prod: {
            code: ,
            id: ,
            minCnt: ,
            name: ,
            opt: ,
            price: ,
            unitCnt: ,
        }
    }

## Data transfer - Order.ejs
**order request (/order/push)**

    {
        wholesale: {
            code: ,
            name: ,
        },
        retail: {
            code: ,
            name: ,
            // 없을 시 home.ctrl.js에서 자동생성
            ip: ,
        },
        order: {
            content: [
                { code: "", name: "", cnt: }
                { code: "", name: "", cnt: , opt: [ "특" ] }
            ],
            // 총액
            price: ,
        }
    }