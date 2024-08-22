## Data transfer - Render .ejs
### render wholesale/main

    {
        user: {
            id: ,
            code: ,
            name: ,
        },
        order: {
            success: (true/false),
            msg: "",
            orders: [
                {
                    retail: record.retailName,,
                    product: order.content.map(item => `${item.name} ${item.cnt}`),
                    price: order.price,
                    date: order.date,
                    status: order.status
                },
                ...
            ]
        }
    }

### render wholesale/prod

    {
        user: {
            id: ,
            code: ,
            name: ,
        },
        prod: {
            success: (true/false),
            msg: "",
            prods: [
                {
                    code: item.code,
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    minCnt: item.minCnt,
                    unitCnt: item.unitCnt,
                    opt: item.opt
                },
                ...
            ]
        }
    }

### render shop (shop/code)

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

### render retail/main (retail/main)

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
### order request (/order/push)

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