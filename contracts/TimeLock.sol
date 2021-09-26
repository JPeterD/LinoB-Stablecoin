// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

contract TimeLock {

    uint256 totalDeposits;
    uint256 numberset;
    address public stableCoinAddress = 0x5CdD156681D42Ad03B43A6dE6C5070fa2e5c5041;
    LinoBToken public stableContract = LinoBToken(stableCoinAddress);

    mapping (address => uint256) public depositAmount;
    mapping (address => uint256) public stableCoinAmount;

    function deposit() public payable {
        require(msg.value > 0, "Deposit has to be greater than 0.");
        require(depositAmount[msg.sender] == 0, "You already have a deposit in the contract");

        depositAmount[msg.sender] = msg.value;
        totalDeposits = totalDeposits + msg.value;
        
        uint256 stableMintAmount = msg.value / 10e7;
        stableContract.mint(msg.sender, stableMintAmount);
        stableCoinAmount[msg.sender] = stableMintAmount;

    }

    function withdraw() public {
        require(depositAmount[msg.sender] > 0, "Your deposited funds is 0");
        require(stableCoinAmount[msg.sender] > 0, "You dont have any stable coins!");

        stableContract.transferFrom(msg.sender, address(this), stableCoinAmount[depositor]);
        stableContract.burn(stableCoinAmount[msg.sender]);

        address payable to = payable(msg.sender);
        to.transfer(depositAmount[msg.sender]);

        depositAmount[msg.sender] = 0;
    }
}

abstract contract LinoBToken {
    function mint(address to, uint256 amount) public virtual;
    function burn(uint256 amount) public virtual;
    function transferFrom(address sender, address recipient, uint256 amount) external virtual returns (bool);

}