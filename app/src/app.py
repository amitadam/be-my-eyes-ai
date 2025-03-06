from flask import Flask, request, render_template, Response
import requests

app = Flask(__name__)

# VQA server URL
VQA_SERVER_URL = "http://localhost:8000/vqa"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/describe', methods=['POST'])
def describe():
    encoded_string = request.json.get('image', '')
    # Default prompt for general description
    question = "Describe the image briefly and accurately."

    # Send to VQA server
    payload = {"question": question, "image": encoded_string}
    response = requests.post(VQA_SERVER_URL, json=payload)
    
    # Parse the server response
    vqa_data = response.json()
    answer = vqa_data.get("answer", "No answer found.")
    
    return answer

@app.route('/recordPrompt', methods=['POST'])
def record_prompt():
    data = request.json
    question = data.get('prompt', 'Describe the image briefly and accurately.') # Default prompt if not provided
    encoded_string = data.get('image', '')

    # Send to VQA server
    payload = {"question": question, "image": encoded_string}
    response = requests.post(VQA_SERVER_URL, json=payload)
    
    vqa_data = response.json()
    answer = vqa_data.get("answer", "No answer found.")
    
    return answer

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')