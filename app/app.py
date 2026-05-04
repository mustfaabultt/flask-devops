from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return """
    <html>
        <head>
            <title>DevOps Projesi</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
                h1 { color: #1a73e8; margin-bottom: 0.5rem; }
                p { color: #5f6368; line-height: 1.6; }
                .status { display: inline-block; padding: 5px 15px; background: #34a853; color: white; border-radius: 20px; font-size: 0.9rem; margin-top: 1rem; }
                .tech-stack { margin-top: 1.5rem; font-size: 0.8rem; color: #9aa0a6; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>DevOps Pipeline Başarılı! 🚀</h1>
                <p>Bu uygulama <b>Docker</b>, <b>Ansible</b> ve <b>GitHub Actions</b> kullanılarak otomatik olarak <b>Alibaba Cloud</b> üzerine deploy edilmiştir.</p>
                <div class="status">● Sistem Çevrimiçi</div>
                <div class="tech-stack">Flask | Docker | Ansible | GitHub Actions | Alibaba Cloud</div>
            </div>
        </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
