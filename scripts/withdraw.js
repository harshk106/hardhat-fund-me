const { getNamedAccounts } = require("hardhat")
const {
    TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
} = require("hardhat/builtin-tasks/task-names")
const { ethers } = require("hardhat/internal/lib/hardhat-lib")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding...")
    const transcationResponse = await fundMe.withdraw()
    await transcationResponse.wait(1)
    console.log("Got it back!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
