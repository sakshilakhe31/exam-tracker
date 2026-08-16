/* ============================================================
   Built-in question bank — SSC/Banking style, verified questions.
   Used as the default, always-available source for mock tests.
   Format: { q, options: [4 strings], answer: index of correct option }
   ============================================================ */

const QUESTION_BANK = {
  quant: [
    { q: "What is 15% of 400?", options: ["45", "50", "60", "65"], answer: 2 },
    { q: "The average of 5 numbers is 20. If one number is excluded, the average of the remaining 4 becomes 18. What is the excluded number?", options: ["24", "26", "28", "30"], answer: 2 },
    { q: "A shopkeeper sells an item for ₹450, making a profit of 20%. What was the cost price?", options: ["₹350", "₹360", "₹375", "₹380"], answer: 2 },
    { q: "Simple interest on ₹2000 at 5% per annum for 3 years is:", options: ["₹250", "₹300", "₹320", "₹350"], answer: 1 },
    { q: "The ratio of two numbers is 3:4 and their sum is 84. What is the smaller number?", options: ["30", "36", "40", "48"], answer: 1 },
    { q: "A train travels 300 km in 5 hours. What is its speed in km/h?", options: ["50", "55", "60", "65"], answer: 2 },
    { q: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "24"], answer: 2 },
    { q: "If x + 5 = 12, what is the value of x?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "40% of a number is 80. What is the number?", options: ["150", "180", "200", "220"], answer: 2 },
    { q: "What is the square root of 144?", options: ["10", "11", "12", "14"], answer: 2 },
  ],
  reasoning: [
    { q: "Find the odd one out:", options: ["Apple", "Banana", "Carrot", "Mango"], answer: 2 },
    { q: "Complete the series: 2, 4, 6, 8, ?", options: ["9", "10", "11", "12"], answer: 1 },
    { q: "Find the odd one out:", options: ["Circle", "Square", "Triangle", "Sphere"], answer: 3 },
    { q: "Complete the series: 3, 6, 12, 24, ?", options: ["40", "44", "48", "50"], answer: 2 },
    { q: "Complete the series: A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: 1 },
    { q: "If 'CAT' is coded as 'DBU' (each letter shifted +1), how is 'DOG' coded?", options: ["EPH", "EPG", "DPH", "EPI"], answer: 0 },
    { q: "Find the missing number: 5, 10, 20, 40, ?", options: ["70", "75", "80", "85"], answer: 2 },
    { q: "Which number comes next: 1, 4, 9, 16, 25, ?", options: ["30", "32", "34", "36"], answer: 3 },
    { q: "Statement: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly. Is this definitely true?", options: ["True", "False", "Cannot be determined", "None of these"], answer: 2 },
    { q: "Complete the series: 1, 1, 2, 3, 5, 8, ?", options: ["10", "11", "13", "15"], answer: 2 },
  ],
  english: [
    { q: "Choose the correct synonym of 'Happy':", options: ["Sad", "Joyful", "Angry", "Tired"], answer: 1 },
    { q: "Choose the correct antonym of 'Increase':", options: ["Decrease", "Grow", "Expand", "Rise"], answer: 0 },
    { q: "Fill in the blank: She ____ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1 },
    { q: "Identify the correctly spelled word:", options: ["Recieve", "Receive", "Receeve", "Receve"], answer: 1 },
    { q: "Choose the correct plural of 'Child':", options: ["Childs", "Childes", "Children", "Childrens"], answer: 2 },
    { q: "Choose the correct synonym of 'Begin':", options: ["End", "Start", "Stop", "Finish"], answer: 1 },
    { q: "Choose the correct article: ___ apple a day keeps the doctor away.", options: ["A", "An", "The", "No article"], answer: 1 },
    { q: "Choose the correct antonym of 'Difficult':", options: ["Easy", "Hard", "Tough", "Complex"], answer: 0 },
    { q: "Choose the correctly punctuated sentence:", options: ["Lets eat Grandma", "Let's eat, Grandma", "Lets eat, grandma,", "Let's eat grandma"], answer: 1 },
    { q: "In the sentence 'She sings beautifully,' what part of speech is 'beautifully'?", options: ["Noun", "Verb", "Adjective", "Adverb"], answer: 3 },
  ],
  gk: [
    { q: "What is the capital of India?", options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], answer: 1 },
    { q: "Who is known as the Father of the Nation in India?", options: ["Jawaharlal Nehru", "Sardar Patel", "Mahatma Gandhi", "B.R. Ambedkar"], answer: 2 },
    { q: "Which is the longest river in India?", options: ["Yamuna", "Godavari", "Ganga", "Brahmaputra"], answer: 2 },
    { q: "What is the national bird of India?", options: ["Sparrow", "Peacock", "Eagle", "Parrot"], answer: 1 },
    { q: "How many states does India currently have?", options: ["26", "27", "28", "29"], answer: 2 },
    { q: "Who was the first Prime Minister of India?", options: ["Jawaharlal Nehru", "Lal Bahadur Shastri", "Indira Gandhi", "Rajendra Prasad"], answer: 0 },
    { q: "What is the currency of India?", options: ["Rupee", "Dollar", "Dinar", "Taka"], answer: 0 },
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
    { q: "What is the national animal of India?", options: ["Lion", "Elephant", "Tiger", "Leopard"], answer: 2 },
    { q: "RBI stands for:", options: ["Reserve Bank of India", "Regional Bank of India", "Rural Bank of India", "Republic Bank of India"], answer: 0 },
  ],
};
