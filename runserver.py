"""
This script runs the CarProject application using a development server.
"""
from views import app

DEBUG = False

HOST = '0.0.0.0'
SERVER_PORT = 8000
THREADED = True


if __name__ == '__main__':
    app.run(HOST, port=SERVER_PORT, debug=DEBUG, threaded=THREADED)
