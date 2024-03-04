const ethers = require('ethers');
const constants = require('../constants');

const {Command} = require('commander');
const {setupParentArgs, getFunctionBytes, waitForTx, log, expandDecimals} = require("./utils")

const EMPTY_SIG = "0x00000000"

const registerResourceCmd = new Command("register-resource")
    .description("Register a resource ID with a contract address for a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler address', constants.ERC20_HANDLER_ADDRESS)
    .option('--targetContract <address>', `Contract address to be registered`, constants.ERC20_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        log(args, `Args chain id ${args.chainId}`);

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args,`Registering contract ${args.targetContract} with resource ID ${args.resourceId} on handler ${args.handler}`);
        const tx = await bridgeInstance.adminSetResource(args.handler, args.resourceId, args.targetContract, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const registerFeeCmd = new Command("register-fee")
    .description("Register fee with a contract address for a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--tokenContract <address>', `Contract address to be registered`, constants.ERC20_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .action(async function (args) {
            await setupParentArgs(args, args.parent.parent)
            log(args, `Args chain id ${args.chainId}`);

            const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
            log(args,`Registering contract ${args.tokenContract} with resource ID ${args.resourceId}`);
            const tx = await bridgeInstance.adminSetFeeToken(args.resourceId, args.tokenContract, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
            await waitForTx(args.provider, tx.hash)
    })

const registerGenericResourceCmd = new Command("register-generic-resource")
    .description("Register a resource ID with a generic handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler contract address', constants.GENERIC_HANDLER_ADDRESS)
    .option('--targetContract <address>', `Contract address to be registered`, constants.CENTRIFUGE_ASSET_STORE_ADDRESS)
    .option('--resourceId <address>', `ResourceID to be registered`, constants.GENERIC_RESOURCEID)
    .option('--deposit <string>', "Deposit function signature", EMPTY_SIG)
    .option('--execute <string>', "Execute proposal function signature", EMPTY_SIG)
    .option('--hash', "Treat signature inputs as function prototype strings, hash and take the first 4 bytes", false)
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        if (args.hash) {
            args.deposit = getFunctionBytes(args.deposit)
            args.execute = getFunctionBytes(args.execute)
        }

        log(args,`Registering generic resource ID ${args.resourceId} with contract ${args.targetContract} on handler ${args.handler}`)
        const tx = await bridgeInstance.adminSetGenericResource(args.handler, args.resourceId, args.targetContract, args.deposit, args.execute, { gasPrice: args.gasPrice, gasLimit: args.gasLimit})
        await waitForTx(args.provider, tx.hash)
    })

const setBurnCmd = new Command("set-burn")
    .description("Set a token contract as burnable in a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'ERC20 handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', `Token contract to be registered`, constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        log(args,`Setting contract ${args.tokenContract} as burnable on handler ${args.handler}`);
        const tx = await bridgeInstance.adminSetBurnable(args.handler, args.tokenContract, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const setETHCmd = new Command("set-eth")
    .description("Set a token contract as ETH in a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'ERC20 handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', `Token contract to be registered`, constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        log(args, `Args chain id ${args.chainId}`);
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        log(args,`Setting contract ${args.tokenContract} as ETH on handler ${args.handler}`);
        const tx = await bridgeInstance.adminSetETH(args.handler, args.tokenContract, true, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const setFeeCmd = new Command("set-fee")
    .description("Set fee for a handler and resource id")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .option('--feeAmount <value>', 'Fee amount', 0)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        log(args, `Args chain id ${args.chainId}`);

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args,`Set fee ${expandDecimals(args.feeAmount, args.parent.decimals)} with resource ID ${args.resourceId}`);
        const tx = await bridgeInstance.setFee(args.resourceId, expandDecimals(args.feeAmount, args.parent.decimals), { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const setFeeRateCmd = new Command("set-fee-rate")
    .description("Set fee rate for a handler and resource id")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .option('--feeRate <value>', 'Fee rate, eg 50% => 5000', 0)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        log(args, `Args chain id ${args.chainId}`);

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args,`Set fee rate ${args.feeRate} with resource ID ${args.resourceId}`);
        const tx = await bridgeInstance.setFeeRate(args.resourceId, args.feeRate, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const setUserFeeCmd = new Command("set-user-fee")
    .description("Set fee config for a handler and resource id for users")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .option('--userAddress <address>', 'User address', constants.USER_ADDRESS)
    .option('--feeAmount <value>', 'Fee amount', 0)
    .option('--feeRate <value>', 'Fee rate, eg 50% => 5000', 0)
    .option('--isSet <bool>', 'Whether set or no set', true)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        log(args, `Args chain id ${args.chainId}`);

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args,`Set user fee config: fee ${expandDecimals(args.feeAmount, args.parent.decimals)} fee rate ${args.feeRate} with resource ID ${args.resourceId} for user ${args.userAddress}`);
        const tx = await bridgeInstance.setUserFee(args.resourceId, args.userAddress, expandDecimals(args.feeAmount, args.parent.decimals), args.feeRate, args.isSet, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const queryIsBurnCmd = new Command("query-is-burn")
    .description("Get whether the token address is registered as mintable/burnable in a handler")
    .option('--handler <address>', 'Handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', 'Token contract being queried if it is burnable', constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)

        const handlerInstance = new ethers.Contract(args.handler, constants.ContractABIs.HandlerHelpers.abi, args.wallet)
        const isBurn = await handlerInstance._burnList(args.tokenContract)
        log(args, `Getting if contract ${args.tokenContract} is registered as burnable on handler ${args.handler}: ${isBurn}`)
    })

const cancelProposalCmd = new Command("cancel-proposal")
    .description("Cancel a proposal that has passed the expiry threshold")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--chainId <id>', 'Chain ID of proposal to cancel', 0)
    .option('--depositNonce <value>', 'Deposit nonce of proposal to cancel', 0)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        log(args, `Setting proposal with chain ID ${args.chainId} and deposit nonce ${args.depositNonce} status to 'Cancelled`);
        const tx = await bridgeInstance.adminCancelProposal(args.chainId, args.depositNonce);
        await waitForTx(args.provider, tx.hash)
    })

const queryProposalCmd = new Command("query-proposal")
    .description("Queries a proposal")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--chainId <id>', 'Source chain ID of proposal', 0)
    .option('--depositNonce <value>', 'Deposit nonce of proposal', 0)
    .option('--dataHash <value>', 'Hash of proposal metadata', constants.ERC20_PROPOSAL_HASH)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        const prop = await bridgeInstance.getProposal(args.chainId, args.depositNonce, args.dataHash)

        console.log(prop)
    })

const queryResourceId = new Command("query-resource")
    .description("Query the contract address associated with a resource ID")
    .option('--handler <address>', 'Handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--resourceId <address>', `ResourceID to query`, constants.ERC20_RESOURCEID)
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)

        const handlerInstance = new ethers.Contract(args.handler, constants.ContractABIs.HandlerHelpers.abi, args.wallet)
        const address = await handlerInstance._resourceIDToTokenContractAddress(args.resourceId)
        log(args, `Resource ID ${args.resourceId} is mapped to contract ${address}`)
    })


const bridgeCmd = new Command("bridge")

bridgeCmd.addCommand(registerResourceCmd)
bridgeCmd.addCommand(registerFeeCmd)
bridgeCmd.addCommand(registerGenericResourceCmd)
bridgeCmd.addCommand(setFeeCmd)
bridgeCmd.addCommand(setFeeRateCmd)
bridgeCmd.addCommand(setUserFeeCmd)
bridgeCmd.addCommand(setBurnCmd)
bridgeCmd.addCommand(setETHCmd)
bridgeCmd.addCommand(queryIsBurnCmd)
bridgeCmd.addCommand(cancelProposalCmd)
bridgeCmd.addCommand(queryProposalCmd)
bridgeCmd.addCommand(queryResourceId)

module.exports = bridgeCmd
