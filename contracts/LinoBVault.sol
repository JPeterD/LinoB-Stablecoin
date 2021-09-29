// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";

contract LinoBVault {

    uint256 totalDeposits;

    address public stableCoinAddress = 0x76FebBBE670De113b78858edB2a831A63fB9bB06;
    LinoBToken public stableContract = LinoBToken(stableCoinAddress);

    mapping (address => uint256) public depositAmount;
    mapping (address => uint256) public stableCoinAmount;
    mapping (address => uint256) public ckb_ratio;

    FeedRegistryInterface internal ckb_usd_price_feed;

    constructor() {
        ckb_usd_price_feed = FeedRegistryInterface(0x1363bdCE312532F864e84924D54c7dA5eDB5B1BC);
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit has to be greater than 0.");

        (uint80 roundID, int price, uint startedAt, uint timeStamp, uint80 answeredInRound) = ckb_usd_price_feed.latestRoundData(0x0000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000348);

        if(depositAmount[msg.sender] == 0) {
            uint256 stableMintAmount = msg.value * uint256(price) / 10e7 / 2;

            stableContract.mint(msg.sender, stableMintAmount);
            stableCoinAmount[msg.sender] = stableMintAmount;

            depositAmount[msg.sender] = msg.value;
            totalDeposits = totalDeposits + msg.value;
            ckb_ratio[msg.sender] = depositAmount[msg.sender] * uint256(price) / stableCoinAmount[msg.sender];
        }

        else {
            depositAmount[msg.sender] = depositAmount[msg.sender]+ msg.value;
            totalDeposits = totalDeposits + msg.value;

            ckb_ratio[msg.sender] = depositAmount[msg.sender] * uint256(price) / stableCoinAmount[msg.sender];
        }
    }

    function withdraw() public {
        require(depositAmount[msg.sender] > 0, "You have no outstanding loans.");
        require(stableContract.balanceOf(msg.sender) >= stableCoinAmount[msg.sender], "You don't have enough LINOB.");

        stableContract.transferFrom(msg.sender, address(this), stableCoinAmount[msg.sender]);
        stableContract.burn(stableCoinAmount[msg.sender]);

        address payable to = payable(msg.sender);
        to.transfer(depositAmount[msg.sender]);

        depositAmount[msg.sender] = 0;
        stableCoinAmount[msg.sender] = 0;
        ckb_ratio[msg.sender] = 0;
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

    function liquidate(address riskyaccount) public {
        require(stableContract.balanceOf(msg.sender) >= stableCoinAmount[riskyaccount]);
        (uint80 roundID, int price, uint startedAt, uint timeStamp, uint80 answeredInRound) = ckb_usd_price_feed.latestRoundData(0x0000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000348);
        
        if(ckb_ratio[riskyaccount] > 150000000){
            revert("Ratio is not below 150%");
        }

        else if(ckb_ratio[riskyaccount] < 150000000 && ckb_ratio[riskyaccount] > 0){
            stableContract.transferFrom(msg.sender, address(this), stableCoinAmount[riskyaccount]);

            address payable to = payable(msg.sender);

            uint256 liquidatorfee = (stableCoinAmount[riskyaccount] / 20 + stableCoinAmount[riskyaccount]) / uint256(price);
            to.transfer(liquidatorfee);

            stableContract.burn(stableCoinAmount[riskyaccount]);

            depositAmount[riskyaccount] = depositAmount[riskyaccount] - liquidatorfee;
            stableCoinAmount[riskyaccount] = 0;
            totalDeposits = totalDeposits - liquidatorfee;
        }

        else {
            ckb_ratio[riskyaccount] = depositAmount[riskyaccount] * uint256(price) / stableCoinAmount[riskyaccount];
        }
    }
}

abstract contract LinoBToken {
    function mint(address to, uint256 amount) public virtual;
    function burn(uint256 amount) public virtual;
    function transferFrom(address sender, address recipient, uint256 amount) external virtual returns (bool);
    function balanceOf(address account) public virtual returns (uint256);
}