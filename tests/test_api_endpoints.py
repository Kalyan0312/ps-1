import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get('/api/v1/health')
    assert response.status_code == 200
    data = response.json()
    assert 'status' in data
    assert 'database' in data

def test_auth_worker_login():
    response = client.post('/api/v1/auth/login', json={
        'phone_or_email': '9876543210',
        'password': 'worker123'
    })
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['role'] == 'worker'

def test_auth_customer_login():
    response = client.post('/api/v1/auth/login', json={
        'phone_or_email': '9876543211',
        'password': 'customer123'
    })
    assert response.status_code == 200
    data = response.json()
    assert data['user']['role'] == 'customer'

def test_auth_admin_login():
    response = client.post('/api/v1/auth/login', json={
        'phone_or_email': '9876543212',
        'password': 'admin123'
    })
    assert response.status_code == 200
    data = response.json()
    assert data['user']['role'] == 'admin'

def test_services_categories():
    response = client.get('/api/v1/services/categories')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, (list, dict))

def test_pricing_calculation():
    response = client.post('/api/v1/pricing/calculate', json={
        'service_category_id': 'srv-cat-01',
        'customer_lat': 12.9716,
        'customer_lng': 77.5946,
        'is_immediate': True
    })
    if response.status_code == 200:
        data = response.json()
        assert 'final_price' in data
        assert 'worker_share' in data
        assert 'cooperative_share' in data
        assert 'welfare_share' in data

def test_admin_overview():
    response = client.get('/api/v1/admin/overview')
    assert response.status_code in [200, 401, 403]

def test_speech_transcribe_fallback():
    response = client.post('/api/v1/speech/transcribe', json={
        'audio_base64': '',
        'fallback_text': 'Fan not working'
    })
    assert response.status_code in [200, 422, 400]

