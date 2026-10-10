// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TheBate - AI debate prediction pool on Monad
/// @notice Pay 0.1 MON to open a debate. Anyone can stake MON on side A or B.
/// The owner (the debate judge oracle) resolves it, winners split the pot, 5% goes to the owner.
contract TheBate {
    uint256 public constant CREATION_FEE = 0.1 ether;
    uint256 public constant FEE_BPS = 500; // 5%

    struct Debate {
        address creator;
        string topic;
        uint256[2] pool;
        uint8 winner; // 0 = A, 1 = B
        bool resolved;
        bool voided; // nobody staked on the winning side: everyone refunded
    }

    address public owner;
    uint256 public debateCount;
    uint256 public accruedFees;
    mapping(uint256 => Debate) private debates;
    mapping(uint256 => mapping(address => uint256[2])) public stakes;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event DebateCreated(uint256 indexed id, address indexed creator, string topic);
    event Staked(uint256 indexed id, address indexed user, uint8 side, uint256 amount);
    event Resolved(uint256 indexed id, uint8 winner, bool voided);
    event Claimed(uint256 indexed id, address indexed user, uint256 amount);

    error NotOwner();
    error BadFee();
    error BadSide();
    error Closed();
    error NotResolved();
    error NothingToClaim();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createDebate(string calldata topic) external payable returns (uint256 id) {
        if (msg.value != CREATION_FEE) revert BadFee();
        id = ++debateCount;
        Debate storage d = debates[id];
        d.creator = msg.sender;
        d.topic = topic;
        accruedFees += msg.value;
        emit DebateCreated(id, msg.sender, topic);
    }

    function stake(uint256 id, uint8 side) external payable {
        if (side > 1) revert BadSide();
        Debate storage d = debates[id];
        if (d.creator == address(0) || d.resolved) revert Closed();
        d.pool[side] += msg.value;
        stakes[id][msg.sender][side] += msg.value;
        emit Staked(id, msg.sender, side, msg.value);
    }

    function resolve(uint256 id, uint8 winner) external onlyOwner {
        if (winner > 1) revert BadSide();
        Debate storage d = debates[id];
        if (d.creator == address(0) || d.resolved) revert Closed();
        d.resolved = true;
        d.winner = winner;
        uint256 total = d.pool[0] + d.pool[1];
        if (d.pool[winner] == 0) {
            d.voided = true; // full refunds, no cut
        } else {
            accruedFees += (total * FEE_BPS) / 10000;
        }
        emit Resolved(id, winner, d.voided);
    }

    function claim(uint256 id) external {
        Debate storage d = debates[id];
        if (!d.resolved) revert NotResolved();
        if (claimed[id][msg.sender]) revert NothingToClaim();
        uint256[2] storage s = stakes[id][msg.sender];
        uint256 payout;
        if (d.voided) {
            payout = s[0] + s[1];
        } else {
            uint256 mine = s[d.winner];
            if (mine > 0) {
                uint256 total = d.pool[0] + d.pool[1];
                uint256 distributable = total - (total * FEE_BPS) / 10000;
                payout = (distributable * mine) / d.pool[d.winner];
            }
        }
        if (payout == 0) revert NothingToClaim();
        claimed[id][msg.sender] = true;
        (bool ok, ) = msg.sender.call{value: payout}("");
        if (!ok) revert TransferFailed();
        emit Claimed(id, msg.sender, payout);
    }

    function withdrawFees() external onlyOwner {
        uint256 amt = accruedFees;
        accruedFees = 0;
        (bool ok, ) = owner.call{value: amt}("");
        if (!ok) revert TransferFailed();
    }

    function getDebate(uint256 id)
        external
        view
        returns (address creator, string memory topic, uint256 poolA, uint256 poolB, bool resolved, uint8 winner, bool voided)
    {
        Debate storage d = debates[id];
        return (d.creator, d.topic, d.pool[0], d.pool[1], d.resolved, d.winner, d.voided);
    }
}
