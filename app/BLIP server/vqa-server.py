import base64
from io import BytesIO
from PIL import Image

import torch
from fastapi import FastAPI, Request
import uvicorn

# BLIP imports
from transformers import BlipProcessor, BlipForConditionalGeneration

app = FastAPI()

# Load the BLIP model + processor
model_name = "Salesforce/blip-vqa-base"
processor = BlipProcessor.from_pretrained(model_name)
model = BlipForConditionalGeneration.from_pretrained(model_name)
model.eval()

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

@app.post("/vqa")
async def run_vqa(request: Request):
    data = await request.json()
    question = data["question"]
    image_b64 = data["image"]

    # Decode base64 image
    image_data = base64.b64decode(image_b64)
    image = Image.open(BytesIO(image_data)).convert("RGB")

    # Preprocess inputs
    inputs = processor(image, question, return_tensors="pt").to(device)

    # Generate answer (open-ended)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=40,
            do_sample=True,
            top_p=0.9,
            temperature=0.7
        )
    answer = processor.decode(outputs[0], skip_special_tokens=True)
    print(f"Question: {question}")
    print(f"Answer: {answer}")
    return {"answer": answer}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)