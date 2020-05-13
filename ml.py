from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit

app = Flask(__name__)
#app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)


@app.route('/')
def home():
    return render_template('session.html')


@socketio.on('message')
def handle_my_custom_event(msg):
    print('received msg: ' + msg)
    emit('room',msg,broadcast=True, include_self=False)


if __name__ == '__main__':
    socketio.run(app, debug=True)
