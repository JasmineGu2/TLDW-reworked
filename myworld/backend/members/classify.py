import cohere
from cohere import ClassifyExample
import os

co = cohere.Client('be9hsXdGngivV7mpMBN7toSumRn9mu11YX638ARk')

# Example classification categories
a = 'Core Concept'
b = 'Point'
c = 'Example'
d = 'Definition'
e = 'Remove'

class ClassifyExample:
    def __init__(self, text, label):
        self.text = text
        self.label = label

examples = [
    ClassifyExample(text="Our body is made up of trillions of cells that all require energy made in the mitochondria to function.", label=a),
    ClassifyExample(text="Mitochondria use the oxygen you breathe to make energy for you.", label=a),
    ClassifyExample(text="We will first discuss how to design an interface", label=a),
    ClassifyExample(text="The human body needs energy to move, eat, breathe; chemical energy which is produced in the mitochondria and is called ATP.", label=a),

    ClassifyExample(text="One of the features of an interface is the navigation bar", label=b),
    ClassifyExample(text="Scientists think that mitochondria evolved from bacteria and used to be a separate single-celled organism", label=b),
    ClassifyExample(text="ATP is released by mitochondria, so cells can use it.", label=b),
    ClassifyExample(text="Cells that require more energy contain more mitochondria.", label=b),

    ClassifyExample(text="For example, the mitochondrion uses energy from ATP", label=c),
    ClassifyExample(text="An example of a graph of a non-function is shown here", label=c),
    ClassifyExample(text="John Smith is an example of an important theorist", label=c),
    ClassifyExample(text="Take this cube for example.", label=c),

    ClassifyExample(text="Electrons are stable subatomic particles with a charge of negative electricity, found in all atoms.", label=d),
    ClassifyExample(text="The mitochondria is an organelle found in large numbers in most cells.", label=d),
    ClassifyExample(text="DNA is a self-replicating material.", label=d),
    ClassifyExample(text="Photosynthesis is the process by which plants create energy in the form of sugar.", label=d),

    ClassifyExample(text="Want to learn more? Subscribe to our channel", label=e),
    ClassifyExample(text="Visit our website to learn more", label=e),
    ClassifyExample(text="Please subscribe and like this video", label=e),

    # Wealthsimple-related classifications
    ClassifyExample(text="Wealthsimple is a popular online investment platform in Canada that's been around for exactly one decade now.", label=a),
    ClassifyExample(text="A robo advisor allows you to select your risk level and then fund your account with money, and then an algorithm actually does the rest of the work for you.", label=a),
    ClassifyExample(text="Wealthsimple's original goal was to make passive investing accessible and low cost for the majority of Canadians to get more people started with investing.", label=a),
    ClassifyExample(text="Wealthsimple has three different tiers: Core, Premium, and Generation.", label=a),

    ClassifyExample(text="In 2019, they launched Wealthsimple Trade, which is a self-directed investment platform that allows you to purchase your own stocks and ETFs directly and commission-free.", label=b),
    ClassifyExample(text="Wealthsimple also has a tax filing software called Wealthsimple Tax, and they’re coming out with their own mortgage product as well.", label=b),
    ClassifyExample(text="Wealthsimple’s platform allows you to invest fully on your own, commission-free.", label=b),
    ClassifyExample(text="Premium members have complimentary access to USD accounts, unlike Core members who have to pay a fee.", label=b),

    ClassifyExample(text="For example, if you buy a coffee for $6.50 and have the roundup feature turned on, 50 cents will be sent to your investment account.", label=c),
    ClassifyExample(text="Let's say I have $1,000 to invest and I want to purchase an ETF that’s trading for exactly $30 a share—fractional shares allow me to buy exactly 33.333 shares.", label=c),
    ClassifyExample(text="If you move outside the country, you will have to either keep your Wealthsimple account frozen or transfer your funds to another platform.", label=c),
    ClassifyExample(text="For instance, many platforms in Canada charge up to $10 per trade, whereas Wealthsimple Trade charges nothing.", label=c),

    ClassifyExample(text="A robo advisor is a digital platform that provides automated, algorithm-driven financial planning services with little to no human supervision.", label=d),
    ClassifyExample(text="A TFSA (Tax-Free Savings Account) is a type of investment account where any gains you make are tax-free.", label=d),
    ClassifyExample(text="CDIC (Canada Deposit Insurance Corporation) is a federal crown corporation that insures eligible deposits at member financial institutions.", label=d),
    ClassifyExample(text="Norbert’s Gambit is a currency conversion technique used to minimize exchange fees when converting CAD to USD.", label=d),

    ClassifyExample(text="Want to learn more? Subscribe to our channel.", label=e),
    ClassifyExample(text="Make sure you like and subscribe for more content.", label=e),
    ClassifyExample(text="Comment below if you have any questions!", label=e),
    ClassifyExample(text="Check out our older videos to learn more about managed investing!", label=e),
]

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


def classifyNotes(input_text):
    response = co.classify(
        inputs=input_text,
        examples=examples
    )
    # Extract predictions and corresponding input texts
    predictions = [classification.prediction for classification in response.classifications]
    texts = [classification.input for classification in response.classifications]
    
    return predictions, texts
# Test classification function
inputs = [
    "Confirm your email address",
    "hey i need u to send some $",
]
print(classifyNotes(inputs))
