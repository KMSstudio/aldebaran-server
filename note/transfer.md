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
                    opt: item.opt = [
                        'AAAA0009', 'AAAA0021', ...
                    ]
                },
                ...
            ]
        }
    }

### render wholesale/opt

{
    user: {
        id: ,
        code: ,
        name: ,
    },
    opt: {
        success: (true/false),
        msg: "",
        opts: [
            {
                id: item.id,
                name: item.name,
                minSelect: item.minSelect,
                maxSelect: item.maxSelect,
                // content 배열 예시: [ { nm: "opt1", ad: 0 }, { nm: "opt2", ad: 500 }, ... ]
                content: item.content
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
            opt: [
                {
                    id: ,
                    name: ,
                    minSelect: ,
                    maxSelect: ,
                    content: [
                        { nm: "차갑게", ad: "500" }
                        { nm: "뜨겁게", ad: "0" }
                    ]
                }, ...
            ],
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
### order request (send to /order/push)

    {
        wholesale: {
            code: ,
            name: ,
        },
        retail: {
            code: ,
            name: ,
            // ip 없을 시 home.ctrl.js에서 자동생성
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