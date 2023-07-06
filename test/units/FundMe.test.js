const { assert, expect } = require("chai")
const { GasCostPlugin } = require("ethers")
const { deployment, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = "1000000000000000000" //1eth ethers.utils.parseEther("1")
    beforeEach(async function () {
        //deploy fundMe conract
        //using hardhat-deploy
        deployer = (await getNamedAccounts()).deployer
        //run thorugh deploy script on local network using fixture
        await deployment.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        //give us the recently deployed fundme contract directly from the deploy accnt
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            //asigning the s_priceFeed address to the mockV3aggregator
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if you dont send enough eth", async function () {
            //to check if enough ETH has been sent or not-
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more eth!"
            )
        })

        it("updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fund.s_addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("adds funder to array of s_funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.s_funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw eth from single founder", async function () {
            //ARRANGE:
            //getting the starting balance of fundMe:-
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            //getting the starting balance of deployer:-
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //ACT:
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effetiveGasPrice } = transactionReceipt
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //gascost?
            //ASSERT:
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString() //gascost is required
            )
        })
        it("allows us to withdraw with multiple s_funders", async function () {
            const accounts = await ethers.getSigners()
            //loop through accounts,  have each of the accounts call ethers
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //ACT
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effetiveGasPrice } = transactionReceipt
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //gascost?
            //ASSERT:
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString() //gascost is required
            )

            //Make sure s_funders are reset properlly
            await expect(fundMe.s_funders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("only allows the owner to withdraw", async function () {
            const accounts = ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })

        it("cheaperWithdraw testing...", async function () {
            const accounts = await ethers.getSigners()
            //loop through accounts,  have each of the accounts call ethers
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //ACT
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effetiveGasPrice } = transactionReceipt
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //gascost?
            //ASSERT:
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString() //gascost is required
            )

            //Make sure s_funders are reset properlly
            await expect(fundMe.s_funders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("only allows the owner to withdraw", async function () {
            const accounts = ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })
    })
})

//add a breakpoint to debugg the javascript code
//console.logs can also be a debugging strategy
