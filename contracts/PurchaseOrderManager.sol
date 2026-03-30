// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PurchaseOrderManager
 * @dev Smart contract for WADEIN Automated Purchase Order Management System
 * Manages purchase orders and supplier contracts on the Ethereum blockchain
 */
contract PurchaseOrderManager {
    address public owner;
    uint256 public orderCount;
    uint256 public contractCount;

    mapping(address => bool) public authorizedUsers;

    enum OrderStatus { Created, Approved, Ordered, Shipped, Delivered, Cancelled, Disputed }
    enum PaymentStatus { Pending, Partial, Paid, Refunded }

    struct PurchaseOrder {
        uint256 id;
        string orderNumber;
        address creator;
        address supplier;
        uint256 totalAmount;
        uint256 createdAt;
        uint256 updatedAt;
        OrderStatus status;
        PaymentStatus paymentStatus;
        string metadataHash;
        bool exists;
    }

    struct SupplierContract {
        uint256 id;
        address supplier;
        uint256 startDate;
        uint256 endDate;
        uint256 contractValue;
        string metadataHash;
        bool exists;
    }

    mapping(uint256 => PurchaseOrder) public orders;
    mapping(string => uint256) public orderNumberToId;
    mapping(address => uint256[]) public supplierOrders;
    mapping(uint256 => SupplierContract) public supplierContracts;

    event PurchaseOrderCreated(
        uint256 indexed id,
        string orderNumber,
        address indexed creator,
        address indexed supplier,
        uint256 totalAmount,
        uint256 timestamp
    );

    event PurchaseOrderStatusChanged(
        uint256 indexed id,
        OrderStatus oldStatus,
        OrderStatus newStatus,
        address changedBy,
        uint256 timestamp
    );

    event PurchaseOrderApproved(
        uint256 indexed id,
        address indexed approver,
        uint256 timestamp
    );

    event DeliveryConfirmed(
        uint256 indexed id,
        address indexed confirmer,
        uint256 timestamp
    );

    event SupplierContractCreated(
        uint256 indexed id,
        address indexed supplier,
        uint256 contractValue,
        uint256 startDate,
        uint256 endDate
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: owner only");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedUsers[msg.sender],
            "Not authorized"
        );
        _;
    }

    modifier orderExists(uint256 _orderId) {
        require(orders[_orderId].exists, "Order does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUsers[msg.sender] = true;
    }

    function setAuthorizedUser(address _user, bool _authorized) external onlyOwner {
        authorizedUsers[_user] = _authorized;
    }

    function createPurchaseOrder(
        string calldata _orderNumber,
        address _supplier,
        uint256 _totalAmount,
        string calldata _metadataHash
    ) external onlyAuthorized returns (uint256) {
        require(bytes(_orderNumber).length > 0, "Order number required");
        require(_supplier != address(0), "Valid supplier address required");
        require(orderNumberToId[_orderNumber] == 0, "Order number already exists");

        orderCount++;
        uint256 newId = orderCount;

        orders[newId] = PurchaseOrder({
            id: newId,
            orderNumber: _orderNumber,
            creator: msg.sender,
            supplier: _supplier,
            totalAmount: _totalAmount,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            status: OrderStatus.Created,
            paymentStatus: PaymentStatus.Pending,
            metadataHash: _metadataHash,
            exists: true
        });

        orderNumberToId[_orderNumber] = newId;
        supplierOrders[_supplier].push(newId);

        emit PurchaseOrderCreated(
            newId,
            _orderNumber,
            msg.sender,
            _supplier,
            _totalAmount,
            block.timestamp
        );

        return newId;
    }

    function approvePurchaseOrder(uint256 _orderId)
        external
        onlyAuthorized
        orderExists(_orderId)
    {
        PurchaseOrder storage order = orders[_orderId];
        require(order.status == OrderStatus.Created, "Order must be in Created status");

        OrderStatus oldStatus = order.status;
        order.status = OrderStatus.Approved;
        order.updatedAt = block.timestamp;

        emit PurchaseOrderApproved(_orderId, msg.sender, block.timestamp);
        emit PurchaseOrderStatusChanged(
            _orderId,
            oldStatus,
            OrderStatus.Approved,
            msg.sender,
            block.timestamp
        );
    }

    function updateOrderStatus(uint256 _orderId, OrderStatus _newStatus)
        external
        onlyAuthorized
        orderExists(_orderId)
    {
        PurchaseOrder storage order = orders[_orderId];
        OrderStatus oldStatus = order.status;
        order.status = _newStatus;
        order.updatedAt = block.timestamp;

        emit PurchaseOrderStatusChanged(
            _orderId,
            oldStatus,
            _newStatus,
            msg.sender,
            block.timestamp
        );
    }

    function confirmDelivery(uint256 _orderId)
        external
        onlyAuthorized
        orderExists(_orderId)
    {
        PurchaseOrder storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Shipped || order.status == OrderStatus.Ordered,
            "Order must be Shipped or Ordered"
        );

        OrderStatus oldStatus = order.status;
        order.status = OrderStatus.Delivered;
        order.updatedAt = block.timestamp;

        emit DeliveryConfirmed(_orderId, msg.sender, block.timestamp);
        emit PurchaseOrderStatusChanged(
            _orderId,
            oldStatus,
            OrderStatus.Delivered,
            msg.sender,
            block.timestamp
        );
    }

    function updatePaymentStatus(uint256 _orderId, PaymentStatus _newStatus)
        external
        onlyAuthorized
        orderExists(_orderId)
    {
        orders[_orderId].paymentStatus = _newStatus;
        orders[_orderId].updatedAt = block.timestamp;
    }

    function createSupplierContract(
        address _supplier,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _contractValue,
        string calldata _metadataHash
    ) external onlyAuthorized returns (uint256) {
        require(_supplier != address(0), "Valid supplier address required");
        require(_endDate > _startDate, "End date must be after start date");

        contractCount++;
        uint256 newId = contractCount;

        supplierContracts[newId] = SupplierContract({
            id: newId,
            supplier: _supplier,
            startDate: _startDate,
            endDate: _endDate,
            contractValue: _contractValue,
            metadataHash: _metadataHash,
            exists: true
        });

        emit SupplierContractCreated(
            newId,
            _supplier,
            _contractValue,
            _startDate,
            _endDate
        );

        return newId;
    }

    function getOrder(uint256 _orderId)
        external
        view
        orderExists(_orderId)
        returns (PurchaseOrder memory)
    {
        return orders[_orderId];
    }

    function getSupplierOrderIds(address _supplier)
        external
        view
        returns (uint256[] memory)
    {
        return supplierOrders[_supplier];
    }

    function getOrderIdByNumber(string calldata _orderNumber)
        external
        view
        returns (uint256)
    {
        return orderNumberToId[_orderNumber];
    }
}
