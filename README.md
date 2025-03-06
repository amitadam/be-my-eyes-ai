Be My Eyes AI Tool

Be My Eyes AI is a lightweight web application designed to assist visually impaired users by analyzing their surroundings through image captioning and question answering using the BLIP model.

Features
- Capture a snapshot from a live video feed and receive a descriptive analysis.
- Ask specific questions about the captured image using voice commands.
- Listen to the generated description using text-to-speech.
- Lightweight backend powered by Flask for handling HTTP requests.
- User-friendly frontend built with HTML, CSS, and JavaScript.
- BLIP model for processing images, generating captions, and responding to visual questions.

Installation

1. Clone the repository:
   git clone https://github.com/yourusername/be-my-eyes-ai.git
   cd be-my-eyes-ai

2. Install dependencies:
   pip install -r requirements.txt

3. Start the BLIP model server (from the project root):
   python app/BLIP_server/vqa-server.py

4. Run the web application (from the project root):
   python app/src/app.py

5. Open the web app in a browser:
   http://127.0.0.1:5000

Future Improvements
- Enhance the UI/UX for better accessibility and user experience.
- Optimize model performance (currently using Salesforce/blip-vqa-base for runtime and testing).
- Expand functionality with additional AI-powered assistive features.
