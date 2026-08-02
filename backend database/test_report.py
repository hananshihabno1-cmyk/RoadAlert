import requests

url = 'http://127.0.0.1:8000/report'
files = {'image': ('test.jpg', b'dummy content', 'image/jpeg')}
data = {'latitude': 37.7749, 'longitude': -122.4194}
r = requests.post(url, files=files, data=data)
print(r.status_code, r.text)
