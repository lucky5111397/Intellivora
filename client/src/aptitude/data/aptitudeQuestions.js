const aptitudeQuestions = [
  // Percentage (5)
  {
    id: 'pct-1',
    topicId: 'percentage',
    question: 'If A\'s salary is 20% less than B\'s salary, by how much percent is B\'s salary more than A\'s?',
    options: ['20%', '25%', '33.33%', '16.66%'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'If B = 100, A = 80. B is 20 more than A. Percentage = (20/80) * 100 = 25%.'
  },
  {
    id: 'pct-2',
    topicId: 'percentage',
    question: 'The price of sugar increases by 25%. By what percentage must a householder reduce the consumption of sugar so that there is no increase in the expenditure?',
    options: ['20%', '25%', '16.66%', '15%'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'Reduction % = (r / (100 + r)) * 100 = (25 / 125) * 100 = 20%.'
  },
  {
    id: 'pct-3',
    topicId: 'percentage',
    question: 'In an election between two candidates, one got 55% of the total valid votes, 20% of the votes were invalid. If the total number of votes was 7500, the number of valid votes that the other candidate got was:',
    options: ['2700', '2900', '3000', '3100'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Total valid votes = 80% of 7500 = 6000. 1st candidate got 55% of 6000. 2nd candidate got 45% of 6000 = (45/100) * 6000 = 2700.'
  },
  {
    id: 'pct-4',
    topicId: 'percentage',
    question: 'A student has to obtain 33% of the total marks to pass. He got 125 marks and failed by 40 marks. The maximum marks are:',
    options: ['300', '400', '500', '600'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'Passing marks = 125 + 40 = 165. Let max marks be x. 33% of x = 165 => x = (165 * 100) / 33 = 500.'
  },
  {
    id: 'pct-5',
    topicId: 'percentage',
    question: 'Due to a 20% reduction in the price of wheat, Ram is able to buy 5 kg more for Rs. 320. Find the original rate of wheat.',
    options: ['Rs. 16/kg', 'Rs. 18/kg', 'Rs. 20/kg', 'Rs. 25/kg'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Let original price be P. New price = 0.8P. 320/0.8P - 320/P = 5 => P = 16.'
  },

  // Number System (5)
  {
    id: 'ns-1',
    topicId: 'number-system',
    question: 'What is the sum of the first 50 odd natural numbers?',
    options: ['2500', '2550', '2450', '2600'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: 'Sum of first n odd natural numbers is n^2. So, 50^2 = 2500.'
  },
  {
    id: 'ns-2',
    topicId: 'number-system',
    question: 'Find the unit digit in the product (2467)^153 * (341)^72.',
    options: ['1', '3', '7', '9'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'Unit digit of (2467)^153 is same as 7^153. 153 = 4 * 38 + 1. So 7^1 = 7. Unit digit of 341^72 is 1. 7 * 1 = 7.'
  },
  {
    id: 'ns-3',
    topicId: 'number-system',
    question: 'What is the largest number that exactly divides 24, 36, and 60?',
    options: ['6', '8', '12', '24'],
    correctAnswer: 2,
    difficulty: 'Easy',
    explanation: 'HCF of 24, 36, 60 is 12.'
  },
  {
    id: 'ns-4',
    topicId: 'number-system',
    question: 'A number when divided by 899 gives a remainder 63. If the same number is divided by 29, the remainder will be:',
    options: ['2', '4', '5', '10'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'Number = 899q + 63. Since 899 is divisible by 29 (29 * 31 = 899), we just divide 63 by 29. 63 = 29 * 2 + 5. Remainder is 5.'
  },
  {
    id: 'ns-5',
    topicId: 'number-system',
    question: 'Find the total number of prime factors in the expression (4)^11 * (7)^5 * (11)^2.',
    options: ['18', '29', '32', '28'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: '(4)^11 = (2^2)^11 = 2^22. So, 2^22 * 7^5 * 11^2. Number of prime factors = 22 + 5 + 2 = 29.'
  },

  // Profit & Loss (5)
  {
    id: 'pl-1',
    topicId: 'profit-loss',
    question: 'A person sold a watch for Rs. 575, thereby making a profit of 15%. What was the cost price of the watch?',
    options: ['Rs. 500', 'Rs. 450', 'Rs. 480', 'Rs. 550'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: 'CP = (SP * 100) / (100 + Profit%) = (575 * 100) / 115 = 500.'
  },
  {
    id: 'pl-2',
    topicId: 'profit-loss',
    question: 'If the cost price of 15 articles is equal to the selling price of 12 articles, find the profit percent.',
    options: ['20%', '25%', '30%', '33.33%'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Let CP of 1 article = 1. CP of 12 = 12. SP of 12 = 15. Profit = 3. Profit % = (3/12) * 100 = 25%.'
  },
  {
    id: 'pl-3',
    topicId: 'profit-loss',
    question: 'A shopkeeper marks his goods 20% above the cost price and allows a discount of 10%. What is his gain percent?',
    options: ['8%', '10%', '12%', '15%'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'Let CP = 100. MP = 120. SP = 90% of 120 = 108. Gain = 8%.'
  },
  {
    id: 'pl-4',
    topicId: 'profit-loss',
    question: 'A dishonest dealer professes to sell his goods at cost price, but he uses a weight of 900g for the kg weight. Find his gain percent.',
    options: ['10%', '11.11%', '9%', '12.5%'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'Gain % = (Error / (True Weight - Error)) * 100 = (100 / 900) * 100 = 11.11%.'
  },
  {
    id: 'pl-5',
    topicId: 'profit-loss',
    question: 'A man buys 2 articles for Rs. 4000 each. He sells one at a gain of 10% and the other at a loss of 10%. Find his total gain or loss percent.',
    options: ['1% loss', '1% gain', 'No profit no loss', '2% loss'],
    correctAnswer: 2,
    difficulty: 'Hard',
    explanation: 'Since CP is same for both, total CP = 8000. Total SP = 4000(1.1) + 4000(0.9) = 4400 + 3600 = 8000. No profit no loss.'
  },

  // Ratio & Proportion (5)
  {
    id: 'rp-1',
    topicId: 'ratio-proportion',
    question: 'If A : B = 3 : 4 and B : C = 8 : 9, then A : C is:',
    options: ['1 : 2', '2 : 3', '3 : 2', '1 : 3'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: '(A/B) * (B/C) = (3/4) * (8/9) = 6/9 = 2/3.'
  },
  {
    id: 'rp-2',
    topicId: 'ratio-proportion',
    question: 'Rs. 1200 is divided among A, B, C in the ratio 2 : 3 : 5. What is B\'s share?',
    options: ['Rs. 240', 'Rs. 360', 'Rs. 600', 'Rs. 400'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'Total parts = 2 + 3 + 5 = 10. B\'s share = (3/10) * 1200 = 360.'
  },
  {
    id: 'rp-3',
    topicId: 'ratio-proportion',
    question: 'Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new numbers are in the ratio 12 : 23. The smaller number is:',
    options: ['27', '33', '49', '55'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Let numbers be 3x and 5x. (3x - 9)/(5x - 9) = 12/23. 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller number = 33.'
  },
  {
    id: 'rp-4',
    topicId: 'ratio-proportion',
    question: 'A mixture contains alcohol and water in the ratio 4 : 3. If 5 liters of water is added to the mixture, the ratio becomes 4 : 5. The quantity of alcohol in the given mixture is:',
    options: ['10 L', '12 L', '15 L', '18 L'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Alcohol = 4x, Water = 3x. 4x / (3x + 5) = 4 / 5 => 20x = 12x + 20 => 8x = 20 => x = 2.5. Alcohol = 4(2.5) = 10L.'
  },
  {
    id: 'rp-5',
    topicId: 'ratio-proportion',
    question: 'The ratio of incomes of A and B is 5 : 4 and the ratio of their expenditures is 3 : 2. If each saves Rs. 800, what is A\'s income?',
    options: ['Rs. 1600', 'Rs. 2000', 'Rs. 2400', 'Rs. 3000'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: '5x - 3y = 800 and 4x - 2y = 800. Solving, x = 400, y = 400. A\'s income = 5x = 2000.'
  },

  // Average (5)
  {
    id: 'avg-1',
    topicId: 'average',
    question: 'The average of 5 consecutive numbers is 23. The largest of these numbers is:',
    options: ['24', '25', '26', '27'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'The numbers are 21, 22, 23, 24, 25. The largest is 25.'
  },
  {
    id: 'avg-2',
    topicId: 'average',
    question: 'The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What is the weight of the new person?',
    options: ['75 kg', '80 kg', '85 kg', '90 kg'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'Total increase = 8 * 2.5 = 20 kg. New person\'s weight = 65 + 20 = 85 kg.'
  },
  {
    id: 'avg-3',
    topicId: 'average',
    question: 'A batsman makes a score of 87 runs in the 17th inning and thus increases his average by 3. Find his average after 17th inning.',
    options: ['39', '40', '41', '42'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'Let avg after 16th inning be x. 16x + 87 = 17(x + 3) => 16x + 87 = 17x + 51 => x = 36. New average = 36 + 3 = 39.'
  },
  {
    id: 'avg-4',
    topicId: 'average',
    question: 'The average of marks obtained by 120 candidates is 35. If the average of passed candidates is 39 and that of failed candidates is 15, the number of candidates who passed the examination is:',
    options: ['100', '110', '120', '130'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Let passed be p. 39p + 15(120 - p) = 120 * 35. 39p + 1800 - 15p = 4200 => 24p = 2400 => p = 100.'
  },
  {
    id: 'avg-5',
    topicId: 'average',
    question: 'There are two sections A and B of a class consisting of 36 and 44 students respectively. If the average weight of section A is 40kg and that of section B is 35kg, find the average weight of the whole class.',
    options: ['37.25 kg', '38.5 kg', '39.5 kg', '41 kg'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Total weight = 36*40 + 44*35 = 1440 + 1540 = 2980. Total students = 80. Average = 2980 / 80 = 37.25 kg.'
  },

  // Time & Work (5)
  {
    id: 'tw-1',
    topicId: 'time-work',
    question: 'A can do a piece of work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:',
    options: ['8/15', '7/15', '1/4', '1/10'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: '1 day work = 1/15 + 1/20 = 7/60. 4 days work = 28/60 = 7/15. Left work = 1 - 7/15 = 8/15.'
  },
  {
    id: 'tw-2',
    topicId: 'time-work',
    question: 'A works twice as fast as B. If both of them can together finish a work in 12 days, A alone can do it in:',
    options: ['18 days', '24 days', '36 days', '48 days'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'A = 2B. A+B = 3B efficiency. 3B finishes in 12 days. B finishes in 36 days. A finishes in 18 days.'
  },
  {
    id: 'tw-3',
    topicId: 'time-work',
    question: 'A and B can complete a work in 15 days and 10 days respectively. They started doing the work together but after 2 days B had to leave and A alone completed the remaining work. The whole work was completed in:',
    options: ['8 days', '10 days', '12 days', '15 days'],
    correctAnswer: 2,
    difficulty: 'Hard',
    explanation: 'Work done by A+B in 2 days = 2*(1/15 + 1/10) = 2*(1/6) = 1/3. Remaining 2/3 work is done by A. Days taken by A = (2/3) / (1/15) = 10. Total days = 2 + 10 = 12.'
  },
  {
    id: 'tw-4',
    topicId: 'time-work',
    question: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are used together, then how long will it take to fill the tank?',
    options: ['10 min', '12 min', '15 min', '25 min'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: '1/20 + 1/30 = 5/60 = 1/12. So it takes 12 minutes.'
  },
  {
    id: 'tw-5',
    topicId: 'time-work',
    question: '3 men or 4 women can earn Rs. 480 in a day. Find how much will 7 men and 11 women earn in a day?',
    options: ['Rs. 2400', 'Rs. 2440', 'Rs. 2500', 'Rs. 2600'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: '1 man earns = 480/3 = 160. 1 woman earns = 480/4 = 120. Total = 7(160) + 11(120) = 1120 + 1320 = 2440.'
  },

  // Time, Speed & Distance (5)
  {
    id: 'tsd-1',
    topicId: 'time-speed-distance',
    question: 'A car covers a distance of 816 km in 12 hours. What is the speed of the car?',
    options: ['60 kmph', '62 kmph', '64 kmph', '68 kmph'],
    correctAnswer: 3,
    difficulty: 'Easy',
    explanation: 'Speed = Distance / Time = 816 / 12 = 68 km/hr.'
  },
  {
    id: 'tsd-2',
    topicId: 'time-speed-distance',
    question: 'A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. The speed of the train is:',
    options: ['45 km/hr', '50 km/hr', '54 km/hr', '55 km/hr'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Relative speed = Distance/Time = 125/10 = 12.5 m/s = 12.5 * (18/5) = 45 km/hr. Train speed - 5 = 45 => Train speed = 50 km/hr.'
  },
  {
    id: 'tsd-3',
    topicId: 'time-speed-distance',
    question: 'Excluding stoppages, the speed of a bus is 54 kmph and including stoppages, it is 45 kmph. For how many minutes does the bus stop per hour?',
    options: ['9', '10', '12', '20'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Time of stoppage = (Diff in speed / Speed without stoppage) = 9 / 54 = 1/6 hr = 10 mins.'
  },
  {
    id: 'tsd-4',
    topicId: 'time-speed-distance',
    question: 'A man covers a certain distance by scooter at 40 km/hr and the remaining at 50 km/hr. If the time taken is same for both parts, find average speed.',
    options: ['45 km/hr', '44 km/hr', '42.5 km/hr', '48 km/hr'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'If time is same, average speed = (V1 + V2)/2 = (40 + 50)/2 = 45 km/hr. (If distance was same, it would be 2*40*50/(90)).'
  },
  {
    id: 'tsd-5',
    topicId: 'time-speed-distance',
    question: 'A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.',
    options: ['2 hours', '3 hours', '4 hours', '5 hours'],
    correctAnswer: 2,
    difficulty: 'Hard',
    explanation: 'Downstream speed = 13 + 4 = 17 km/hr. Time = Distance / Speed = 68 / 17 = 4 hours.'
  },

  // Simple & Compound Interest (5)
  {
    id: 'sci-1',
    topicId: 'simple-compound-interest',
    question: 'At what rate of simple interest per annum will a sum become double in 10 years?',
    options: ['8%', '10%', '12%', '15%'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'Let sum be P. SI = P. P = (P * R * 10) / 100 => R = 10%.'
  },
  {
    id: 'sci-2',
    topicId: 'simple-compound-interest',
    question: 'Find the compound interest on Rs. 10000 at 10% per annum for 2 years.',
    options: ['Rs. 2000', 'Rs. 2100', 'Rs. 2200', 'Rs. 2300'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'Amount = P(1 + R/100)^N = 10000(1.1)^2 = 12100. CI = 12100 - 10000 = 2100.'
  },
  {
    id: 'sci-3',
    topicId: 'simple-compound-interest',
    question: 'The difference between simple interest and compound interest on a certain sum for 2 years at 5% per annum is Rs. 15. The sum is:',
    options: ['Rs. 5000', 'Rs. 6000', 'Rs. 7000', 'Rs. 8000'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Difference = P * (R/100)^2. 15 = P * (5/100)^2 => P = 15 / 0.0025 = 6000.'
  },
  {
    id: 'sci-4',
    topicId: 'simple-compound-interest',
    question: 'A sum of money placed at compound interest doubles itself in 5 years. It will amount to eight times itself at the same rate of interest in:',
    options: ['10 years', '15 years', '20 years', '25 years'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'In 5 years it is 2 times. To become 8 times (2^3), it will take 5 * 3 = 15 years.'
  },
  {
    id: 'sci-5',
    topicId: 'simple-compound-interest',
    question: 'If the simple interest on a sum of money at 4% per annum for 3 years is Rs. 240, what will be the compound interest on the same sum for the same period at the same rate?',
    options: ['Rs. 249.73', 'Rs. 250', 'Rs. 252', 'Rs. 255'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'SI = 240 => PRT/100 = 240 => P*4*3/100 = 240 => P = 2000. CI = 2000 * ((1.04)^3 - 1) = 2000 * (1.124864 - 1) = 249.728.'
  },

  // Probability (5)
  {
    id: 'prob-1',
    topicId: 'probability',
    question: 'Two coins are tossed simultaneously. What is the probability of getting exactly one head?',
    options: ['1/4', '1/2', '3/4', '1'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'Outcomes: HH, HT, TH, TT. Exactly one head: HT, TH. Probability = 2/4 = 1/2.'
  },
  {
    id: 'prob-2',
    topicId: 'probability',
    question: 'A dice is rolled twice. What is the probability of getting a sum 9?',
    options: ['1/9', '1/12', '1/18', '1/36'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'Outcomes giving sum 9: (3,6), (4,5), (5,4), (6,3). Total outcomes = 36. Prob = 4/36 = 1/9.'
  },
  {
    id: 'prob-3',
    topicId: 'probability',
    question: 'A card is drawn from a well shuffled deck of 52 cards. What is the probability of drawing a face card?',
    options: ['1/13', '3/13', '4/13', '1/4'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Face cards are J, Q, K of 4 suits = 12. Prob = 12/52 = 3/13.'
  },
  {
    id: 'prob-4',
    topicId: 'probability',
    question: 'A bag contains 5 red and 3 blue balls. If two balls are drawn at random without replacement, what is the probability that both are red?',
    options: ['5/14', '5/28', '10/28', '25/64'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Prob = (5/8) * (4/7) = 20/56 = 5/14.'
  },
  {
    id: 'prob-5',
    topicId: 'probability',
    question: 'In a class of 30 students, 18 play cricket and 15 play football. If 5 play neither, what is the probability that a student chosen at random plays both?',
    options: ['2/15', '4/15', '1/5', '1/3'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'Total playing at least one = 30 - 5 = 25. n(A u B) = n(A) + n(B) - n(A n B) => 25 = 18 + 15 - n(A n B) => n(A n B) = 8. Prob = 8/30 = 4/15.'
  },

  // Algebra (5)
  {
    id: 'alg-1',
    topicId: 'algebra',
    question: 'If x + 1/x = 4, find the value of x^2 + 1/x^2.',
    options: ['14', '16', '18', '12'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: '(x + 1/x)^2 = x^2 + 1/x^2 + 2 = 16 => x^2 + 1/x^2 = 14.'
  },
  {
    id: 'alg-2',
    topicId: 'algebra',
    question: 'Solve for x: 3(x - 2) = 2(x + 4) - 1',
    options: ['13', '10', '11', '12'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: '3x - 6 = 2x + 8 - 1 => 3x - 6 = 2x + 7 => x = 13.'
  },
  {
    id: 'alg-3',
    topicId: 'algebra',
    question: 'If roots of the equation x^2 - 5x + 6 = 0 are p and q, find p + q + pq.',
    options: ['10', '11', '12', '30'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Sum of roots (p+q) = 5. Product of roots (pq) = 6. p + q + pq = 5 + 6 = 11.'
  },
  {
    id: 'alg-4',
    topicId: 'algebra',
    question: 'If 2^x = 8^(y+1) and 9^y = 3^(x-9), find the value of x + y.',
    options: ['18', '21', '24', '27'],
    correctAnswer: 3,
    difficulty: 'Hard',
    explanation: '2^x = 2^(3y+3) => x = 3y + 3. 3^(2y) = 3^(x-9) => 2y = x - 9. Substituting x: 2y = 3y + 3 - 9 => y = 6. x = 21. x + y = 27.'
  },
  {
    id: 'alg-5',
    topicId: 'algebra',
    question: 'Factorize: x^3 - 8',
    options: ['(x-2)(x^2 + 2x + 4)', '(x-2)(x^2 - 2x + 4)', '(x+2)(x^2 - 2x + 4)', '(x+2)(x^2 + 2x + 4)'],
    correctAnswer: 0,
    difficulty: 'Hard',
  },

  // Logical Reasoning - Series
  {
    id: 'lr-ser-1',
    category: 'logical-reasoning',
    topicId: 'series',
    question: 'Find the next number in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'The differences between consecutive terms are 4, 6, 8, 10, ... The next difference is 12, so 30 + 12 = 42.'
  },
  {
    id: 'lr-ser-2',
    category: 'logical-reasoning',
    topicId: 'series',
    question: 'Complete the letter series: BDF, HJL, NPR, ?',
    options: ['TVX', 'UWY', 'SUW', 'TVY'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'Each group skips one letter (B-D-F). The first letter of each group advances by 6 letters: B(2) + 6 = H(8); H(8) + 6 = N(14); N(14) + 6 = T(20). So the next is TVX.'
  },
  {
    id: 'lr-ser-3',
    category: 'logical-reasoning',
    topicId: 'series',
    question: 'Find the missing number in the series: 3, 7, 15, 31, 63, ?',
    options: ['125', '127', '129', '131'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Each term is generated by (previous term * 2) + 1. (63 * 2) + 1 = 126 + 1 = 127.'
  },
  {
    id: 'lr-ser-4',
    category: 'logical-reasoning',
    topicId: 'series',
    question: 'Find the wrong number in the series: 8, 14, 26, 48, 98, 194, 386',
    options: ['14', '26', '48', '98'],
    correctAnswer: 2,
    difficulty: 'Hard',
    explanation: 'The pattern is *2 - 2: 8*2-2=14, 14*2-2=26, 26*2-2=50 (not 48), 50*2-2=98, 98*2-2=194, 194*2-2=386. Thus 48 is incorrect.'
  },
  {
    id: 'lr-ser-5',
    category: 'logical-reasoning',
    topicId: 'series',
    question: 'What comes next in the alternating series: 1, 4, 3, 9, 5, 16, 7, ?',
    options: ['21', '23', '25', '27'],
    correctAnswer: 2,
    difficulty: 'Hard',
    explanation: 'Two interleaved series: (1, 3, 5, 7) with +2, and (4, 9, 16, ?) which are consecutive squares (2^2, 3^2, 4^2, 5^2). 5^2 = 25.'
  },

  // Logical Reasoning - Blood Relations
  {
    id: 'lr-br-1',
    category: 'logical-reasoning',
    topicId: 'blood-relations',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    correctAnswer: 3,
    difficulty: 'Easy',
    explanation: 'The only son of Suresh\'s mother is Suresh himself. Therefore, the boy is Suresh\'s son, meaning Suresh is his father.'
  },
  {
    id: 'lr-br-2',
    category: 'logical-reasoning',
    topicId: 'blood-relations',
    question: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is D related to A?',
    options: ['Nephew or Niece', 'Brother', 'Son', 'Cannot be determined'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'C is the brother of A. D is the child of C. Since the gender of D is not specified, D is either the nephew or niece of A.'
  },
  {
    id: 'lr-br-3',
    category: 'logical-reasoning',
    topicId: 'blood-relations',
    question: 'Introducing a woman, a man said, "Her mother is the only daughter of my mother-in-law." How is the man related to the woman?',
    options: ['Father', 'Brother', 'Uncle', 'Husband'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'The only daughter of the man\'s mother-in-law is the man\'s wife. The woman\'s mother is the man\'s wife, so the man is her father.'
  },
  {
    id: 'lr-br-4',
    category: 'logical-reasoning',
    topicId: 'blood-relations',
    question: 'P is the father of Q and the grandfather of R, who is the brother of S. S\'s mother, T, is married to V. V is the brother of Q. How is T related to P?',
    options: ['Daughter', 'Daughter-in-law', 'Sister-in-law', 'Sister'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'R and S are children of T and V. V is the brother of Q, so V is also the son of P. T is married to V (P\'s son), so T is the daughter-in-law of P.'
  },
  {
    id: 'lr-br-5',
    category: 'logical-reasoning',
    topicId: 'blood-relations',
    question: 'A and B are married couple. X and Y are brothers. X is the brother of A. How is Y related to B?',
    options: ['Brother-in-law', 'Brother', 'Cousin', 'Uncle'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'Since X and Y are brothers and X is the brother of A, Y is also the brother of A. B is married to A, so Y is B\'s brother-in-law.'
  },

  // Data Interpretation - Tables
  {
    id: 'di-tab-1',
    category: 'data-interpretation',
    topicId: 'tables',
    question: 'Company Sales (in $k): Q1: 120, Q2: 150, Q3: 180, Q4: 210. What is the average quarterly sales for the year?',
    options: ['150', '160', '165', '170'],
    correctAnswer: 2,
    difficulty: 'Easy',
    explanation: 'Average = (120 + 150 + 180 + 210) / 4 = 660 / 4 = 165.'
  },
  {
    id: 'di-tab-2',
    category: 'data-interpretation',
    topicId: 'tables',
    question: 'Production of Units (2021 vs 2022): Dept A: 400 to 500; Dept B: 600 to 660; Dept C: 250 to 350. Which department registered the highest percentage growth?',
    options: ['Dept A', 'Dept B', 'Dept C', 'Both A and C'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'Dept A: (100/400)*100 = 25%. Dept B: (60/600)*100 = 10%. Dept C: (100/250)*100 = 40%. Dept C has the highest growth (40%).'
  },
  {
    id: 'di-tab-3',
    category: 'data-interpretation',
    topicId: 'tables',
    question: 'Scores of 4 students in 3 subjects (Max 100): Math [80, 90, 70, 60], Science [85, 75, 95, 65], English [75, 85, 80, 70]. What is the total combined score across all 4 students in Science?',
    options: ['310', '320', '325', '330'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Total Science score = 85 + 75 + 95 + 65 = 320.'
  },
  {
    id: 'di-tab-4',
    category: 'data-interpretation',
    topicId: 'tables',
    question: 'Monthly expenditure breakdown: Rent: $1200, Food: $600, Utilities: $300, Savings: $900. What angle in a pie chart would represent the Savings component?',
    options: ['90°', '108°', '120°', '135°'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'Total expenditure = 1200 + 600 + 300 + 900 = 3000. Savings fraction = 900 / 3000 = 0.30. Angle = 0.30 * 360° = 108°.'
  },
  {
    id: 'di-tab-5',
    category: 'data-interpretation',
    topicId: 'tables',
    question: 'Defect rates across factories: Factory X produces 5000 units with 2% defect; Factory Y produces 3000 units with 4% defect. What is the overall percentage defect across both factories?',
    options: ['2.50%', '2.75%', '3.00%', '3.25%'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'Defects in X = 5000 * 0.02 = 100. Defects in Y = 3000 * 0.04 = 120. Total defects = 220. Total units = 8000. Overall defect % = (220 / 8000) * 100 = 2.75%.'
  },

  // Verbal Ability & Reading Comprehension - Sentence Correction
  {
    id: 'va-sc-1',
    category: 'verbal',
    topicId: 'sentence-correction',
    question: 'Choose the grammatically correct sentence:',
    options: [
      'Neither of the two candidates have submitted their profile.',
      'Neither of the two candidates has submitted his or her profile.',
      'Neither of the two candidates are submitting their profile.',
      'Neither of the two candidates were having submitted their profile.'
    ],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: '\'Neither\' is singular and takes a singular verb (\'has submitted\') and a singular pronoun.'
  },
  {
    id: 'va-sc-2',
    category: 'verbal',
    topicId: 'sentence-correction',
    question: 'Identify the sentence with the correct idiom usage:',
    options: [
      'She decided to take the bull by the horns and tackle the crisis.',
      'She decided to hold the bull at the horns and face the crisis.',
      'She decided to pull the bull by its horns and solve the issue.',
      'She decided to grab the horns from the bull directly.'
    ],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'The standard English idiom is \'to take the bull by the horns\', which means to deal directly and courageously with a difficult situation.'
  },
  {
    id: 'va-sc-3',
    category: 'verbal',
    topicId: 'sentence-correction',
    question: 'Select the sentence with proper parallel structure:',
    options: [
      'The manager expected us to work late, write reports, and attending all meetings.',
      'The manager expected us to work late, write reports, and attend all meetings.',
      'The manager expected us working late, writing reports, and to attend all meetings.',
      'The manager expected us to work late, writing reports, and attending meetings.'
    ],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'Parallel structure requires all verbs in the series to share the same infinitive form: \'to work late, write reports, and attend all meetings\'.'
  },
  {
    id: 'va-sc-4',
    category: 'verbal',
    topicId: 'sentence-correction',
    question: 'Identify the correct sentence involving conditional clauses:',
    options: [
      'If I was the CEO, I would have approved the budget yesterday.',
      'If I were the CEO, I would approve the strategic initiative.',
      'If I had been the CEO, I would approve the strategic initiative today.',
      'If I am the CEO, I would have approved the initiative.'
    ],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'Subjunctive mood expressing an unreal present condition requires \'were\': \'If I were the CEO, I would approve...\'.'
  },
  {
    id: 'va-sc-5',
    category: 'verbal',
    topicId: 'sentence-correction',
    question: 'Which of the following sentences correctly avoids a dangling modifier?',
    options: [
      'Having finished the assignment, the TV was turned on by John.',
      'Having finished the assignment, John turned on the TV.',
      'Having finished the assignment, turning on the TV was what John did.',
      'Having finished the assignment, the television program was watched.'
    ],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'The participial phrase \'Having finished the assignment\' must logically modify the subject following it, which is John.'
  }
];

export default aptitudeQuestions;
