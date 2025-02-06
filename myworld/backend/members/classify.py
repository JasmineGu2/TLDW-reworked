import cohere

co = cohere.Client('be9hsXdGngivV7mpMBN7toSumRn9mu11YX638ARk') # This is your trial API key

def extract(example):
    extraction = co.generate(
        model="command",
        prompt=f"Extract only the most relevant keywords from the following text. Return only the keywords, separated by commas:\n\n{example}",
        max_tokens=15,  # Allow slightly more tokens for multiple keywords
        temperature=0.1,
        stop_sequences=["\n"]
    )
    print(extraction)
    
    # Ensure clean keyword extraction
    return extraction.generations[0].text.strip().replace("Here are the important keywords extracted from the text:", "").strip()

def classify_notes(input_text):
    response = co.classify(
        model='94052cb8-787a-41f9-ae85-5142464e70d2-ft',
        inputs=input_text
    )
    
    # Extract predictions and corresponding input texts
    predictions = [classification.prediction for classification in response.classifications]
    texts = [classification.input for classification in response.classifications]
    
    return predictions, texts

# Example usage
inputs = [
    "Confirm your email address",
    "hey i need u to send some $",
]

print(classify_notes(inputs))
