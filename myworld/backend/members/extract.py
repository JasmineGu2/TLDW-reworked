from .classify import *

def keywordify(preds, array):
    """
    Extracts key definitions/concepts from predictions and removes unnecessary parts.

    Args:
        preds (list): List of predicted labels (e.g., "Definition", "Core Concept", "Remove").
        array (list): The original array of summarized text.

    Returns:
        tuple: (list of extracted keywords, filtered list without removed elements)
    """
    # ✅ 1️⃣ Find indices where the label is "Definition" or "Core Concept"
    indices_def = [i for i, x in enumerate(preds) if x in ["Definition", "Core Concept"]]

    # ✅ 2️⃣ Extract text matching "Definition" or "Core Concept"
    output = [array[i] for i in indices_def]
    
    # ✅ 3️⃣ Extract keywords from the output
    keywords = []
    for i in output:
        print(keywords)
        keywords.append(extract(i))  

    # ✅ 4️⃣ Filter out elements labeled "Remove"
    filtered_array = [array[i] for i in range(len(array)) if preds[i] != "Remove"]
    return keywords, filtered_array
