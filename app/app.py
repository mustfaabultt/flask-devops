from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "<h1>Merhaba! 🚀</h1><p>Bu uygulama Docker, Ansible ve GitHub Actions ile Alibaba Cloud'a otomatik olarak deploy edildi.</p>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
