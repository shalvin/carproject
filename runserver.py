"""
This script runs the CarProject application using a development server.
"""
from carproject import app

DEBUG = False

HOST = '0.0.0.0'
SERVER_PORT = 8000


if __name__ == '__main__':
    app.run(HOST, port=SERVER_PORT, debug=DEBUG)
