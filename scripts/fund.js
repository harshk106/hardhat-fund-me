const { getNamedAccounts } = require("hardhat")
const { ethers } = require("hardhat/internal/lib/hardhat-lib")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract...")
    const transcationResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    })
    await transcationResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
