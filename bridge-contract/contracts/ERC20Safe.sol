// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IERC20Ups.sol";

/**
    @title Manages deposited ERC20s.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with ERC20Handler contract.
 */
contract ERC20Safe {
    uint256 public ETHReserve;

    /**
        @notice Used to transfer tokens into the safe to fund proposals.
        @param tokenAddress Address of ERC20 to transfer.
        @param owner Address of current token owner.
        @param amount Amount of tokens to transfer.
     */
    function fundERC20(address tokenAddress, address owner, uint256 amount) external {
        IERC20Ups erc20 = IERC20Ups(tokenAddress);
        _safeTransferFrom(erc20, owner, address(this), amount);
    }

    /**
        @notice Used to gain custody of deposited token.
        @param tokenAddress Address of ERC20 to transfer.
        @param owner Address of current token owner.
        @param recipient Address to transfer tokens to.
        @param amount Amount of tokens to transfer.
     */
    function lockERC20(address tokenAddress, address owner, address recipient, uint256 amount) internal {
        IERC20Ups erc20 = IERC20Ups(tokenAddress);
        _safeTransferFrom(erc20, owner, recipient, amount);
    }

    /**
        @notice Transfers custody of token to recipient.
        @param tokenAddress Address of ERC20 to transfer.
        @param recipient Address to transfer tokens to.
        @param amount Amount of tokens to transfer.
     */
    function releaseERC20(address tokenAddress, address recipient, uint256 amount) internal {
        IERC20Ups erc20 = IERC20Ups(tokenAddress);
        _safeTransfer(erc20, recipient, amount);
    }

    /**
        @notice Used to create new ERC20s.
        @param tokenAddress Address of ERC20 to transfer.
        @param recipient Address to mint token to.
        @param amount Amount of token to mint.
     */
    function mintERC20(address tokenAddress, address recipient, uint256 amount) internal {
        IERC20Ups erc20 = IERC20Ups(tokenAddress);
        erc20.mint(recipient, amount);

    }

    /**
        @notice Used to burn ERC20s.
        @param tokenAddress Address of ERC20 to burn.
        @param owner Current owner of tokens.
        @param amount Amount of tokens to burn.
     */
    function burnERC20(address tokenAddress, address owner, uint256 amount) internal {
        IERC20Ups erc20 = IERC20Ups(tokenAddress);
        erc20.burn(owner, amount);
    }

    /**
        @notice Used to deposit ETH
        @param amount Amount of ETH to deposit.
     */
    function depositETH(uint256 amount) internal {
        require(amount == msg.value, "msg.value and data mismatched");
        require(
            address(this).balance >= ETHReserve + amount,
            "ETHReserve mismatched"
        );
        ETHReserve = address(this).balance;
    }

    /**
        @notice Transfers custody of ETH to recipient.
        @param recipient Address to transfer ETH to.
        @param amount Amount of ETH to transfer.
     */
    function releaseETH(address payable recipient, uint256 amount) internal {
        uint256 balanceBefore = address(this).balance;
        _safeTransferETH(recipient, amount);
        require(
            address(this).balance == balanceBefore - amount,
            "ERC20: withdraw fail!"
        );
    }

    /**
        @notice used to transfer ERC20s safely
        @param token Token instance to transfer
        @param to Address to transfer token to
        @param value Amount of token to transfer
     */
    function _safeTransfer(IERC20Ups token, address to, uint256 value) private {
        _safeCall(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }


    /**
        @notice used to transfer ERC20s safely
        @param token Token instance to transfer
        @param from Address to transfer token from
        @param to Address to transfer token to
        @param value Amount of token to transfer
     */
    function _safeTransferFrom(IERC20Ups token, address from, address to, uint256 value) private {
        _safeCall(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
        @notice used to transfer ETH safely
        @param to Address to transfer ETH to
        @param value Amount of ETH to transfer
     */
    function _safeTransferETH(address payable to, uint256 value) private {
        (bool success, bytes memory returndata) = address(to).call{
            value: value
        }("");
        require(success, "ERC20: call failed");

        if (returndata.length > 0) {
            require(
                abi.decode(returndata, (bool)),
                "ERC20: operation did not succeed"
            );
        }
    }

    /**
        @notice used to make calls to ERC20s safely
        @param token Token instance call targets
        @param data encoded call data
     */
    function _safeCall(IERC20Ups token, bytes memory data) private {
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "ERC20: call failed");

        if (returndata.length > 0) {

            require(abi.decode(returndata, (bool)), "ERC20: operation did not succeed");
        }
    }

}
