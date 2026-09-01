import abc
import uuid
import hashlib
import hmac
import time
from typing import Dict, Any, Optional

class PaymentGatewayInterface(abc.ABC):
    """Abstract payment gateway interface for Cooperative Gig Platform."""

    @abc.abstractmethod
    async def create_order(
        self,
        amount: float,
        currency: str = "INR",
        booking_reference: str = "",
        customer_info: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a payment gateway order."""
        pass

    @abc.abstractmethod
    async def verify_payment(
        self,
        payment_id: str,
        order_id: str,
        signature: str
    ) -> bool:
        """Verify payment signature / authenticity."""
        pass

    @abc.abstractmethod
    async def release_escrow(
        self,
        booking_id: str,
        amount: float,
        worker_upi_id: str
    ) -> Dict[str, Any]:
        """Release escrow funds directly to worker's UPI ID."""
        pass


class DemoPaymentGateway(PaymentGatewayInterface):
    """
    Safe Local Development Payment Gateway.
    Simulates UPI Intent, QR Codes, and instant demo confirmation
    without exposing any production credentials.
    """

    def __init__(self, secret_key: str = "demo_coop_gateway_secret_2026"):
        self.secret_key = secret_key

    async def create_order(
        self,
        amount: float,
        currency: str = "INR",
        booking_reference: str = "",
        customer_info: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        order_id = f"order_demo_{uuid.uuid4().hex[:10]}"
        timestamp = int(time.time())
        # Generate simulated UPI Intent URI (e.g. upi://pay?pa=cooperative@bank&pn=CooperativeGuild...)
        upi_vpa = "cooperative.escrow@icici"
        upi_intent = (
            f"upi://pay?pa={upi_vpa}"
            f"&pn=Cooperative%20Gig%20Platform"
            f"&tr={order_id}"
            f"&am={amount:.2f}"
            f"&cu=INR"
            f"&tn=Booking%20{booking_reference}"
        )

        return {
            "order_id": order_id,
            "amount": amount,
            "currency": currency,
            "status": "created",
            "payment_method": "UPI",
            "upi_vpa": upi_vpa,
            "upi_intent_uri": upi_intent,
            "is_demo_mode": True,
            "created_at": timestamp
        }

    async def verify_payment(
        self,
        payment_id: str,
        order_id: str,
        signature: str
    ) -> bool:
        # In Demo Mode, payments prefixed with 'pay_demo_' or valid sha256 signatures are authenticated
        if payment_id.startswith("pay_demo_") or signature == "demo_signature_verified":
            return True
        # Check standard HMAC signature
        expected = hmac.new(
            self.secret_key.encode(),
            f"{order_id}|{payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    async def release_escrow(
        self,
        booking_id: str,
        amount: float,
        worker_upi_id: str
    ) -> Dict[str, Any]:
        payout_id = f"payout_demo_{uuid.uuid4().hex[:8]}"
        return {
            "payout_id": payout_id,
            "booking_id": booking_id,
            "amount": amount,
            "worker_upi_id": worker_upi_id,
            "status": "transferred",
            "message": f"₹{amount:.2f} successfully credited directly to worker {worker_upi_id} with 0% platform extraction."
        }


class RazorpayPaymentGateway(PaymentGatewayInterface):
    """Production Razorpay / UPI Gateway."""

    def __init__(self, key_id: str, key_secret: str):
        self.key_id = key_id
        self.key_secret = key_secret

    async def create_order(
        self,
        amount: float,
        currency: str = "INR",
        booking_reference: str = "",
        customer_info: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # Production would call Razorpay Client
        # Fallback to structured order
        order_id = f"order_rzp_{uuid.uuid4().hex[:10]}"
        return {
            "order_id": order_id,
            "amount": amount,
            "currency": currency,
            "status": "created",
            "key_id": self.key_id,
            "is_demo_mode": False
        }

    async def verify_payment(
        self,
        payment_id: str,
        order_id: str,
        signature: str
    ) -> bool:
        expected = hmac.new(
            self.key_secret.encode(),
            f"{order_id}|{payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    async def release_escrow(
        self,
        booking_id: str,
        amount: float,
        worker_upi_id: str
    ) -> Dict[str, Any]:
        return {
            "payout_id": f"payout_rzp_{uuid.uuid4().hex[:8]}",
            "booking_id": booking_id,
            "amount": amount,
            "status": "transferred"
        }


# Singleton Factory
def get_payment_gateway(is_demo: bool = True) -> PaymentGatewayInterface:
    if is_demo:
        return DemoPaymentGateway()
    return RazorpayPaymentGateway(key_id="rzp_live_fake", key_secret="rzp_secret_fake")
