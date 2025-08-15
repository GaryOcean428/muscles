from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.payment_service import PaymentService
from src.models.subscription import Subscription
import logging

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get available subscription plans"""
    try:
        plans = PaymentService.PLANS
        return jsonify({
            'success': True,
            'plans': plans
        }), 200
    except Exception as e:
        logging.error(f"Error getting plans: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get plans'
        }), 500

@payment_bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    """Get current user's subscription information"""
    try:
        user_id = get_jwt_identity()
        subscription = PaymentService.get_subscription_info(user_id)
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict()
        }), 200
    except Exception as e:
        logging.error(f"Error getting subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get subscription'
        }), 500

@payment_bp.route('/create-payment-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
    """Create a payment intent for subscription"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        plan_type = data.get('plan_type')
        payment_method_id = data.get('payment_method_id')
        
        if not plan_type:
            return jsonify({
                'success': False,
                'error': 'Plan type is required'
            }), 400
        
        intent = PaymentService.create_payment_intent(
            user_id=user_id,
            plan_type=plan_type,
            payment_method_id=payment_method_id
        )
        
        return jsonify({
            'success': True,
            'client_secret': intent.client_secret,
            'status': intent.status
        }), 200
        
    except Exception as e:
        logging.error(f"Error creating payment intent: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/create-subscription', methods=['POST'])
@jwt_required()
def create_subscription():
    """Create a new subscription"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        plan_type = data.get('plan_type')
        payment_method_id = data.get('payment_method_id')
        
        if not plan_type or not payment_method_id:
            return jsonify({
                'success': False,
                'error': 'Plan type and payment method are required'
            }), 400
        
        result = PaymentService.create_subscription(
            user_id=user_id,
            plan_type=plan_type,
            payment_method_id=payment_method_id
        )
        
        return jsonify({
            'success': True,
            'subscription': result['subscription'].to_dict(),
            'client_secret': result['client_secret']
        }), 200
        
    except Exception as e:
        logging.error(f"Error creating subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/cancel-subscription', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancel current subscription"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        immediate = data.get('immediate', False)
        
        subscription = PaymentService.cancel_subscription(
            user_id=user_id,
            immediate=immediate
        )
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        logging.error(f"Error canceling subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/reactivate-subscription', methods=['POST'])
@jwt_required()
def reactivate_subscription():
    """Reactivate canceled subscription"""
    try:
        user_id = get_jwt_identity()
        
        subscription = PaymentService.reactivate_subscription(user_id)
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        logging.error(f"Error reactivating subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/payment-history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Get payment history for current user"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 10, type=int)
        
        payments = PaymentService.get_payment_history(user_id, limit)
        
        return jsonify({
            'success': True,
            'payments': [payment.to_dict() for payment in payments]
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting payment history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get payment history'
        }), 500

@payment_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        PaymentService.handle_webhook(payload, sig_header)
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@payment_bp.route('/check-feature-access', methods=['POST'])
@jwt_required()
def check_feature_access():
    """Check if user has access to specific feature"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        feature = data.get('feature')
        if not feature:
            return jsonify({
                'success': False,
                'error': 'Feature name is required'
            }), 400
        
        subscription = PaymentService.get_subscription_info(user_id)
        has_access = subscription.can_access_feature(feature)
        
        return jsonify({
            'success': True,
            'has_access': has_access,
            'plan_type': subscription.plan_type,
            'feature': feature
        }), 200
        
    except Exception as e:
        logging.error(f"Error checking feature access: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to check feature access'
        }), 500

@payment_bp.route('/upgrade-plan', methods=['POST'])
@jwt_required()
def upgrade_plan():
    """Upgrade to a higher plan"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        new_plan_type = data.get('plan_type')
        payment_method_id = data.get('payment_method_id')
        
        if not new_plan_type:
            return jsonify({
                'success': False,
                'error': 'New plan type is required'
            }), 400
        
        # Get current subscription
        current_subscription = PaymentService.get_subscription_info(user_id)
        
        # If user has an active paid subscription, we need to modify it
        if current_subscription.stripe_subscription_id:
            # This would involve prorating and updating the Stripe subscription
            # For simplicity, we'll cancel the old one and create a new one
            PaymentService.cancel_subscription(user_id, immediate=True)
        
        # Create new subscription
        result = PaymentService.create_subscription(
            user_id=user_id,
            plan_type=new_plan_type,
            payment_method_id=payment_method_id
        )
        
        return jsonify({
            'success': True,
            'subscription': result['subscription'].to_dict(),
            'client_secret': result.get('client_secret')
        }), 200
        
    except Exception as e:
        logging.error(f"Error upgrading plan: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

