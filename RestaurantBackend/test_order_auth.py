import json
import urllib.request
import urllib.error
import time

BASE = 'http://127.0.0.1:8000'

# create a test user
username = f'testuser_{int(time.time())}'
user_data = {'username': username, 'email': f'{username}@example.com', 'password': 'Password123!'}
req = urllib.request.Request(BASE + '/api/register/', data=json.dumps(user_data).encode(), headers={'Content-Type': 'application/json'})
try:
    r = urllib.request.urlopen(req)
    print('REGISTER', r.getcode(), r.read().decode())
except urllib.error.HTTPError as e:
    print('REGISTER ERROR', e.code)
    print(e.read().decode())
    raise

# get a token
token_req = urllib.request.Request(BASE + '/api/token/', data=json.dumps({'username': username, 'password': 'Password123!'}).encode(), headers={'Content-Type': 'application/json'})
try:
    r = urllib.request.urlopen(token_req)
    token_data = json.loads(r.read().decode())
    print('TOKEN', r.getcode(), token_data)
except urllib.error.HTTPError as e:
    print('TOKEN ERROR', e.code)
    print(e.read().decode())
    raise

access = token_data['access']

# fetch foods
try:
    r = urllib.request.urlopen(BASE + '/api/foods/')
    foods = json.loads(r.read().decode())
    print('FOODS', len(foods), foods[:3])
except Exception as e:
    print('FOODS ERROR', e)
    raise

if not foods:
    raise SystemExit('No foods to order')

food_id = foods[0]['id']

order_data = {'food': food_id, 'quantity': 1, 'total_price': '9.99'}
req = urllib.request.Request(BASE + '/api/orders/', data=json.dumps(order_data).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {access}'})
try:
    r = urllib.request.urlopen(req)
    print('POST ORDER', r.getcode(), r.read().decode())
except urllib.error.HTTPError as e:
    print('POST ORDER ERROR', e.code)
    print(e.read().decode())
except Exception as e:
    print('POST ORDER EXCEPTION', e)
