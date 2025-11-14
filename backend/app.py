from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
# Enable CORS (Cross-Origin Resource Sharing)
# This allows your frontend (on a different 'origin') to make requests to this backend
CORS(app)

# Define an API route for '/api/chat' that only accepts POST requests
@app.route('/api/chat', methods=['POST'])
def chat():
    # 1. Get the message from the incoming JSON request
    data = request.json
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # 2. Log it to the terminal (so we can see it's working)
    print(f"Received message: {user_message}")

    # 3. TODO: Process the message with an AI model
    # For now, we'll just send a simple, hard-coded reply
    bot_reply = f"You said: '{user_message}'"

    # 4. Send the reply back to the frontend in JSON format
    return jsonify({
        'reply': bot_reply
    })

# Run the app on port 5001 in debug mode
if __name__ == '__main__':
    app.run(debug=True, port=5001)