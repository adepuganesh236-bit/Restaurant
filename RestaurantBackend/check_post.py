import urllib.request, urllib.error, json
url = 'http://127.0.0.1:8000/api/orders/'
payload = {"user":1,"food":1,"quantity":1,"total_price":"9.99"}
data = json.dumps(payload).encode()
req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
try:
    r = urllib.request.urlopen(req)
    print('POST', r.getcode())
    print(r.read().decode())
except urllib.error.HTTPError as e:
    print('POST HTTPError', e.code)
    try:
        print(e.read().decode())
    except:
        pass
except Exception as e:
    print('POST ERROR', e)
