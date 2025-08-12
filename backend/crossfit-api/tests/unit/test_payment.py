import pytest
import json
from unittest.mock import patch, MagicMock
from src.models.subscription import Subscription, PaymentHistory, db
from src.services.payment_service import PaymentService

class TestPaymentEndpoints:
    """Test payment and subscription endpoints."""
    
    def test_get_plans(self, client):
        """Test getting available subscription plans."""
        response = client.get('/api/payment/plans')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'plans' in data
        assert 'premium' in data['plans']
        assert 'pro' in data['plans']
    
    def test_get_subscription_success(self, client, auth_headers, test_subscription):
        """Test getting user's subscription."""
        response = client.get('/api/payment/subscription', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['subscription']['plan_type'] == 'premium'
        assert data['subscription']['status'] == 'active'
    
    def test_get_subscription_creates_free_plan(self, client, auth_headers, test_user):
        """Test getting subscription creates free plan if none exists."""
        response = client.get('/api/payment/subscription', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['subscription']['plan_type'] == 'free'
        
        # Verify free subscription was created
        subscription = Subscription.query.filter_by(user_id=test_user.id).first()
        assert subscription is not None
        assert subscription.plan_type == 'free'
    
    def test_get_subscription_without_auth(self, client):
        """Test getting subscription without authentication."""
        response = client.get('/api/payment/subscription')
        
        assert response.status_code == 401
    
    @patch('src.services.payment_service.stripe.PaymentIntent.create')
    def test_create_payment_intent_success(self, mock_stripe, client, auth_headers, test_user):
        """Test creating payment intent."""
        mock_intent = MagicMock()
        mock_intent.client_secret = 'pi_test_client_secret'
        mock_intent.status = 'requires_payment_method'
        mock_stripe.return_value = mock_intent
        
        payment_data = {
            'plan_type': 'premium',
            'payment_method_id': 'pm_test_payment_method'
        }
        
        response = client.post('/api/payment/create-payment-intent', 
                             json=payment_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'client_secret' in data
    
    def test_create_payment_intent_missing_plan(self, client, auth_headers):
        """Test creating payment intent without plan type."""
        payment_data = {
            'payment_method_id': 'pm_test_payment_method'
        }
        
        response = client.post('/api/payment/create-payment-intent', 
                             json=payment_data, headers=auth_headers)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'required' in data['error'].lower()
    
    def test_create_payment_intent_invalid_plan(self, client, auth_headers):
        """Test creating payment intent with invalid plan type."""
        payment_data = {
            'plan_type': 'invalid_plan',
            'payment_method_id': 'pm_test_payment_method'
        }
        
        response = client.post('/api/payment/create-payment-intent', 
                             json=payment_data, headers=auth_headers)
        
        assert response.status_code == 500
        data = response.get_json()
        assert data['success'] is False
    
    @patch('src.services.payment_service.stripe.Subscription.create')
    @patch('src.services.payment_service.stripe.Customer.create')
    @patch('src.services.payment_service.stripe.PaymentMethod.attach')
    @patch('src.services.payment_service.stripe.Customer.modify')
    @patch('src.services.payment_service.stripe.Price.create')
    def test_create_subscription_success(self, mock_price, mock_customer_modify, 
                                       mock_payment_attach, mock_customer, 
                                       mock_subscription, client, auth_headers, test_user):
        """Test creating a new subscription."""
        # Mock Stripe responses
        mock_customer.return_value = MagicMock(id='cus_test_customer')
        mock_price.return_value = MagicMock(id='price_test_price')
        mock_stripe_sub = MagicMock()
        mock_stripe_sub.id = 'sub_test_subscription'
        mock_stripe_sub.status = 'active'
        mock_stripe_sub.current_period_start = 1640995200  # 2022-01-01
        mock_stripe_sub.current_period_end = 1643673600    # 2022-02-01
        mock_stripe_sub.latest_invoice.payment_intent.client_secret = 'pi_test_secret'
        mock_subscription.return_value = mock_stripe_sub
        
        subscription_data = {
            'plan_type': 'premium',
            'payment_method_id': 'pm_test_payment_method'
        }
        
        response = client.post('/api/payment/create-subscription', 
                             json=subscription_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'subscription' in data
        assert 'client_secret' in data
    
    def test_create_subscription_missing_fields(self, client, auth_headers):
        """Test creating subscription with missing fields."""
        subscription_data = {
            'plan_type': 'premium'
            # Missing payment_method_id
        }
        
        response = client.post('/api/payment/create-subscription', 
                             json=subscription_data, headers=auth_headers)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'required' in data['error'].lower()
    
    @patch('src.services.payment_service.stripe.Subscription.modify')
    def test_cancel_subscription_success(self, mock_stripe, client, auth_headers, test_subscription):
        """Test canceling subscription."""
        cancel_data = {'immediate': False}
        
        response = client.post('/api/payment/cancel-subscription', 
                             json=cancel_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        # Verify subscription was updated
        subscription = Subscription.query.get(test_subscription.id)
        assert subscription.cancel_at_period_end is True
    
    def test_cancel_subscription_no_subscription(self, client, auth_headers, test_user):
        """Test canceling subscription when none exists."""
        cancel_data = {'immediate': False}
        
        response = client.post('/api/payment/cancel-subscription', 
                             json=cancel_data, headers=auth_headers)
        
        assert response.status_code == 500
        data = response.get_json()
        assert data['success'] is False
    
    def test_check_feature_access_success(self, client, auth_headers, test_subscription):
        """Test checking feature access."""
        feature_data = {'feature': 'ai_generation'}
        
        response = client.post('/api/payment/check-feature-access', 
                             json=feature_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'has_access' in data
        assert data['plan_type'] == 'premium'
    
    def test_check_feature_access_missing_feature(self, client, auth_headers):
        """Test checking feature access without feature name."""
        feature_data = {}
        
        response = client.post('/api/payment/check-feature-access', 
                             json=feature_data, headers=auth_headers)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'required' in data['error'].lower()
    
    def test_get_payment_history_success(self, client, auth_headers, test_user):
        """Test getting payment history."""
        # Create test payment history
        payment = PaymentHistory(
            user_id=test_user.id,
            amount=1999,  # $19.99 in cents
            currency='usd',
            status='succeeded',
            description='Test payment'
        )
        db.session.add(payment)
        db.session.commit()
        
        response = client.get('/api/payment/payment-history', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['payments']) == 1
        assert data['payments'][0]['amount'] == 19.99
        assert data['payments'][0]['status'] == 'succeeded'
    
    def test_get_payment_history_with_limit(self, client, auth_headers, test_user):
        """Test getting payment history with limit."""
        # Create multiple test payments
        for i in range(5):
            payment = PaymentHistory(
                user_id=test_user.id,
                amount=1000 + i,
                currency='usd',
                status='succeeded',
                description=f'Test payment {i}'
            )
            db.session.add(payment)
        db.session.commit()
        
        response = client.get('/api/payment/payment-history?limit=3', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['payments']) == 3
    
    def test_webhook_endpoint_exists(self, client):
        """Test that webhook endpoint exists and handles requests."""
        # Note: Full webhook testing would require proper Stripe signature
        response = client.post('/api/payment/webhook', 
                             data='test_payload',
                             headers={'Stripe-Signature': 'test_signature'})
        
        # Should return 400 due to invalid signature, but endpoint exists
        assert response.status_code == 400

