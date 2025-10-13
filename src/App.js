import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, RotateCcw, Info, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { Helmet } from 'react-helmet-async';
import {
  trackQuizStart,
  trackQuizComplete,
  trackQuestionAnswer,
  trackQuestionSkip,
  trackQuestionReveal,
  trackSoundToggle,
  trackQuizReset
} from './utils/analytics';
import { questions } from './questions';
import './App.css';


// Target number of correct answers to win - change this for debugging
const TARGET_CORRECT_ANSWERS = 1;

const RockbustersQuiz = () => {
  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load saved progress from localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('rockbusters-progress');
      if (saved) {
        const data = JSON.parse(saved);
        return {
          currentQuestion: data.currentQuestion || 0,
          score: data.score || 0,
          answeredQuestions: new Set(data.answeredQuestions || []),
          skippedQuestions: new Set(data.skippedQuestions || []),
          questionOrder: data.questionOrder || null,
          totalAttempts: data.totalAttempts || 0
        };
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return {
      currentQuestion: 0,
      score: 0,
      answeredQuestions: new Set(),
      skippedQuestions: new Set(),
      questionOrder: null,
      totalAttempts: 0
    };
  };

  const savedData = loadSavedData();
  
  // Initialize shuffled questions (randomize on each load)
  const [questionOrder] = useState(() => {
    return shuffleArray(Array.from({length: questions.length}, (_, i) => i));
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(savedData.currentQuestion);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(savedData.score);
  const [answeredQuestions, setAnsweredQuestions] = useState(savedData.answeredQuestions);
  const [skippedQuestions, setSkippedQuestions] = useState(savedData.skippedQuestions);
  const [revealedQuestions, setRevealedQuestions] = useState(new Set());
  const [totalAttempts, setTotalAttempts] = useState(savedData.totalAttempts || 0);
  const [showResults, setShowResults] = useState(false);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizVisible, setQuizVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const karlHeadRef = useRef(null);
  const inputRef = useRef(null);
  const correctModalButtonRef = useRef(null);

  // Lock body scroll when info modal is open
  useEffect(() => {
    if (showInfoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showInfoModal]);

  // Save progress to localStorage
  const saveProgress = useCallback((questionIndex, newScore, answered, skipped, attempts) => {
    try {
      const progressData = {
        currentQuestion: questionIndex,
        score: newScore,
        answeredQuestions: Array.from(answered),
        skippedQuestions: Array.from(skipped),
        questionOrder: questionOrder,
        totalAttempts: attempts
      };
      localStorage.setItem('rockbusters-progress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [questionOrder]);

  // Sound functions
  const playIndividualCorrectSound = useCallback(() => {
    if (!isSoundEnabled) return;
    const audio = new Audio('/sounds/correct/correct.mp3');
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  }, [isSoundEnabled]);

  const playCorrectSound = useCallback(() => {
    if (!isSoundEnabled) return;
    const audio = new Audio('/sounds/correct/karl-hehey.mp3');
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  }, [isSoundEnabled]);

  const currentQ = questions[questionOrder[currentQuestion]];
  const correctAnswer = currentQ?.answer?.toLowerCase() || '';
  const userInput = userAnswer.toLowerCase();
  
  // Dynamic SEO content based on current state
  const getDynamicTitle = () => {
    if (showResults) {
      return `Quiz Complete! Score: ${score}/${TARGET_CORRECT_ANSWERS} - Rockbusters Quiz`;
    }
    if (currentQ) {
      return `Question ${currentQuestion + 1}: ${currentQ.initials} - Rockbusters Quiz`;
    }
    return 'Rockbusters Quiz - Test Your Knowledge with Karl Pilkington\'s Cryptic Clues';
  };

  const getDynamicDescription = () => {
    if (showResults) {
      return `Quiz completed with ${score} correct answers out of ${TARGET_CORRECT_ANSWERS} in ${totalAttempts} attempts. Challenge yourself with Karl Pilkington's cryptic music clues!`;
    }
    if (currentQ) {
      return `Current clue: "${currentQ.question}" (${currentQ.initials}). Can you guess this artist or band from Karl Pilkington's cryptic clue?`;
    }
    return 'Play the ultimate Rockbusters quiz featuring Karl Pilkington\'s infamous cryptic clues from The Ricky Gervais Show. Test your music knowledge with over 400 questions!';
  };
  
  // Get the full answer including prefilled initials
  const getCompleteAnswer = () => {
    if (!currentQ || !currentQ.initials) return '';
    const initials = currentQ.initials.toLowerCase();
    const words = correctAnswer.split(' ');
    let completeAnswer = '';
    let userIndex = 0;
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      if (wordIndex > 0) {
        completeAnswer += ' ';
      }
      
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        if (letterIndex === 0 && wordIndex < initials.length) {
          // Use the prefilled initial
          completeAnswer += initials[wordIndex];
        } else {
          // Use the user's typed input
          completeAnswer += userInput[userIndex] || '';
          userIndex++;
        }
      }
    }
    
    return completeAnswer;
  };

  // Check if current answer is correct
  const isCurrentAnswerCorrect = getCompleteAnswer() === correctAnswer;

  // Update score when answer becomes correct
  useEffect(() => {
    if (isCurrentAnswerCorrect && !answeredQuestions.has(currentQuestion) && !revealedAnswer) {
      const newScore = score + 1;
      const newAnswered = new Set([...answeredQuestions, currentQuestion]);
      const newAttempts = totalAttempts + 1;
      
      setScore(newScore);
      setAnsweredQuestions(newAnswered);
      setTotalAttempts(newAttempts);

      // Check if we've reached target correct answers (win condition)
      if (newScore >= TARGET_CORRECT_ANSWERS) {
        // Play correct sound when quiz is completed
        playCorrectSound();
        // Track quiz completion
        trackQuizComplete(newScore, newAttempts);
        setShowResults(true);
        localStorage.removeItem('rockbusters-progress');
        return;
      }

      // Play sound for individual correct answer (not on last question)
      playIndividualCorrectSound();

      // Track correct answer
      trackQuestionAnswer(currentQuestion + 1, true, 1);
      
      // Add a slight delay before showing the modal for better UX
      setTimeout(() => {
        setShowCorrectModal(true);
      }, 500);
      
      saveProgress(currentQuestion, newScore, newAnswered, skippedQuestions, newAttempts);
    }
  }, [isCurrentAnswerCorrect, currentQuestion, answeredQuestions, score, skippedQuestions, revealedAnswer, totalAttempts, playCorrectSound, playIndividualCorrectSound, saveProgress]);

  // Animate Karl's head when welcome modal shows
  useEffect(() => {
    if (showWelcomeModal && karlHeadRef.current) {
      gsap.fromTo(karlHeadRef.current, 
        { scale: 0, rotation: 0 }, 
        { 
          scale: 1, 
          rotation: 360, 
          duration: 2, 
          ease: "elastic.out",
          delay: 0.3
        }
      );
    }
  }, [showWelcomeModal]);

  // Focus input when component loads or question changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !showWelcomeModal && !showCorrectModal && !showResults) {
        inputRef.current.focus();
        
        // On mobile, scroll the input into view after keyboard appears
        if (window.innerWidth <= 768) {
          // iOS typically needs more delay for keyboard animation
          const delay = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 300 : 150;
          
          setTimeout(() => {
            inputRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, delay);
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentQuestion, showWelcomeModal, showCorrectModal, showResults]);

  // Handle space key press for correct answer modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showCorrectModal && event.code === 'Space') {
        event.preventDefault();
        // Trigger the button click instead of calling nextQuestion directly
        if (correctModalButtonRef.current) {
          correctModalButtonRef.current.click();
        }
      }
    };

    if (showCorrectModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showCorrectModal]);

  // Focus the correct modal button when modal opens
  useEffect(() => {
    if (showCorrectModal && correctModalButtonRef.current) {
      setTimeout(() => {
        correctModalButtonRef.current.focus();
      }, 100);
    }
  }, [showCorrectModal]);


  const renderMergedInput = () => {
    if (!currentQ) return [];
    const initials = currentQ.initials;
    const words = correctAnswer.split(' ');
    const result = [];
    let charIndex = 0;
    let userInputIndex = 0;

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      const wordChars = [];
      
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        const correctChar = word[letterIndex];
        
        // Determine if this should be prefilled based on initials
        let shouldPrefill = false;
        let prefillChar = '';
        
        if (letterIndex === 0 && wordIndex < initials.length) {
          shouldPrefill = true;
          prefillChar = initials[wordIndex];
        }

        let displayChar;
        let className = 'char ';
        const isCursorHere = !shouldPrefill && userInputIndex === userInput.length;
        
        if (shouldPrefill) {
          displayChar = prefillChar;
          className += 'prefilled';
        } else {
          const userChar = userInput[userInputIndex] || '';
          const hasUserInput = userInputIndex < userInput.length;
          const isCorrect = userChar && userChar.toLowerCase() === correctChar.toLowerCase();
          
          if (hasUserInput) {
            displayChar = userChar;
            className += isCorrect ? 'correct' : 'incorrect';
          } else {
            displayChar = '_';
            className += 'empty';
            if (isCursorHere) {
              className += ' cursor-active';
            }
          }
          userInputIndex++;
        }

        wordChars.push(
          <span key={charIndex} className={className}>
            {displayChar}
            {isCursorHere && (
              <span className="blinking-cursor">|</span>
            )}
          </span>
        );
        charIndex++;
      }
      
      // Wrap each word in a word-group div
      result.push(
        <div key={`word-${wordIndex}`} className="word-group">
          {wordChars}
        </div>
      );
      
      // Add space after word (except last word)
      if (wordIndex < words.length - 1) {
        result.push(
          <span key={`space-${wordIndex}`} className="char space">
            &nbsp;
          </span>
        );
      }
    }

    return result;
  };

  const nextQuestion = () => {
    setShowCorrectModal(false);
    setRevealedAnswer(false);
    if (currentQuestion < questions.length - 1) {
      const newQuestionIndex = currentQuestion + 1;
      setCurrentQuestion(newQuestionIndex);
      setUserAnswer('');
      saveProgress(newQuestionIndex, score, answeredQuestions, skippedQuestions, totalAttempts);
      
      // Focus input after state updates
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          
          // On mobile, scroll into view after keyboard appears
          if (window.innerWidth <= 768) {
            setTimeout(() => {
              inputRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }, 300);
          }
        }
      }, 100);
    } else {
      setShowResults(true);
      // Clear saved progress when quiz is complete
      localStorage.removeItem('rockbusters-progress');
    }
  };

  const skipQuestion = () => {
    // Play skip sound
    playSkipSound();
    
    // Track skip
    trackQuestionSkip(currentQuestion + 1);
    
    const newSkipped = new Set([...skippedQuestions, currentQuestion]);
    const newAttempts = totalAttempts + 1;
    
    setSkippedQuestions(newSkipped);
    setTotalAttempts(newAttempts);
    setRevealedAnswer(false);
    
    if (currentQuestion < questions.length - 1) {
      const newQuestionIndex = currentQuestion + 1;
      setCurrentQuestion(newQuestionIndex);
      setUserAnswer('');
      saveProgress(newQuestionIndex, score, answeredQuestions, newSkipped, newAttempts);
    } else {
      setShowResults(true);
      localStorage.removeItem('rockbusters-progress');
    }
  };

  const resetQuiz = () => {
    // Track quiz reset
    trackQuizReset();
    
    setCurrentQuestion(0);
    setUserAnswer('');
    setScore(0);
    setAnsweredQuestions(new Set());
    setSkippedQuestions(new Set());
    setRevealedQuestions(new Set());
    setTotalAttempts(0);
    setShowResults(false);
    setShowCorrectModal(false);
    setRevealedAnswer(false);
    setShowWelcomeModal(false);
    setShowQuiz(true);
    setQuizVisible(true);
    // Clear saved progress
    localStorage.removeItem('rockbusters-progress');
  };

  const closeWelcomeModal = () => {
    // Play welcome sound
    playWelcomeSound();
    
    // Track quiz start
    trackQuizStart();
    
    setShowWelcomeModal(false);
    
    // Show quiz container first, then fade it in
    setTimeout(() => {
      setShowQuiz(true);
      // Small delay to ensure DOM is ready, then fade in
      setTimeout(() => {
        setQuizVisible(true);
      }, 50);
    }, 100);
    
    // Focus input after welcome modal closes
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        
        // On mobile, scroll into view after keyboard appears
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            inputRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, 300);
        }
      }
    }, 100);
  };

  const playRandomRevealSound = () => {
    if (!isSoundEnabled) return;
    const sounds = ['karl-whats-that.mp3', 'karl-err.mp3', 'karl-look-at-it.mp3', 'karl-its-awkward.mp3', 'karl-who-are-you.mp3'];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(`/sounds/reveal/${randomSound}`);
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };


  const playSkipSound = () => {
    if (!isSoundEnabled) return;
    const sounds = ['karl-what.mp3', 'karl-lot-words.mp3', 'karl-dont-wanna-know.mp3', 'karl-ildas-dead.mp3'];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(`/sounds/skip/${randomSound}`);
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };

  const playWelcomeSound = () => {
    if (!isSoundEnabled) return;
    const audio = new Audio('/sounds/welcome/karl-alright.mp3');
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };

  const revealAnswer = () => {
    // Play random sound
    playRandomRevealSound();
    
    // Track reveal
    trackQuestionReveal(currentQuestion + 1);
    
    // Track this question as revealed
    const newRevealed = new Set([...revealedQuestions, currentQuestion]);
    setRevealedQuestions(newRevealed);
    
    // Set revealed flag first to prevent correct modal from showing
    setRevealedAnswer(true);
    setShowCorrectModal(false);
    
    // Increment attempts for reveal
    const newAttempts = totalAttempts + 1;
    setTotalAttempts(newAttempts);
    
    if (!currentQ || !currentQ.initials) return;
    
    // Calculate what the user should type (excluding prefilled initials and spaces)
    const initials = currentQ.initials.toLowerCase();
    const words = currentQ.answer.toLowerCase().split(' ');
    let userTypedPart = '';
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      // Don't add spaces to userTypedPart - they're handled separately in the display
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        // Check if this is the first letter of a word and we have an initial for it
        const shouldPrefill = letterIndex === 0 && wordIndex < initials.length;
        
        if (!shouldPrefill) {
          userTypedPart += word[letterIndex];
        }
      }
    }
    
    setUserAnswer(userTypedPart);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-head-pattern bg-repeat flex items-center justify-center p-4">
        <div className="bg-white border md:border-0 rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Rockbusters Complete!</h1>
          <div className="text-6xl font-bold text-indigo-600 mb-6">{totalAttempts}</div>
          <div className="mb-8">
            <p className="text-xl mb-4">You got {TARGET_CORRECT_ANSWERS} correct answers in <strong>{totalAttempts}</strong> attempts!</p>
            <p>
              {totalAttempts <= 25
                ? "Outstanding! You're a true Rockbusters legend!" 
                : totalAttempts <= 35
                ? "Excellent work! Karl would be proud!"
                : totalAttempts <= 50
                ? "Good job! You know your music!"
                : "Not bad! The clues don't work, right?"}
            </p>
            <p className="text-gray-600 font-medium">
              Correct: {score} | Skipped/Revealed: {skippedQuestions.size + revealedQuestions.size}
            </p>
          </div>
          <div className='flex flex-row gap-4 justify-center'>
            <button type="button" onClick={resetQuiz} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center gap-3">
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
              {/* Buy Me a Coffee Button */}
              <a
                href="https://www.buymeacoffee.com/sjw87"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-3 rounded-lg justify-center shadow font-bold border border-gray-100 text-black hover:bg-gray-100 transition-colors"
              >
                <span role="img" aria-label="coffee" className="mr-2">☕</span>
                Buy me a coffee
              </a>
          </div>

        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getDynamicTitle()}</title>
        <meta name="description" content={getDynamicDescription()} />
        <meta property="og:title" content={getDynamicTitle()} />
        <meta property="og:description" content={getDynamicDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rockbusters-quiz.com/" />
        <meta property="og:image" content="https://rockbusters-quiz.com/og-image.jpg" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={getDynamicTitle()} />
        <meta property="twitter:description" content={getDynamicDescription()} />
        <meta property="twitter:image" content="https://rockbusters-quiz.com/og-image.jpg" />
        <link rel="canonical" href="https://rockbusters-quiz.com/" />
        {showResults && <meta name="robots" content="noindex" />}
      </Helmet>
      <div className="min-h-screen bg-head-pattern bg-repeat flex items-center justify-center md:p-4">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <div className="modal-content welcome-modal">
            <picture>
              <source srcSet="/karl-head.webp" type="image/webp" />
              <img ref={karlHeadRef} src="/karl-head.png" alt="Karl Pilkington" className="w-20 md:w-32 mx-auto" />
            </picture>
            <h2 id="welcome-title" className="text-2xl md:text-4xl mt-0 md:mt-4">Welcome to Rockbusters!</h2>

            <div className="welcome-instructions">
              <p className="font-semibold text-gray-800 mb-2">How to play:</p>
              <p>• Read Karl's cryptic clue</p>
              <p>• Use the initials as a hint</p>
              <p>• Type your answer - first letters are prefilled</p>
              <p>• Click Skip if you're stuck, or Reveal to see the answer</p>
            </div>
            <button type="button" onClick={closeWelcomeModal} className="next-button py-2 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 px-10">
              Alright
            </button>
          </div>
        </div>
      )}

      {/* Correct Answer Modal */}
      {showCorrectModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="correct-title">
          <div className="modal-content">
            <div className="celebration">🎉</div>
            <h2 id="correct-title" className='font-bold text-2xl mb-1'>Correct!</h2>
            <p className="answer-reveal">The answer was: <strong>{currentQ?.answer}</strong></p>
            {currentQ?.sound && (
              <p className="sound-reveal">Karls pronounciation: <em>{currentQ.sound}</em></p>
            )}
            <button 
              ref={correctModalButtonRef}
              type="button" 
              onClick={nextQuestion} 
              className="next-button py-2 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 w-full mt-4"
            >
              {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="info-title">
          <div className="modal-content">
            <div className="text-center mb-4">
              <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 id="info-title" className="text-2xl font-bold text-gray-800 mb-4">About Rockbusters</h2>
            </div>
            <div className="text-left space-y-4">
              <p className="text-gray-700 text-sm md:text-md">
                <strong>Rockbusters</strong> was a quiz segment from The Ricky Gervais Show on XFM radio, 
                hosted by Karl Pilkington from 2001-2005.
              </p>
              <p className="text-gray-700 text-sm md:text-md">
                Karl would give cryptic clues that were supposed to sound like band names or artists, 
                along with their initials. The clues were often confusing, barely made sense, or had 
                tenuous connections to the actual answers.
              </p>
              <p className="text-gray-700 text-sm md:text-md">
                <strong>How to play:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm md:text-md">
                <li>Read Karl's cryptic clue</li>
                <li>Use the initials as a hint</li>
                <li>Type your answer - first letters are prefilled</li>
                <li>Click Skip if you're stuck</li>
                <li>Click Reveal to see the answer</li>
              </ul>
              <a href="mailto:ricky.gervais@xfm.co.uk" className="text-blue-500 hover:underline mt-4 flex text-sm md:text-md">
                Submit your question and answers here
              </a>
              <p className="text-gray-700 text-sm md:text-md !mt-6">
                <strong>Support the developer:</strong>
              </p>
              <div className="flex justify-center mt-4">
                {/* Buy Me a Coffee Button */}
                <a
                  href="https://www.buymeacoffee.com/sjw87"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-3 rounded-lg w-full justify-center shadow font-bold border border-gray-100 text-black hover:bg-gray-100 transition-colors"
                >
                  <span role="img" aria-label="coffee" className="mr-2">☕</span>
                  Buy me a coffee
                </a>
              </div>
            </div>
            <hr className="mb-0 mt-6 md:hidden" />
            <button 
              type="button"
              onClick={() => setShowInfoModal(false)} 
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-blue-700"
            >
              Alright, cheers
            </button>
          </div>
        </div>
      )}
      {/* Off-canvas Menu */}
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${showMenu ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
          onClick={() => setShowMenu(false)}
        ></div>
        
        {/* Menu Panel */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true" aria-labelledby="menu-title">
          {/* Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 id="menu-title" className="text-xl font-bold text-gray-800">Menu</h3>
            <button 
              type="button"
              onClick={() => setShowMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Menu Items */}
          <div className="p-6 space-y-4">
            <button 
              type="button"
              onClick={() => {
                setShowInfoModal(true);
                setShowMenu(false);
              }}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            >
              <Info className="w-5 h-5 text-blue-500" />
              <span className="text-gray-800 font-medium">Info</span>
            </button>
            
            <button 
              type="button"
              onClick={() => {
                const newSoundState = !isSoundEnabled;
                setIsSoundEnabled(newSoundState);
                trackSoundToggle(newSoundState);
              }}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            >
              {isSoundEnabled ? (
                <>
                  <Volume2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-800 font-medium">Turn Sound Off</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5 text-red-500" />
                  <span className="text-gray-800 font-medium">Turn Sound On</span>
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                resetQuiz();
                setShowMenu(false);
              }}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            >
              <RotateCcw className="w-5 h-5 text-red-500" />
              <span className="text-gray-800 font-medium">Reset Game</span>
            </button>
          </div>
        </div>
      </>

      {showQuiz && (
        <div className={`bg-white md:rounded-2xl md:shadow-xl md:border md:border-[#f2f2f2] p-4 md:p-16 max-w-5xl w-full h-screen md:h-full transition-opacity duration-500 ${quizVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-2 md:mb-4">
          <div className="flex flex-row justify-between items-center mb-4 gap-y-4">
            <div className='flex flex-row items-center'>
              <picture>
                <source srcSet="/karl-head.webp" type="image/webp" width="64" height="64" />
                <img src="/karl-head.png" alt="Karl Pilkington" width="64" height="64" className="w-16 h-24 object-cover ml-0 mr-2 md:mx-2" />
              </picture>
              <div className='flex flex-col items-start'>
                <h1 className="text-2xl md:text-5xl font-bold text-gray-800 flex items-center">
                  Rockbusters
                </h1>
                <span className='text-[11px] md:text-xs opacity-60'>AKA And the clues dont work</span>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Desktop buttons */}
              <div className="hidden md:flex gap-2">
                <button onClick={() => setShowInfoModal(true)} type="button" className="bg-blue-500 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-blue-600 transition-colors" aria-label="Show game information">
                  <Info className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  const newSoundState = !isSoundEnabled;
                  setIsSoundEnabled(newSoundState);
                  trackSoundToggle(newSoundState);
                }} type="button" className="bg-green-500 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-green-600 transition-colors" aria-label={isSoundEnabled ? "Turn sound off" : "Turn sound on"}>
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={resetQuiz} type="button" className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-red-600 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
              
              {/* Mobile hamburger menu */}
              <button onClick={() => setShowMenu(true)} type="button" className="md:hidden text-black hover:text-gray-600 transition-colors" aria-label="Open menu">
                <Menu className="w-8 h-8" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg text-gray-600">
            <span>Correct: {score}/{TARGET_CORRECT_ANSWERS}</span>
            <span>Attempts: {totalAttempts}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(score / TARGET_CORRECT_ANSWERS) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Cryptic clue</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-0 leading-tight">"{currentQ?.question}"</p>
            {(currentQ?.series || currentQ?.rockbusters || currentQ?.date) && (
              <p className="text-xs text-gray-400 mt-3 font-normal leading-relaxed">
                {currentQ.series && <span>{currentQ.series}</span>}
                {currentQ.rockbusters && <span> • Rockbusters #{currentQ.rockbusters}</span>}
                {currentQ.date && <span> • {currentQ.date}</span>}
              </p>
            )}
          </div>
        </div>

        {/* Merged Answer Input */}
        <div className="mb-8 text-center">
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Your Answer <b>(Initials: {currentQ?.initials}):</b>
          </div>
          <div 
            className="inline-block mb-2 mx-auto transition-all duration-200 cursor-text hover:border-gray-400 relative"
            tabIndex={0}
            role="textbox"
            aria-label={`Answer input for ${currentQ?.initials} clue`}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.focus();
                
                // On mobile, scroll into view after keyboard appears
                if (window.innerWidth <= 768) {
                  const delay = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 300 : 150;
                  setTimeout(() => {
                    inputRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                      inline: 'nearest'
                    });
                  }, delay);
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (inputRef.current) {
                  inputRef.current.focus();
                  
                  // On mobile, scroll into view after keyboard appears
                  if (window.innerWidth <= 768) {
                    const delay = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 300 : 150;
                    setTimeout(() => {
                      inputRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                      });
                    }, delay);
                  }
                }
                e.preventDefault();
              }
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder=""
              autoComplete="off"
              className="absolute top-0 left-0 w-full h-full opacity-0 bg-transparent border-none outline-none text-4xl p-0 m-0 z-10"
              autoFocus
              aria-label={`Answer input for ${currentQ?.initials} clue`}
            />
            <div className="text-4xl font-mono tracking-wider min-h-16 flex flex-wrap items-center justify-center leading-tight relative pointer-events-none answer-input-mobile">
              {renderMergedInput()}
            </div>
          </div>

          {isCurrentAnswerCorrect && !revealedAnswer && (
            <div className="mt-6 p-5 bg-green-50 border-2 border-green-200 rounded-2xl text-green-700 font-semibold text-xl flex items-center justify-center gap-3 animate-pulse">
              ✅ Correct! Well done!
            </div>
          )}
          {revealedAnswer && currentQ?.sound && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
              <p className="text-lg"><strong>Karls pronounciation:</strong> <em>{currentQ.sound}</em></p>
            </div>
          )}
        </div>

        {/* Controls */}
        {/* Mobile: skip/reveal top row, next on second row. Desktop: all in one row */}
        <div className="flex flex-col gap-2 md:flex-row md:justify-center md:items-center md:gap-4">
          <div className="flex md:justify-center items-center gap-4 md:gap-4">
            <button
              onClick={skipQuestion}
              type="button"
              disabled={revealedAnswer}
              className="w-full md:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              Skip
            </button>
            <button
              onClick={revealAnswer}
              type="button"
              disabled={revealedAnswer}
              className="w-full md:w-auto px-8 py-3 bg-yellow-500 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              Reveal
            </button>
            {/* On desktop, next button is here */}
            <button
              onClick={nextQuestion}
              type="button"
              disabled={!isCurrentAnswerCorrect && !revealedAnswer}
              className="hidden md:flex items-center gap-0 px-7 py-3 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* On mobile, next button is on its own row */}
          <div className="flex justify-center items-center md:hidden">
            <button
              onClick={nextQuestion}
              type="button"
              disabled={!isCurrentAnswerCorrect && !revealedAnswer}
              className="flex items-center gap-0 px-7 py-3 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed w-full text-center justify-center"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}
      </div>
    </>
  );
};

export default RockbustersQuiz;