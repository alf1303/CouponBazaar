const bobPk = '14kE6E1fAPh9d6TKEXkwBXkZxCLf9JctmtaQL17J3HLv';
const bobAddr = '3N65E1rYWAxQMCLg27pRxBFtAt3bPcH3pys';
const dAppAddr = '3MpniGh4Ab64nzX6AXtoL5tzeC5EwSyHuaq';
const dAppPk = '***********';

describe('Test CouponBazaar purchase Function', () => {
    it('Test buy coupon A', async () => {
        let key1 = "status:purchase_item_A_customer_" + bobAddr
        let key2 = "price:purchase_item_A_customer_" + bobAddr

        let payment = [{
            amount: 30000000, assetId: null
        }]

        let invokeBob = invokeScript({
            dApp: dAppAddr,
            call: {
            function: "purchase",
            args: [
                {
                    "type": "string",
                    "value": "A"
                }
            ]
        },
            payment: payment
        }, {privateKey: bobPk})

        await expect(broadcast(invokeBob)).fulfilled
        let key1_val = await accountDataByKey(key1, dAppAddr)
        let key2_val = await accountDataByKey(key2, dAppAddr)
        // console.log(key1_val.value + " : " + key2_val);
        expect(key1_val.value).equals("confirmed");
        expect(key2_val.value).equals(30000000);
        // await clearDataStorage(dAppAddr, key1);
        // await clearDataStorage(dAppAddr, key2);
        // broadcast(invokeBob).then(response => console.log("Response: " + JSON.stringify(response))).catch(error => console.log("Error: " + JSON.stringify(error)))
    })

    it("Buy coupon B with higher price", async() => {

        let payment = [{
            amount: 41000000, assetId: null
        }]

        let invokeBob = invokeScript({
            dApp: dAppAddr,
            call: {
            function: "purchase",
            args: [
                {
                    "type": "string",
                    "value": "B"
                }
            ]
        },
            payment: payment
        }, {privateKey: bobPk})

        await expect(broadcast(invokeBob)).rejectedWith("payment cant be higher than price")
    })

    it("Test if not coupon name provided", async () => {
        let payment = [{
            amount: 40000000, assetId: null
        }]

        let invokeBob = invokeScript({
            dApp: dAppAddr,
            call: {
            function: "purchase",
            args: []
        },
            payment: payment
        }, {privateKey: bobPk})

        await expect(broadcast(invokeBob)).rejectedWith("Error while executing account-script: function 'purchase takes 1 args but 0 were(was) given")
    })

        it("Test if invalid coupon name provided", async () => {
        let payment = [{
            amount: 40000000, assetId: null
        }]

        let invokeBob = invokeScript({
            dApp: dAppAddr,
            call: {
            function: "purchase",
            args: [
                {
                    "type": "string",
                    "value": "C"
                }
            ]
        },
            payment: payment
        }, {privateKey: bobPk})

        await expect(broadcast(invokeBob)).rejectedWith("Please enter valid coupon name: A or B")
    })

    it("Test that only dApp owner can set prices", async() => {
        let invokeSetPrice = invokeScript({
            dApp: dAppAddr,
            call: {
                function: "setPrices",
                args: []
            }
        }, {privateKey: bobPk});

        await expect(broadcast(invokeSetPrice)).rejectedWith("Only owner can set prices")
    })
})

async function clearDataStorage(addr, key) {
    broadcast(invokeScript({
        dApp: addr,
        fee: 900000,
        call: {
            function: "deleteEntry",
            args: [
                    {
                       "type": "string",
                       "value": key
                    }
                ]
            }
        }, {privateKey: dAppPk}))
}