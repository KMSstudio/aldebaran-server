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

**render retail/main (retail/main)**

    {
        retail: {
            id: ,
            code: ,
            name: ,
        },
        order: {
            success: (true/false),
            msg: "",
            orders: [
                {
                    wholesale: order.wholesaleName,
                    product: order.content.map(item => `${item.name} ${item.cnt}`),
                    price: order.price,
                    date: order.date,
                    status: order.status
                },
                ...
            ]
        },
        conn: [
            { xcode: , name: , },
            ...
        ]
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