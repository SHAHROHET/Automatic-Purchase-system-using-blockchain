import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function orderCount() view returns (uint256)",
  "function contractCount() view returns (uint256)",
  "function authorizedUsers(address) view returns (bool)",
  "function setAuthorizedUser(address _user, bool _authorized)",
  "function createPurchaseOrder(string _orderNumber, address _supplier, uint256 _totalAmount, string _metadataHash) returns (uint256)",
  "function approvePurchaseOrder(uint256 _orderId)",
  "function updateOrderStatus(uint256 _orderId, uint8 _newStatus)",
  "function confirmDelivery(uint256 _orderId)",
  "function updatePaymentStatus(uint256 _orderId, uint8 _newStatus)",
  "function createSupplierContract(address _supplier, uint256 _startDate, uint256 _endDate, uint256 _contractValue, string _metadataHash) returns (uint256)",
  "function getOrder(uint256 _orderId) view returns (tuple(uint256 id, string orderNumber, address creator, address supplier, uint256 totalAmount, uint256 createdAt, uint256 updatedAt, uint8 status, uint8 paymentStatus, string metadataHash, bool exists))",
  "function getSupplierOrderIds(address _supplier) view returns (uint256[])",
  "function getOrderIdByNumber(string _orderNumber) view returns (uint256)",
  "event PurchaseOrderCreated(uint256 indexed id, string orderNumber, address indexed creator, address indexed supplier, uint256 totalAmount, uint256 timestamp)",
  "event PurchaseOrderStatusChanged(uint256 indexed id, uint8 oldStatus, uint8 newStatus, address changedBy, uint256 timestamp)",
  "event PurchaseOrderApproved(uint256 indexed id, address indexed approver, uint256 timestamp)",
  "event DeliveryConfirmed(uint256 indexed id, address indexed confirmer, uint256 timestamp)",
  "event SupplierContractCreated(uint256 indexed id, address indexed supplier, uint256 contractValue, uint256 startDate, uint256 endDate)",
];

export const ORDER_STATUS = ['Created', 'Approved', 'Ordered', 'Shipped', 'Delivered', 'Cancelled', 'Disputed'] as const;
export const PAYMENT_STATUS = ['Pending', 'Partial', 'Paid', 'Refunded'] as const;

export function getProvider() {
  const rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS not set in environment variables');
  }
  const providerOrSigner = signerOrProvider || getProvider();
  return new ethers.Contract(contractAddress, CONTRACT_ABI, providerOrSigner);
}

export function getWallet() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY not set');
  }
  return new ethers.Wallet(privateKey, getProvider());
}

export async function recordPurchaseOrder(
  orderNumber: string,
  supplierAddress: string,
  totalAmount: number,
  metadataHash: string
): Promise<string> {
  try {
    const wallet = getWallet();
    const contract = getContract(wallet);
    const amountInWei = ethers.parseEther(totalAmount.toString());
    const tx = await contract.createPurchaseOrder(orderNumber, supplierAddress, amountInWei, metadataHash);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Blockchain recording failed:', error);
    throw error;
  }
}

export async function getBlockchainOrder(orderId: number) {
  try {
    const contract = getContract();
    const order = await contract.getOrder(orderId);
    return {
      id: Number(order.id),
      orderNumber: order.orderNumber,
      creator: order.creator,
      supplier: order.supplier,
      totalAmount: ethers.formatEther(order.totalAmount),
      createdAt: new Date(Number(order.createdAt) * 1000),
      updatedAt: new Date(Number(order.updatedAt) * 1000),
      status: ORDER_STATUS[Number(order.status)],
      paymentStatus: PAYMENT_STATUS[Number(order.paymentStatus)],
      metadataHash: order.metadataHash,
    };
  } catch (error) {
    console.error('Failed to fetch blockchain order:', error);
    throw error;
  }
}

export function hashMetadata(data: Record<string, unknown>): string {
  const json = JSON.stringify(data, Object.keys(data).sort());
  return ethers.keccak256(ethers.toUtf8Bytes(json));
}
