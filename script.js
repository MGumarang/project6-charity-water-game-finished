// Use Arrays to store questions, answers, and discoveries
const body = document.body;
let completed = 0;
let score = 0;
const totalScore = document.getElementById("scoreText");
if (totalScore) {
    totalScore.textContent = `Score: ${score} / 7500`;
}

// Timer & Difficulty state
const difficultySelect = document.getElementById('difficulty-select');
const timerDisplay = document.getElementById('timerText');
let currentDifficulty = difficultySelect ? difficultySelect.value || 'casual' : 'casual';
const TIMER_PRESETS = {
    casual: 0,
    normal: 3 * 60 * 1000,
    hard: 2 * 60 * 1000
};
let timerInterval = null;
let timerRemainingMs = 0;

function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
    if (!timerDisplay) return;
    if (currentDifficulty === 'casual') {
        timerDisplay.textContent = `Time: 00:00`;
        return;
    }
    timerDisplay.textContent = `Time: ${formatTime(timerRemainingMs)}`;
}

function startTimer(durationMs) {
    stopTimer();
    if (!durationMs || durationMs <= 0) return;
    timerRemainingMs = durationMs;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timerRemainingMs -= 250;
        if (timerRemainingMs <= 0) {
            timerRemainingMs = 0;
            updateTimerDisplay();
            stopTimer();
            onTimerExpired();
            return;
        }
        updateTimerDisplay();
    }, 250);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function onTimerExpired() {
    // Overall game timer expired -> end the game and show final score
    alert("Time's up! The game has ended.");

    // stop timer and disable difficulty selector
    stopTimer();
    if (difficultySelect) {
        difficultySelect.disabled = true;
        difficultySelect.setAttribute('aria-disabled', 'true');
    }

    const gameBoard = document.getElementById("game-board");
    const victoryScreen = document.getElementById("victory-screen");
    if (gameBoard && victoryScreen) {
        gameBoard.classList.add("hidden");
        gameBoard.style.display = "none";
        gameBoard.setAttribute('aria-hidden', 'true');
        victoryScreen.classList.remove("hidden");
        victoryScreen.style.display = "block";
        victoryScreen.setAttribute('aria-hidden', 'false');
        document.body.classList.add("victory");
        const milestoneMessage = document.getElementById("milestone-message");
        if (milestoneMessage) milestoneMessage.remove();

        const progressBarFill = document.getElementById("progressBarFill");
        if (progressBarFill) progressBarFill.classList.add("victory");

        const victoryH1 = document.querySelector("#victory-screen h1");
        if (victoryH1) victoryH1.textContent = `Time's up!`;
        const victoryH2 = document.querySelector("#victory-screen h2");
        if (victoryH2) victoryH2.textContent = `You ran out of time!`;

        const finalScoreElement = document.getElementById("final-score");
        if (finalScoreElement) finalScoreElement.textContent = `${score}/7500`;
    }
}

function resetGame() {
    // Reset core state
    completed = 0;
    score = 0;
    if (totalScore) totalScore.textContent = `Score: ${score} / 7500`;

    // Reset question answered flags
    Object.keys(questions).forEach(cat => {
        Object.keys(questions[cat]).forEach(key => {
            questions[cat][key].answered = false;
        });
        categoryDiscoveryCounts[cat] = 0;
        updateCategoryProgress(cat);
    });

    // Reset board buttons
    const boardButtons = document.querySelectorAll('.question-button');
    boardButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('answered');
        if (btn.dataset && btn.dataset.value) btn.textContent = btn.dataset.value;
    });

    updateProgress();
    stopTimer();
    // Start timer for timed difficulties
    if (currentDifficulty && TIMER_PRESETS[currentDifficulty]) {
        if (currentDifficulty !== 'casual') startTimer(TIMER_PRESETS[currentDifficulty]);
        else updateTimerDisplay();
    }
}

// Define the questions, answers, and discoveries for each category and point value
const questions = {

    "Dorm Life": {
        100: {
            question: "Which habit saves the most water in a dorm?",
            answers: [
                "Take shorter showers",
                "Leave the sink running",
                "Wash one shirt at a time",
                "Run the dishwasher half full"
            ],
            correct: 0,
            discovery: "Taking shorter showers is one of the easiest ways college students can reduce their daily water use. Even saving just a few minutes each day can add up to hundreds of gallons over the course of a school year.\nConserving water not only positively affects your water footprint, but it also allows the saved water to be used for people who need the clean water.",
            answered: false
        },

        200: {
            question: "How much can a 10-minute shower use?",
            answers: [
                "About 2 gallons",
                "About 10 gallons",
                "About 25 gallons",
                "About 50 gallons"
            ],
            correct: 3,
            discovery: "Showerhead flow rates may vary, but continuous streams of water will accumulate into a large waste in water. Practicing shorter showers not only saves time; It saves water.",
            answered: false
        },

        300: {
            question: "Leaving the faucet running while brushing your teeth can waste approximately:",
            answers: [
                "1 gallons",
                "4 gallons",
                "10 gallons",
                "20 gallons"
            ],
            correct: 1,
            discovery: "Turning off the faucet while brushing your teeth is a small habit that can save several gallons of water each day. Simple choices made by millions of people can have a meaningful impact on water conservation.\ncharity: water encourages people to value clean water because millions around the world still do not have reliable access to it.",
            answered: false
        },

        400: {
            question: "You notice someone washing dishes with the water constantly running. Which suggestion would help save water?",
            answers: [
                "Use hotter water",
                "Wash each dish individually",
                "Fill the sink or a basin instead of letting the tap run",
                "Rinse dishes twice"
            ],
            correct: 2,
            discovery: "While it may sound strange, washing dishes in a filled sink or basin does use much less water than letting the faucet run continuously. Water-saving habits like this are easy to practice in dorms, apartments, and homes.\nLearning to use water wisely helps us become more appreciative and knowledgeable of water usage and accesibility.",
            answered: false
        },

        500: {
            question: "You are leaving the dorms for a four-day weekend. Which action will help prevent the greatest amount of unneccessary water waste while you're away?",
            answers: [
                "Carry a reusable water bottle instead of disposable bottles",
                "Unplug unneccessary appliances",
                "Double-check that faucets are fully turned off, and report any leakes before leaving",
                "Store every leftover food before leaving"
            ],
            correct: 2,
            discovery: "Even if a faucet is only dripping water, the amount of water wasted would amount to gallons if left to drip for a long time. Preventing dripping or leaking water can save far more water than you might expect.\nAround the world, millions of people still spend hours each day collecting water for essential household tasks. Small conservation habits can help us better appreciate the value of clean, accesible water.",
            answered: false
        },
    },

    "Technology": {
        100: {
            question: "Manufacturing which device requires large amounts of water?",
            answers: [
                "Smartphone",
                "Notebook",
                "Backpack",
                "Calculator"
            ],
            correct: 0,
            discovery: "Over three thousand gallons of water is used in the manufacturing of one smartphone. Moreover, most electronics are manufactured in regions struggling to access clean water.\nKnowing the uses of water in technology is one step closer to becoming knowledgeable in water usage and accessibility.",
            answered: false
        },

        200: {
            question: "Why is water used during electronics manufacturing?",
            answers: [
                "To cool equipment",
                "To clean semiconductor wafers",
                "Both A and B",
                "It is not used"
            ],
            correct: 2,
            discovery: "Water is essential for manufacturing electronics because it cools machinery and cleans delicate computer components during production. Many people never realize that the devices they use every day have a hidden water footprint.\nUnderstanding these hidden uses of water helps highlight why protecting and expanding access to clean water is so important to charity: water's mission.",
            answered: false
        },

        300: {
            question: "What is one benefit of a low-flow showerhead?",
            answers: [
                "It increases water pressure by using more water",
                "It reduces water use while maintaining comfortable water pressure",
                "It only works with cold water",
                "It fills bathtub faster"
            ],
            correct: 1,
            discovery: "Low-flow showerheads mix air with water to maintain comfortable pressure while using less water. Small improvements in technology can save thousands of gallons over time without changing daily routines.\nInnovations that encourage water conservation help people better appreciate the value of clean water, something charity: water works to provide around the world.",
            answered: false
        },

        400: {
            question: "Why do campuses install motion-sensor faucets?",
            answers: [
                "To make the sinks look modern",
                "To increase water pressure",
                "To make students wash longer",
                "To reduce unnecessary water use"
            ],
            correct: 3,
            discovery: "Motion-sensor faucets automatically shut off when they are no longer needed, preventing unnecessary water waste. Many schools and public buildings install them because small savings add up quickly across thousands of users.\nConserving water wherever possible supports the broader goal of ensuring more people can enjoy reliable access to clean water, just as charity: water strives to achieve.",
            answered: false
        },

        500: {
            question: "You are buying a reusable water bottle for the semester. Which feature is most helpful for reducing waste throughout the year?",
            answers: [
                "A bright color",
                "A larger logo",
                "A durable bottle that can be used daily and easily refillable on campus",
                "A disposable filter straw"
            ],
            correct: 2,
            discovery: "A single plastic bottle requires around 1.4 gallons of water to produce. That means a dozen plastic bottles consumes more water than they hold. Many college campuses now provide refill stations to encourage reusable water bottles.\nCarrying a reusable bottle also serves as a reminder that while clean drinking water is convenient for many students, millions of people still lack that same access—a challenge charity: water is working to change.",
            answered: false
        },
    },

    "Entertainment": {
        100: {
            question: "Watching a movie on your laptop directly uses:",
            answers: [
                "100+ gallons",
                "No household water",
                "50 gallons",
                "10 gallons"
            ],
            correct: 1,
            discovery: "Your laptop may not be consuming water, but data centers and electricity production indirectly impacts water consumption.\nLearning about indirect water consumption allows people to become more aware with how water is used and distributed.",
            answered: false
        },

        200: {
            question: "Large sport stadiums use water for",
            answers: [
                "Bathrooms",
                "Food preparation",
                "Field maintenance",
                "All of the above"
            ],
            correct: 3,
            discovery: "Sport stadiums use water for everything, from maintaining fields to preparing food and serving thousands of visitors. Large events require careful planning to manage their water use responsibly.\nLearning where water is used helps us recognize its value and why charity: water works to expand access to safe drinking water around the world.",
            answered: false
        },

        300: {
            question: "You order a new T-shirt featuring your favorite character, and you promise to yourself to wear the shirt for years. How is clothing connected to water conservation?",
            answers: [
                "Clothing does not use water to make",
                "Water is only used to dye the fabric",
                "Making clothing, especially cotton shirts, require large amounts of water",
                "Shipping clothes uses water"
            ],
            correct: 2,
            discovery: "To produce one kilogram of raw cotton, a net total of 7,000 to 29,000 liters of water is consumed. Wearing clothing for many years instead of replacing them makes use of every liter used.\nAppreciating the resources behind everyday products can inspire greater awareness of water conservation and charity: water's mission.",
            answered: false
        },

        400: {
            question: "You are deciding how to spend your Friday night. Which activity generally has the smallest direct water footprint",
            answers: [
                "Filling a pool to relax outside",
                "Cooking a meal for yourself",
                "Watching a movie or playing a video game at home",
                "Having a backyard balloon fight"
            ],
            correct: 2,
            discovery: "While electricity still has an environmental impact, choosing lower-water activities can help reduce your overall water footprint.\nEvery effort to value water reinforces the importance of providing clean water to communities through organizations like charity: water.",
            answered: false
        },

        500: {
            question: "You are buying snacks to eat for a long movie marathon. Which snack is generally the most water-intensive to produce?",
            answers: [
                "Popcorn",
                "Seasoned chips",
                "Mixed nuts",
                "Beef jerky"
            ],
            correct: 3,
            discovery: "While nuts such as almonds can be water-intensive, beef consistently has a very high water footprint among common foods. This is because cattle require gallons of water to maintain, whether for food or processing.",
            answered: false
        },
    },

    "Food": {
        100: {
            question: "Which drink usually has the smallest water footprint?",
            answers: [
                "Milk",
                "Bottled juice",
                "Tap water",
                "Soda"
            ],
            correct: 2,
            discovery: "Tap water usually has one of the smallest water footprints because it does not require the manufacturing and transportation of disposable containers. Choosing reusable bottles filled with tap water can also reduce plastic waste.\nAccess to safe tap water is something many people take for granted, making charity: water's work even more meaningful.",
            answered: false
        },

        200: {
            question: "You accidentally buy more food than you can eat, so you store them in the fridge. Why is saving/storing food better for water conservation?",
            answers: [
                "It keeps the dining hall cleaner",
                "Producing food requires a lot of water, so wasting food also wastes water",
                "It uses less electricity",
                "It helps your meal cool faster"
            ],
            correct: 1,
            discovery: "Every meal represents the water used to grow crops, raise livestock, and prepare food before it reaches your plate. Saving leftovers helps reduce both food waste and the hidden water used to produce that food.\nRecognizing these hidden water costs helps build appreciation for charity: water's efforts to bring clean water to communities in need.",
            answered: false
        },

        300: {
            question: "When rinsing fruit, which method uses the least water.",
            answers: [
                "Leave the faucet running",
                "Soak the fruit for ten minutes",
                "Wash it twice",
                "Cleanly rinse the fruit under running water before turning the faucet off as soon as possible"
            ],
            correct: 3,
            discovery: "Simple kitchen habits can make a noticeable difference over time without sacrificing cleanliness.\nWater conservation starts with everyday choices and supports the same respect for water that inspires charity: water's mission.",
            answered: false
        },

        400: {
            question: "Approximately how many gallons of water are needed to produce one hamburger?",
            answers: [
                "50 gallons",
                "150 gallons",
                "400 gallons",
                "Over 600 gallons"
            ],
            correct: 3,
            discovery: "Producing beef requires large amounts of water because cattle need water to drink, eat crops, and be processed into food products.\nUnderstanding how much water goes into producing food encourages more thoughtful choices and greater appreciation for charity: water's work to improve water accessibility.",
            answered: false
        },

        500: {
            question: "Which meal is generally associated with the larger water footprint?",
            answers: [
                "Vegetable stir-fry with rice",
                "Bean burrito",
                "Pasta with tomato sauce",
                "Cheeseburger with a beef patty"
            ],
            correct: 3,
            discovery: "Every food listed above uses a lot of water to produce, but cheeseburgers use water the most.\nLearning how water is used in the creation of foods helps people recognize their own water footprint, and how much water they are indirectly using up.",
            answered: false
        },
    },

    "The World": {
        100: {
            question: "Approximately how many people worldwide lack safely managed drinking water?",
            answers: [
                "Around 50 million",
                "Around 30 million",
                "Around 700 million",
                "None. Everyone has drinkable water"
            ],
            correct: 2,
            discovery: "There are many villages, cities, and countries that do not have reliable sources of clean water. People take water for granted, but it is important to recognize that water does more to your body than just quenching thirst.\nProviding clean water to people who need it most is at the heart of charity: water's mission.",
            answered: false
        },

        200: {
            question: "What major benefit comes with easy access to clean water?",
            answers: [
                "Improved health",
                "More time for school",
                "Better economic opportunities",
                "All of the above"
            ],
            correct: 3,
            discovery: "Access to clean water improves health, allows children to spend more time in school, and gives families more opportunities to work and build stronger communities. Safe water creates positive changes that extend far beyond drinking alone.\ncharity: water focuses on bringing these life-changing benefits to communities around the world.",
            answered: false
        },

        300: {
            question: "How far do some people travel every day to collect water?",
            answers: [
                "A few feet",
                "Up to several miles",
                "Around the block",
                "About two blocks"
            ],
            correct: 1,
            discovery: "There are people that have to walk miles from their homes to the nearest source of water. Even then, the water may not be clean.\nThis is one of many reasons why charity: water strives to provide accessible clean water. It is why being knowledgeable in water accesibility is so important.",
            answered: false
        },

        400: {
            question: "Who is most often responsible for collecting water in many communities?",
            answers: [
                "Children and women",
                "Teachers",
                "Doctors",
                "Government workers"
            ],
            correct: 0,
            discovery: "In many communities, gender norms frequently demand children and women to spend hours each day collecting water. Bringing clean water closer to home gives families more time for education, careers, and everyday life.\nThis is one of the reasons charity: water invests in sustainable water projects around the world.",
            answered: false
        },

        500: {
            question: "What is charity: water's primary mission?",
            answers: [
                "Bring clean and safe drinking water to communities",
                "Bringing awareness to water usage and accessibility",
                "Sell reusable bottles",
                "Protect oceans"
            ],
            correct: 0,
            discovery: "charity: water partners with local organizations to build sustainable water systems that communities can maintain long after construction is complete. Their work includes wells, piped water systems, filtration, and other solutions based on each community's needs.\nBy learning about water accessibility, you are taking the first step toward understanding why clean water changes lives.",
            answered: false
        },
    }

}

// Makes the category discovery elements and counts more accessible for updating progress
const categoryDiscoveryElements = {
    "Dorm Life": document.getElementById("dormLifeDiscoveries"),
    "Technology": document.getElementById("technologyDiscoveries"),
    "Entertainment": document.getElementById("entertainmentDiscoveries"),
    "Food": document.getElementById("foodDiscoveries"),
    "The World": document.getElementById("theWorldDiscoveries")
};

// Initializes the category discovery counts to zero for each category
const categoryDiscoveryCounts = Object.keys(questions).reduce((counts, category) => {
    counts[category] = 0;
    return counts;
}, {});

// Updates the category progress display based on the number of discoveries unlocked in that category
function updateCategoryProgress(category) {
    const categoryElement = categoryDiscoveryElements[category];

    if (categoryElement) {
        categoryElement.textContent = `${categoryDiscoveryCounts[category]}/5 Discoveries`; // Update the text content to show the number of discoveries unlocked in that category
    }
}

// Initialize the category progress display for all categories
Object.keys(categoryDiscoveryElements).forEach(updateCategoryProgress);

// Detects which button was clicked
const buttons = document.querySelectorAll(".question-button");
buttons.forEach(button => {
    button.addEventListener("click", () => {
        openQuestion(button);
    });
});

// Changes accordion behavior based on screen size, and updates accessibility attributes accordingly
const accordionMediaQuery = window.matchMedia("(min-width: 701px)");
const accordionButtons = document.querySelectorAll(".category-card .accordion-button");
const accordionPanels = document.querySelectorAll(".category-card .accordion-collapse");

// Syncs the accordion's accessibility attributes with its current state
function syncAccordionAccessibility() {
    const desktopMode = accordionMediaQuery.matches;

    accordionButtons.forEach(button => {
        button.disabled = desktopMode;
        button.classList.toggle("collapsed", !desktopMode);
        button.setAttribute("aria-expanded", desktopMode ? "true" : "false");
        button.setAttribute("aria-disabled", desktopMode ? "true" : "false");
    });

    // Syncs the accordion panels' visibility and accessibility attributes with the current mode
    accordionPanels.forEach(panel => {
        const collapse = bootstrap.Collapse.getOrCreateInstance(panel, { toggle: false });

        if (desktopMode) {
            collapse.show();
            panel.setAttribute("aria-hidden", "false");
        } else {
            collapse.hide();
            panel.setAttribute("aria-hidden", "true");
        }
    });
}

syncAccordionAccessibility();

if (typeof accordionMediaQuery.addEventListener === "function") {
    accordionMediaQuery.addEventListener("change", syncAccordionAccessibility);
} else if (typeof accordionMediaQuery.addListener === "function") {
    accordionMediaQuery.addListener(syncAccordionAccessibility);
}

// Provides function for the "Back" button
const backButton = document.querySelector("#question-screen .back");
if (backButton) {
    backButton.addEventListener("click", finishQuestion);
}

// Changes from Board to Question
let activeQuestionButton = null;
function openQuestion(button) {

    // States the constant variables, as well as resetting the text content
    activeQuestionButton = button;
    const category = button.dataset.category;
    const value = button.dataset.value;

    const currentQuestion = questions[category][value];

    // Checks if the selected question is already answered
    if (currentQuestion.answered) {
        return;
    }

    const gameBoard = document.getElementById("game-board");
    const questionScreen = document.getElementById("question-screen");

    if (gameBoard && questionScreen) {
        console.log("openQuestion", { category, value, question: currentQuestion.question });
        gameBoard.classList.add("hidden");
        gameBoard.style.display = "none";
        questionScreen.classList.remove("hidden");
        questionScreen.style.display = "block";
    }

    document.getElementById("question-title").textContent = `${category} (${value})`;
    document.getElementById("question-text").textContent = currentQuestion.question;

    const result = document.getElementById("answer-result");
    const answerButtons = document.querySelectorAll("#answers .answer");

    // Resets the question screen
    document.getElementById("did-you-know").classList.add("hidden");
    document.getElementById("discovery-text").textContent = "";
    result.textContent = ""

    // Resets the buttons
    answerButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove("correct");
        button.classList.remove("wrong");
        // Ensure the button is visible when opening a question
        button.classList.remove('hidden');
        button.setAttribute('aria-hidden', 'false');
    });

    // Loads the new answers
    currentQuestion.answers.forEach((answer, index) => {
        answerButtons[index].textContent = answer;
        answerButtons[index].dataset.index = index;
    });

    // When the player clicks on an answer
    answerButtons.forEach((button, index) => {
        button.onclick = () => {

            const result = document.getElementById("answer-result");
            console.log("answer clicked", { index, answer: currentQuestion.answers[index], correctIndex: currentQuestion.correct });


            // Disable every answer
            answerButtons.forEach(btn => btn.disabled = true)

            // Hide all incorrect answers, keep the correct one visible
            answerButtons.forEach((btn, i) => {
                if (i !== currentQuestion.correct) {
                    btn.classList.add('hidden');
                    btn.disabled = true;
                    button.setAttribute('aria-disabled', 'true');
                    btn.setAttribute('aria-hidden', 'true');
                } else {
                    btn.classList.remove('hidden');
                    btn.disabled = true;
                    btn.classList.add('correct');
                    btn.setAttribute('aria-disabled', 'true');
                    btn.setAttribute('aria-hidden', 'false');
                    if (typeof btn.focus === 'function') btn.focus();
                }
            });

            // Show the Did You Know section for both outcomes
            const discoverySection = document.getElementById("did-you-know");
            const discoveryText = document.getElementById("discovery-text");
            discoveryText.textContent = currentQuestion.discovery;
            discoverySection.classList.remove("hidden");

            // Disables the Board button, as well as updating the completion state of the question and the progress bar and texts
            activeQuestionButton.disabled = true;
            activeQuestionButton.classList.add("answered");
            activeQuestionButton.textContent = "✓"
            completed++;
            currentQuestion.answered = true;
            categoryDiscoveryCounts[category]++;
            updateCategoryProgress(category);
            updateProgress();

            //Logic for when the answer is correct or incorrect
            if (index === currentQuestion.correct) {
                score += Number(value);
                button.classList.add("correct");
                result.textContent = `Correct! +${value} points`
                console.log("correct answer", { score, completed });
                totalScore.textContent = `Score: ${score} / 7500`;
                showMilestoneIfReached();
            } else {
                button.classList.add("wrong");
                answerButtons[currentQuestion.correct].classList.add("correct");
                result.textContent = `Incorrect! The correct answer is: ${currentQuestion.answers[currentQuestion.correct]}`;
                console.log("incorrect answer", { score, completed });
            }

            // Ensure the correct button is always marked visible and highlighted
            if (answerButtons[currentQuestion.correct]) {
                answerButtons[currentQuestion.correct].classList.remove('hidden');
                answerButtons[currentQuestion.correct].setAttribute('aria-hidden', 'false');
                answerButtons[currentQuestion.correct].classList.add('correct');
            }

        };
    }, 2000);
}

// When the "Back" button is pressed
function finishQuestion() {
    const gameBoard = document.getElementById("game-board");
    const questionScreen = document.getElementById("question-screen");
    const victoryScreen = document.getElementById("victory-screen");

    // Restore answer buttons visibility/state when leaving a question
    const answerButtons = document.querySelectorAll("#answers .answer");
    if (answerButtons) {
        answerButtons.forEach(btn => {
            btn.classList.remove('hidden');
            btn.setAttribute('aria-hidden', 'false');
            btn.disabled = false;
            btn.classList.remove('correct');
            btn.classList.remove('wrong');
        });
    }

    if (gameBoard && questionScreen) {
        questionScreen.classList.add("hidden");
        questionScreen.style.display = "";
        gameBoard.classList.remove("hidden");
        gameBoard.style.display = "";
    }

    // Check if all questions have been completed and show the victory screen if so
    if (completed === 25) {
        // stop overall timer when game ends
        stopTimer();
        // disable difficulty selector
        if (difficultySelect) {
            difficultySelect.disabled = true;
            difficultySelect.setAttribute('aria-disabled', 'true');
        }

        const milestoneMessage = document.getElementById("milestone-message");
        if (milestoneMessage) milestoneMessage.remove();

        document.body.classList.add("victory");
        gameBoard.classList.add("hidden");
        questionScreen.classList.add("hidden");
        victoryScreen.classList.remove("hidden");

        const finalScoreElement = document.getElementById("final-score");
        if (finalScoreElement) finalScoreElement.textContent = `${score}/7500`;

        // Update the victory screen message based on whether the player ran out of time or completed all questions
        const victoryH1 = document.querySelector("#victory-screen h1");
        if (victoryH1) victoryH1.textContent = `Congratulations!`;
        const victoryH2 = document.querySelector("#victory-screen h2");
        if (victoryH2) victoryH2.textContent = `You have unlocked all 25 discoveries and completed the game!`;
        const timeRemainingSpan = document.getElementById("time-remaining-span");
        const timeRemainingP = document.getElementById("time-remaining-p");
        if (timeRemainingSpan && timeRemainingP) {
            if (currentDifficulty && currentDifficulty !== 'casual') {
                // show remaining timer for timed difficulties
                timeRemainingSpan.textContent = `${formatTime(typeof timerRemainingMs === 'number' ? timerRemainingMs : 0)}`;
                timeRemainingSpan.classList.remove('hidden');
                timeRemainingSpan.style.display = '';
                timeRemainingSpan.setAttribute('aria-hidden', 'false');
                timeRemainingP.classList.remove('hidden');
                timeRemainingP.style.display = '';
                timeRemainingP.setAttribute('aria-hidden', 'false');
            } else {
                // hide when not timed
                timeRemainingSpan.classList.add('hidden');
                timeRemainingSpan.style.display = 'none';
                timeRemainingSpan.setAttribute('aria-hidden', 'true');
                timeRemainingP.classList.add('hidden');
                timeRemainingP.style.display = 'none';
                timeRemainingP.setAttribute('aria-hidden', 'true');
            }
        }

    }

}

// Updates the Progress Bar
    function updateProgress() {
        const percent = completed / 25 * 100;

        document.getElementById("progressBarFill").style.width = percent + "%";
        document.getElementById("progressText").textContent = `${completed}/25 Discoveries Unlocked`;
    }

    // Displays a milestone message when the score reaches 3750 points
    function showMilestoneIfReached() {
        const progressSection = document.querySelector(".progress-section");
        if (!progressSection) return;

        const existing = document.getElementById("milestone-message");

        if (score < 3750) {
            if (existing) existing.remove();
            return;
        }

        if (existing) return;

        const message = document.createElement("p");
        message.id = "milestone-message";
        message.textContent = "You have reached 3750 points! Keep going!";
        progressSection.appendChild(message);
    }

    // Check once on load in case score is already high (e.g. restored state)
    showMilestoneIfReached();


    // Wire the difficulty select element
    if (difficultySelect) {
        // Ensure the initial display state is correct
        updateTimerDisplay();
        difficultySelect.addEventListener('change', (e) => {
            const newVal = difficultySelect.value;
            const confirmed = window.confirm('Switching difficulty will reset the game. Confirm to reset and start the selected difficulty.');
            if (!confirmed) {
                // revert selection
                difficultySelect.value = currentDifficulty;
                return;
            }
            currentDifficulty = newVal;
            resetGame();
        });
    }

// Re-enable difficulty selector when game resets
if (difficultySelect) {
    difficultySelect.disabled = false;
    difficultySelect.setAttribute('aria-disabled', 'false');
    difficultySelect.value = currentDifficulty;
}