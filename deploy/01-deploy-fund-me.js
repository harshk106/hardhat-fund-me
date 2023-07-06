//import
//main function
//calling of main function

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { WeiPerEther } = require("ethers")

//function deployFunction(hre) {
//     console.log("Hey!")
//     hre.getNamedAccounts()
//     hre.deployments()
// }

//module.experts = async(hre) =>{
//     const { getNamedAccounts , deployments} = hre
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // getNamedAccounts and deployments

    //we can use chainid to get address
    //if chainid is X use address Y
    //if chainid is Z use address A
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdpriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //what happens when we wantto change chains
    //going for a localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer, //who is deploying
        args: args, //[put pricefeed address]
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //verify
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("----------------------------------------")
}

module.exports.tags = ["all", "fundme"]
