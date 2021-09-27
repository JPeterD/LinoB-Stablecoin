// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";

contract TimeLock {

    uint256 totalDeposits;
    uint256 numberset;

    address public stableCoinAddress = 0x4E39b8D4077508eAAb982d8E4DB1B7BF065b5016;
    LinoBToken public stableContract = LinoBToken(stableCoinAddress);

    mapping (address => uint256) public depositAmount;
    mapping (address => uint256) public stableCoinAmount;

    FeedRegistryInterface internal ckb_usd_price_feed;

    constructor() {
        ckb_usd_price_feed = FeedRegistryInterface(0x1363bdCE312532F864e84924D54c7dA5eDB5B1BC);
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit has to be greater than 0.");
        require(depositAmount[msg.sender] == 0, "You already have a deposit in the contract");
        (uint80 roundID, int price, uint startedAt, uint timeStamp, uint80 answeredInRound) = ckb_usd_price_feed.latestRoundData(0x0000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000348);


        depositAmount[msg.sender] = msg.value;
        totalDeposits = totalDeposits + msg.value;
        
        uint256 stableMintAmount = msg.value * uint256(price) / 10e7;
        stableContract.mint(msg.sender, stableMintAmount);
        stableCoinAmount[msg.sender] = stableMintAmount;

    }

    function withdraw() public {
        require(depositAmount[msg.sender] > 0, "Your deposited funds is 0");
        require(stableCoinAmount[msg.sender] > 0, "You dont have any stable coins!");

        stableContract.transferFrom(msg.sender, address(this), stableCoinAmount[msg.sender]);
        stableContract.burn(stableCoinAmount[msg.sender]);

        address payable to = payable(msg.sender);
        to.transfer(depositAmount[msg.sender]);

        depositAmount[msg.sender] = 0;
        stableCoinAmount[msg.sender] = 0;
    }

    function getCKBUSDPrice() public view returns (int) {
        (uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = ckb_usd_price_feed.latestRoundData(0x0000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000348);
        return price;
    }
}

abstract contract LinoBToken {
    function mint(address to, uint256 amount) public virtual;
    function burn(uint256 amount) public virtual;
    function transferFrom(address sender, address recipient, uint256 amount) external virtual returns (bool);

}